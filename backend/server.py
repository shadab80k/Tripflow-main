from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, date, time, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get('DB_NAME', 'tripflow_dev')
db = client[db_name]

# Create the main app without a prefix
app = FastAPI(
    title="Tripflow API",
    description="AI-Powered Trip Planning Platform API",
    version="1.0.0"
)

# Add CORS middleware first - before any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Helper functions for MongoDB serialization
def prepare_for_mongo(data):
    """Convert Python objects to MongoDB-compatible format"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, date) and not isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, time):
                data[key] = value.strftime('%H:%M:%S')
    return data

def parse_from_mongo(item):
    """Parse MongoDB data back to Python objects"""
    if isinstance(item, dict):
        for key, value in item.items():
            if key.endswith('_date') and isinstance(value, str):
                try:
                    item[key] = datetime.fromisoformat(value).date()
                except:
                    pass
            elif key.endswith('_time') and isinstance(value, str):
                try:
                    item[key] = datetime.strptime(value, '%H:%M:%S').time()
                except:
                    pass
    return item

# Pydantic Models
class Activity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    trip_id: str
    day_id: str
    title: str
    start_time: str  # Store as string "HH:MM"
    end_time: str    # Store as string "HH:MM"
    location_text: Optional[str] = None
    category: Optional[str] = "general"
    notes: Optional[str] = None
    cost: Optional[float] = 0.0
    priority: Optional[str] = "medium"
    color: Optional[str] = "#3b82f6"
    order_index: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ActivityCreate(BaseModel):
    title: str
    start_time: str
    end_time: str
    location_text: Optional[str] = None
    category: Optional[str] = "general"
    notes: Optional[str] = None
    cost: Optional[float] = 0.0
    priority: Optional[str] = "medium"
    color: Optional[str] = "#3b82f6"

class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location_text: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    cost: Optional[float] = None
    priority: Optional[str] = None
    color: Optional[str] = None
    day_id: Optional[str] = None
    order_index: Optional[int] = None

class Day(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    trip_id: str
    date: str  # Store as ISO date string
    index: int  # Day 1, Day 2, etc.
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DayCreate(BaseModel):
    date: str
    index: int
    notes: Optional[str] = None

class Trip(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    date_start: str  # Store as ISO date string
    date_end: str    # Store as ISO date string
    currency: Optional[str] = "USD"
    theme: Optional[str] = "blue"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TripCreate(BaseModel):
    title: str
    date_start: str
    date_end: str
    currency: Optional[str] = "USD"
    theme: Optional[str] = "blue"

class TripWithDays(BaseModel):
    trip: Trip
    days: List[Day]
    activities: List[Activity]

# API Routes

# Root endpoint for health checks (Render deployment)
@app.get("/")
async def root():
    return {
        "message": "Tripflow API is running!", 
        "status": "healthy",
        "service": "tripflow-backend",
        "version": "1.0.0"
    }

@api_router.get("/")
async def api_root():
    return {"message": "Tripflow API is running!", "status": "healthy"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "tripflow-backend"}

@api_router.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle CORS preflight requests"""
    return {"message": "OK"}

# Trip endpoints
@api_router.post("/trips", response_model=Trip)
async def create_trip(trip_data: TripCreate):
    trip_dict = trip_data.dict()
    trip_obj = Trip(**trip_dict)
    trip_mongo = prepare_for_mongo(trip_obj.dict())
    await db.trips.insert_one(trip_mongo)
    return trip_obj

@api_router.get("/trips", response_model=List[Trip])
async def get_trips():
    trips = await db.trips.find().to_list(1000)
    return [Trip(**parse_from_mongo(trip)) for trip in trips]

@api_router.get("/trips/{trip_id}", response_model=TripWithDays)
async def get_trip_with_details(trip_id: str):
    # Get trip
    trip = await db.trips.find_one({"id": trip_id})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Get days for this trip
    days = await db.days.find({"trip_id": trip_id}).sort("index", 1).to_list(1000)
    
    # Get activities for this trip
    activities = await db.activities.find({"trip_id": trip_id}).sort("order_index", 1).to_list(1000)
    
    return TripWithDays(
        trip=Trip(**parse_from_mongo(trip)),
        days=[Day(**parse_from_mongo(day)) for day in days],
        activities=[Activity(**parse_from_mongo(activity)) for activity in activities]
    )

@api_router.delete("/trips/{trip_id}")
async def delete_trip(trip_id: str):
    # Delete all activities and days for this trip first
    await db.activities.delete_many({"trip_id": trip_id})
    await db.days.delete_many({"trip_id": trip_id})
    
    # Delete the trip
    result = await db.trips.delete_one({"id": trip_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"message": "Trip deleted successfully"}

# Day endpoints
@api_router.post("/trips/{trip_id}/days", response_model=Day)
async def create_day(trip_id: str, day_data: DayCreate):
    day_dict = day_data.dict()
    day_dict["trip_id"] = trip_id
    day_obj = Day(**day_dict)
    day_mongo = prepare_for_mongo(day_obj.dict())
    await db.days.insert_one(day_mongo)
    return day_obj

# Activity endpoints
@api_router.post("/trips/{trip_id}/days/{day_id}/activities", response_model=Activity)
async def create_activity(trip_id: str, day_id: str, activity_data: ActivityCreate):
    # Get current max order_index for this day
    existing_activities = await db.activities.find({"day_id": day_id}).to_list(1000)
    max_order = max([act.get("order_index", 0) for act in existing_activities], default=-1)
    
    activity_dict = activity_data.dict()
    activity_dict["trip_id"] = trip_id
    activity_dict["day_id"] = day_id
    activity_dict["order_index"] = max_order + 1
    
    activity_obj = Activity(**activity_dict)
    activity_mongo = prepare_for_mongo(activity_obj.dict())
    await db.activities.insert_one(activity_mongo)
    return activity_obj

@api_router.put("/activities/{activity_id}", response_model=Activity)
async def update_activity(activity_id: str, activity_data: ActivityUpdate):
    update_dict = {k: v for k, v in activity_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    update_mongo = prepare_for_mongo(update_dict)
    result = await db.activities.update_one(
        {"id": activity_id},
        {"$set": update_mongo}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    updated_activity = await db.activities.find_one({"id": activity_id})
    return Activity(**parse_from_mongo(updated_activity))

@api_router.delete("/activities/{activity_id}")
async def delete_activity(activity_id: str):
    result = await db.activities.delete_one({"id": activity_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"message": "Activity deleted successfully"}

@api_router.post("/activities/reorder")
async def reorder_activities(updates: List[dict]):
    """Bulk update activity orders and day assignments for drag-and-drop"""
    for update in updates:
        activity_id = update.get("id")
        new_order = update.get("order_index")
        new_day_id = update.get("day_id")
        
        update_data = {"order_index": new_order}
        if new_day_id:
            update_data["day_id"] = new_day_id
        update_data["updated_at"] = datetime.now(timezone.utc)
        
        await db.activities.update_one(
            {"id": activity_id},
            {"$set": update_data}
        )
    
    return {"message": "Activities reordered successfully"}

# Include the router in the main app
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()