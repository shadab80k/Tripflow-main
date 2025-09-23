import requests
import sys
import json
from datetime import datetime, date, timedelta

class TripflowAPITester:
    def __init__(self, base_url="https://journeyflow-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.trip_id = None
        self.day_ids = []
        self.activity_ids = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_create_trip(self):
        """Test creating a new trip"""
        today = date.today()
        trip_data = {
            "title": "Tokyo Adventure Test",
            "date_start": today.isoformat(),
            "date_end": (today + timedelta(days=2)).isoformat(),
            "currency": "USD",
            "theme": "blue"
        }
        
        success, response = self.run_test("Create Trip", "POST", "trips", 200, data=trip_data)
        if success and 'id' in response:
            self.trip_id = response['id']
            print(f"   Created trip with ID: {self.trip_id}")
        return success

    def test_get_trips(self):
        """Test getting all trips"""
        return self.run_test("Get All Trips", "GET", "trips", 200)

    def test_create_days(self):
        """Test creating days for the trip"""
        if not self.trip_id:
            print("❌ No trip ID available for creating days")
            return False

        today = date.today()
        success_count = 0
        
        for i in range(3):  # Create 3 days
            day_data = {
                "date": (today + timedelta(days=i)).isoformat(),
                "index": i + 1,
                "notes": f"Day {i + 1} notes"
            }
            
            success, response = self.run_test(
                f"Create Day {i + 1}", 
                "POST", 
                f"trips/{self.trip_id}/days", 
                200, 
                data=day_data
            )
            
            if success and 'id' in response:
                self.day_ids.append(response['id'])
                success_count += 1
        
        return success_count == 3

    def test_get_trip_with_details(self):
        """Test getting trip with days and activities"""
        if not self.trip_id:
            print("❌ No trip ID available for getting trip details")
            return False
            
        return self.run_test("Get Trip Details", "GET", f"trips/{self.trip_id}", 200)

    def test_create_activities(self):
        """Test creating activities for different days"""
        if not self.day_ids:
            print("❌ No day IDs available for creating activities")
            return False

        activities_data = [
            {
                "day_index": 0,
                "activity": {
                    "title": "Arrival at Narita Airport",
                    "start_time": "14:00",
                    "end_time": "15:00",
                    "location_text": "Narita International Airport",
                    "category": "transport",
                    "notes": "Flight arrival",
                    "cost": 0.0
                }
            },
            {
                "day_index": 0,
                "activity": {
                    "title": "Hotel Check-in",
                    "start_time": "16:00",
                    "end_time": "17:00",
                    "location_text": "Tokyo Hotel",
                    "category": "accommodation",
                    "notes": "Check into hotel",
                    "cost": 150.0
                }
            },
            {
                "day_index": 1,
                "activity": {
                    "title": "Tokyo Tower Visit",
                    "start_time": "10:00",
                    "end_time": "12:00",
                    "location_text": "Tokyo Tower",
                    "category": "sightseeing",
                    "notes": "Visit iconic tower",
                    "cost": 25.0
                }
            },
            {
                "day_index": 1,
                "activity": {
                    "title": "Ramen Lunch",
                    "start_time": "12:30",
                    "end_time": "13:30",
                    "location_text": "Ramen Shop",
                    "category": "food",
                    "notes": "Try authentic ramen",
                    "cost": 15.0
                }
            },
            {
                "day_index": 2,
                "activity": {
                    "title": "Shopping in Shibuya",
                    "start_time": "11:00",
                    "end_time": "15:00",
                    "location_text": "Shibuya District",
                    "category": "entertainment",
                    "notes": "Shopping and exploring",
                    "cost": 200.0
                }
            }
        ]

        success_count = 0
        for item in activities_data:
            day_id = self.day_ids[item["day_index"]]
            activity_data = item["activity"]
            
            success, response = self.run_test(
                f"Create Activity: {activity_data['title']}", 
                "POST", 
                f"trips/{self.trip_id}/days/{day_id}/activities", 
                200, 
                data=activity_data
            )
            
            if success and 'id' in response:
                self.activity_ids.append(response['id'])
                success_count += 1

        return success_count == len(activities_data)

    def test_update_activity(self):
        """Test updating an existing activity"""
        if not self.activity_ids:
            print("❌ No activity IDs available for updating")
            return False

        activity_id = self.activity_ids[0]
        update_data = {
            "title": "Updated: Arrival at Narita Airport",
            "cost": 50.0,
            "notes": "Updated flight arrival with taxi cost"
        }
        
        return self.run_test("Update Activity", "PUT", f"activities/{activity_id}", 200, data=update_data)

    def test_reorder_activities(self):
        """Test bulk reordering activities (drag-and-drop simulation)"""
        if len(self.activity_ids) < 2 or len(self.day_ids) < 2:
            print("❌ Not enough activities or days for reorder test")
            return False

        # Simulate moving first activity to second day and reordering
        reorder_data = [
            {
                "id": self.activity_ids[0],
                "day_id": self.day_ids[1],  # Move to day 2
                "order_index": 0
            },
            {
                "id": self.activity_ids[1],
                "day_id": self.day_ids[0],  # Keep in day 1
                "order_index": 0
            }
        ]
        
        return self.run_test("Reorder Activities", "POST", "activities/reorder", 200, data=reorder_data)

    def test_delete_activity(self):
        """Test deleting an activity"""
        if not self.activity_ids:
            print("❌ No activity IDs available for deletion")
            return False

        activity_id = self.activity_ids[-1]  # Delete last activity
        return self.run_test("Delete Activity", "DELETE", f"activities/{activity_id}", 200)

    def test_delete_trip(self):
        """Test deleting the entire trip"""
        if not self.trip_id:
            print("❌ No trip ID available for deletion")
            return False
            
        return self.run_test("Delete Trip", "DELETE", f"trips/{self.trip_id}", 200)

def main():
    print("🚀 Starting Tripflow API Tests...")
    print("=" * 50)
    
    tester = TripflowAPITester()
    
    # Run all tests in sequence
    test_methods = [
        tester.test_root_endpoint,
        tester.test_create_trip,
        tester.test_get_trips,
        tester.test_create_days,
        tester.test_get_trip_with_details,
        tester.test_create_activities,
        tester.test_update_activity,
        tester.test_reorder_activities,
        tester.test_delete_activity,
        # tester.test_delete_trip,  # Comment out to keep test data for frontend testing
    ]
    
    for test_method in test_methods:
        try:
            test_method()
        except Exception as e:
            print(f"❌ Test {test_method.__name__} failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! Backend APIs are working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())