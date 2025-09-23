import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { format, parseISO, differenceInDays } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import UI components
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet';
import { Alert, AlertDescription } from './components/ui/alert';
import { Progress } from './components/ui/progress';
import { useToast, toast } from './hooks/use-toast';
import { Toaster } from './components/ui/toaster';

// Import icons
import { 
  Plus, Clock, MapPin, DollarSign, Calendar, Trash2, Edit3, 
  Map, Download, Filter, Search, Share2, Copy, AlertTriangle,
  Plane, Car, Camera, Utensils, Bed, Star, ChevronDown,
  BarChart3, PieChart, TrendingUp, Users, Globe2,
  Sparkles, Sun, Moon, Settings, Menu, X, Play
} from 'lucide-react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Currency symbol mapping
const getCurrencySymbol = (currency) => {
  const symbols = {
    'USD': '$',
    'EUR': '€', 
    'GBP': '£',
    'INR': '₹',
    'JPY': '¥',
    'CAD': '$',
    'AUD': '$'
  };
  return symbols[currency] || '$';
};

// Fix leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Enhanced Sortable Activity Card Component
function SortableActivityCard({ activity, onEdit, onDelete, showConflict = false, currency = 'USD' }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  const getCategoryInfo = (category) => {
    const categories = {
      food: { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: Utensils, bg: 'bg-gradient-to-r from-orange-500 to-red-500' },
      sightseeing: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Camera, bg: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
      transport: { color: 'bg-green-50 text-green-700 border-green-200', icon: Car, bg: 'bg-gradient-to-r from-green-500 to-emerald-500' },
      accommodation: { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Bed, bg: 'bg-gradient-to-r from-purple-500 to-indigo-500' },
      entertainment: { color: 'bg-pink-50 text-pink-700 border-pink-200', icon: Star, bg: 'bg-gradient-to-r from-pink-500 to-rose-500' },
      general: { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: Sparkles, bg: 'bg-gradient-to-r from-gray-500 to-slate-500' },
    };
    return categories[category] || categories.general;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const categoryInfo = getCategoryInfo(activity.category);
  const Icon = categoryInfo.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none group"
    >
      <Card className={`mb-4 hover:shadow-xl transition-all duration-300 cursor-grab active:cursor-grabbing border-0 overflow-hidden ${isDragging ? 'rotate-2 scale-105' : ''}`}>
        <div className={`h-1 ${categoryInfo.bg}`} />
        
        <CardContent className="p-4 relative">
          {showConflict && (
            <div className="absolute -top-1 -right-1 z-10">
              <Badge variant="destructive" className="text-xs px-2 py-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Conflict
              </Badge>
            </div>
          )}
          
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg ${categoryInfo.color} flex-shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-base leading-tight mb-1 text-gray-900">{activity.title}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{formatTime(activity.start_time)} - {formatTime(activity.end_time)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(activity);
                }}
              >
                <Edit3 className="h-4 w-4 text-blue-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(activity.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
          
          {activity.location_text && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="truncate">{activity.location_text}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={`text-xs font-medium ${categoryInfo.color}`}>
              {activity.category}
            </Badge>
            
            {activity.cost > 0 && (
              <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                <span>{getCurrencySymbol(currency)}{activity.cost}</span>
              </div>
            )}
          </div>
          
          {activity.notes && (
            <p className="text-sm text-gray-500 mt-3 line-clamp-2 bg-gray-50 p-2 rounded-md">{activity.notes}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced Day Column Component
function DayColumn({ day, activities, onAddActivity, onEditActivity, onDeleteActivity, currency = 'USD' }) {
  const dayActivities = activities.filter(activity => activity.day_id === day.id);
  const totalCost = dayActivities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
  const activityCount = dayActivities.length;
  const currencySymbol = getCurrencySymbol(currency);

  // Check for time conflicts
  const hasConflicts = useMemo(() => {
    const conflicts = new Set();
    const sortedActivities = [...dayActivities].sort((a, b) => a.start_time.localeCompare(b.start_time));
    
    for (let i = 0; i < sortedActivities.length - 1; i++) {
      const current = sortedActivities[i];
      const next = sortedActivities[i + 1];
      
      if (current.end_time > next.start_time) {
        conflicts.add(current.id);
        conflicts.add(next.id);
      }
    }
    
    return conflicts;
  }, [dayActivities]);

  const formatDate = (dateStr) => {
    const date = parseISO(dateStr);
    return format(date, 'EEE, MMM d');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 min-w-80 md:min-w-96 w-full md:w-auto h-fit">
      {/* Day Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3 sm:gap-0">
        <div className="flex-1">
          <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-1">Day {day.index}</h3>
          <p className="text-xs md:text-sm text-gray-600 font-medium">{formatDate(day.date)}</p>
        </div>
        <div className="flex sm:flex-col sm:text-right gap-4 sm:gap-0">
          <div className="text-center sm:text-right">
            <div className="text-xl md:text-2xl font-bold text-gray-900">{activityCount}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Activities</div>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-base md:text-lg font-bold text-green-600">{currencySymbol}{totalCost.toFixed(2)}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide sm:hidden">Total</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Day Progress</span>
          <span>{Math.min(activityCount * 20, 100)}%</span>
        </div>
        <Progress value={Math.min(activityCount * 20, 100)} className="h-2" />
      </div>

      {/* Activities */}
      <SortableContext items={dayActivities.map(a => a.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 mb-6 min-h-40">
          {dayActivities
            .sort((a, b) => a.order_index - b.order_index)
            .map((activity) => (
              <SortableActivityCard
                key={activity.id}
                activity={activity}
                onEdit={onEditActivity}
                onDelete={onDeleteActivity}
                showConflict={hasConflicts.has(activity.id)}
                currency={currency}
              />
            ))}
        </div>
      </SortableContext>

      {/* Add Activity Button */}
      <Button
        variant="outline"
        className="w-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 py-6"
        onClick={() => onAddActivity(day.id)}
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Activity
      </Button>
    </div>
  );
}

// Enhanced Activity Form Dialog
function ActivityDialog({ open, onOpenChange, activity, dayId, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    start_time: '09:00',
    end_time: '10:00',
    location_text: '',
    category: 'general',
    notes: '',
    cost: 0,
    priority: 'medium',
    color: '#3b82f6'
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title || '',
        start_time: activity.start_time || '09:00',
        end_time: activity.end_time || '10:00',
        location_text: activity.location_text || '',
        category: activity.category || 'general',
        notes: activity.notes || '',
        cost: activity.cost || 0,
        priority: activity.priority || 'medium',
        color: activity.color || '#3b82f6'
      });
    } else {
      setFormData({
        title: '',
        start_time: '09:00',
        end_time: '10:00',
        location_text: '',
        category: 'general',
        notes: '',
        cost: 0,
        priority: 'medium',
        color: '#3b82f6'
      });
    }
  }, [activity, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {activity ? 'Edit Activity' : 'Add New Activity'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-base font-semibold">Activity Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter activity title"
                className="mt-2 h-12 text-base"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time" className="text-base font-semibold">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  className="mt-2 h-12"
                />
              </div>
              <div>
                <Label htmlFor="end_time" className="text-base font-semibold">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  className="mt-2 h-12"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-base font-semibold">Location</Label>
              <Input
                id="location"
                value={formData.location_text}
                onChange={(e) => setFormData({...formData, location_text: e.target.value})}
                placeholder="Enter location or address"
                className="mt-2 h-12 text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-base font-semibold">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="mt-2 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="food">Food & Dining</SelectItem>
                    <SelectItem value="sightseeing">Sightseeing</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="accommodation">Accommodation</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cost" className="text-base font-semibold">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
                  className="mt-2 h-12"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-base font-semibold">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Add any additional notes or details..."
                className="mt-2 min-h-24 text-base"
                rows={4}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-6 order-2 sm:order-1">
              Cancel
            </Button>
            <Button type="submit" className="px-6 order-1 sm:order-2">
              {activity ? 'Update Activity' : 'Add Activity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Map Component
function TripMap({ activities, center = [35.6762, 139.6503] }) {
  const [mapReady, setMapReady] = useState(false);
  
  const activitiesWithCoords = activities.filter(activity => 
    activity.location_text && activity.location_text.trim() !== ''
  );

  // Mock coordinates for demo - in real app, you'd geocode the addresses
  const mockCoordinates = {
    'Narita International Airport': [35.7647, 140.3864],
    'Tokyo Hotel': [35.6762, 139.6503],
    'Tokyo Tower': [35.6586, 139.7454],
    'Ramen Shop': [35.6938, 139.7036],
    'Shibuya District': [35.6598, 139.7006],
  };

  const getCoordinates = (location) => {
    const coords = mockCoordinates[location];
    if (coords) return coords;
    
    // Default to Tokyo center with slight randomization
    return [
      35.6762 + (Math.random() - 0.5) * 0.02,
      139.6503 + (Math.random() - 0.5) * 0.02
    ];
  };

  const markers = activitiesWithCoords.map((activity, index) => ({
    ...activity,
    position: getCoordinates(activity.location_text),
    index: index + 1
  }));

  const polylinePositions = markers.map(marker => marker.position);

  return (
    <div className="h-64 md:h-96 w-full rounded-xl overflow-hidden border-2 border-gray-200">
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map((marker, index) => (
          <Marker key={marker.id} position={marker.position}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm">{marker.index}. {marker.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{marker.location_text}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {marker.start_time} - {marker.end_time}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {polylinePositions.length > 1 && (
          <Polyline 
            positions={polylinePositions} 
            color="blue" 
            weight={3}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
}

// Export Functions
const exportToPDF = async (tripData, days, activities) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Title
  pdf.setFontSize(24);
  pdf.text(tripData.title, pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text(`${tripData.date_start} to ${tripData.date_end}`, pageWidth / 2, 30, { align: 'center' });
  
  let yPosition = 50;
  
  days.forEach((day, dayIndex) => {
    const dayActivities = activities.filter(a => a.day_id === day.id);
    
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFontSize(16);
    pdf.text(`Day ${day.index} - ${format(parseISO(day.date), 'EEEE, MMMM d')}`, 20, yPosition);
    yPosition += 10;
    
    dayActivities.forEach((activity) => {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.text(`${activity.start_time} - ${activity.end_time}: ${activity.title}`, 25, yPosition);
      yPosition += 5;
      
      if (activity.location_text) {
        pdf.setFontSize(10);
        pdf.text(`📍 ${activity.location_text}`, 30, yPosition);
        yPosition += 5;
      }
      
      if (activity.cost > 0) {
        pdf.text(`💰 $${activity.cost}`, 30, yPosition);
        yPosition += 5;
      }
      
      yPosition += 3;
    });
    
    yPosition += 10;
  });
  
  pdf.save(`${tripData.title}.pdf`);
};

const exportToCSV = (tripData, days, activities) => {
  const csvData = activities.map(activity => {
    const day = days.find(d => d.id === activity.day_id);
    return {
      'Trip': tripData.title,
      'Day': day ? day.index : '',
      'Date': day ? day.date : '',
      'Activity': activity.title,
      'Start Time': activity.start_time,
      'End Time': activity.end_time,
      'Location': activity.location_text || '',
      'Category': activity.category,
      'Cost': activity.cost,
      'Notes': activity.notes || ''
    };
  });
  
  const csvContent = [
    Object.keys(csvData[0]).join(','),
    ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${tripData.title}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

// Enhanced Trip Planner Component
function TripPlanner() {
  const { tripId } = useParams();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [days, setDays] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activeTab, setActiveTab] = useState('planner');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadTripData();
  }, [tripId]);

  const loadTripData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/trips/${tripId}`);
      const data = response.data;
      setTripData(data.trip);
      setDays(data.days);
      setActivities(data.activities);
    } catch (error) {
      console.error('Error loading trip data:', error);
      toast({
        title: "Error",
        description: "Failed to load trip data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter activities based on search and category
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (activity.location_text || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || activity.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [activities, searchTerm, categoryFilter]);

  const handleDragStart = ({ active }) => {
    setActiveId(active.id);
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeActivity = activities.find(a => a.id === activeId);
    if (!activeActivity) return;

    let targetDayId;
    let targetIndex;

    const overActivity = activities.find(a => a.id === overId);
    if (overActivity) {
      targetDayId = overActivity.day_id;
      targetIndex = overActivity.order_index;
    } else {
      const targetDay = days.find(d => d.id === overId);
      if (targetDay) {
        targetDayId = targetDay.id;
        const dayActivities = activities.filter(a => a.day_id === targetDayId);
        targetIndex = dayActivities.length;
      }
    }

    if (!targetDayId) return;

    setActivities(prevActivities => {
      const activeIndex = prevActivities.findIndex(a => a.id === activeId);
      const updatedActivities = [...prevActivities];
      
      const [movedActivity] = updatedActivities.splice(activeIndex, 1);
      movedActivity.day_id = targetDayId;
      
      const targetDayActivities = updatedActivities.filter(a => a.day_id === targetDayId);
      const insertIndex = Math.min(targetIndex, targetDayActivities.length);
      
      const dayStartIndex = updatedActivities.findIndex(a => a.day_id === targetDayId);
      const insertionIndex = dayStartIndex >= 0 ? dayStartIndex + insertIndex : updatedActivities.length;
      updatedActivities.splice(insertionIndex, 0, movedActivity);
      
      const dayActivities = updatedActivities.filter(a => a.day_id === targetDayId);
      dayActivities.forEach((activity, index) => {
        activity.order_index = index;
      });
      
      return updatedActivities;
    });
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    
    if (!over) return;

    try {
      const updates = activities.map(activity => ({
        id: activity.id,
        day_id: activity.day_id,
        order_index: activity.order_index
      }));
      
      await axios.post(`${API}/activities/reorder`, updates);
      toast({
        title: "Success",
        description: "Activities reordered successfully",
      });
    } catch (error) {
      console.error('Error reordering activities:', error);
      toast({
        title: "Error",
        description: "Failed to reorder activities",
        variant: "destructive",
      });
      loadTripData();
    }
  };

  const handleAddActivity = (dayId) => {
    setSelectedDayId(dayId);
    setEditingActivity(null);
    setActivityDialogOpen(true);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setSelectedDayId(activity.day_id);
    setActivityDialogOpen(true);
  };

  const handleSaveActivity = async (formData) => {
    try {
      if (editingActivity) {
        await axios.put(`${API}/activities/${editingActivity.id}`, formData);
        toast({
          title: "Success",
          description: "Activity updated successfully",
        });
      } else {
        await axios.post(`${API}/trips/${tripId}/days/${selectedDayId}/activities`, formData);
        toast({
          title: "Success",
          description: "Activity added successfully",
        });
      }
      
      setActivityDialogOpen(false);
      loadTripData();
    } catch (error) {
      console.error('Error saving activity:', error);
      toast({
        title: "Error",
        description: "Failed to save activity",
        variant: "destructive",
      });
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await axios.delete(`${API}/activities/${activityId}`);
      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });
      loadTripData();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <div className="text-xl font-semibold text-gray-700 mt-4">Loading your trip...</div>
        </div>
      </div>
    );
  }

  if (!tripData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <div className="text-2xl font-bold text-gray-700">Trip not found</div>
          <div className="text-gray-500 mt-2">The trip you're looking for doesn't exist.</div>
        </div>
      </div>
    );
  }

  const totalCost = activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
  const totalActivities = activities.length;
  const tripDuration = differenceInDays(parseISO(tripData.date_end), parseISO(tripData.date_start)) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden flex-shrink-0"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  {tripData.title}
                </h1>
                <p className="text-sm md:text-base text-gray-600 font-medium truncate">
                  {format(parseISO(tripData.date_start), 'MMM d')} - {format(parseISO(tripData.date_end), 'MMM d, yyyy')} • {tripDuration} days
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <div className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm">
                <div className="text-center px-3 xl:px-4 py-2 bg-blue-50 rounded-lg">
                  <div className="font-bold text-xl xl:text-2xl text-blue-600">{totalActivities}</div>
                  <div className="text-blue-700 font-medium text-xs xl:text-sm">Activities</div>
                </div>
                <div className="text-center px-3 xl:px-4 py-2 bg-green-50 rounded-lg">
                  <div className="font-bold text-xl xl:text-2xl text-green-600">{getCurrencySymbol(tripData?.currency)}{totalCost.toFixed(2)}</div>
                  <div className="text-green-700 font-medium text-xs xl:text-sm">Total Cost</div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link copied!",
                      description: "Trip link copied to clipboard",
                    });
                  } catch (error) {
                    // Fallback for browsers that don't support clipboard API
                    const textArea = document.createElement('textarea');
                    textArea.value = window.location.href;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    toast({
                      title: "Link copied!",
                      description: "Trip link copied to clipboard",
                    });
                  }
                }}
              >
                <Share2 className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <div className="p-6">
              <SheetHeader>
                <SheetTitle>Trip Controls</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Search */}
                <div>
                  <Label className="text-sm font-semibold">Search Activities</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by title or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Category Filter */}
                <div>
                  <Label className="text-sm font-semibold">Filter by Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="food">Food & Dining</SelectItem>
                      <SelectItem value="sightseeing">Sightseeing</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="accommodation">Accommodation</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Export Options */}
                <div>
                  <Label className="text-sm font-semibold">Export Trip</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => exportToPDF(tripData, days, activities)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => exportToCSV(tripData, days, activities)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      CSV
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 md:px-6 py-4 bg-white/50 border-b">
              <TabsList className="grid w-full max-w-md grid-cols-3 tabs-list">
                <TabsTrigger value="planner" className="flex items-center gap-1 md:gap-2 text-sm">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden xs:inline">Planner</span>
                  <span className="xs:hidden">Plan</span>
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-1 md:gap-2 text-sm">
                  <Map className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden xs:inline">Map</span>
                  <span className="xs:hidden">Map</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-1 md:gap-2 text-sm">
                  <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden xs:inline">Stats</span>
                  <span className="xs:hidden">Stats</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="planner" className="p-4 md:p-6">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8 md:flex md:gap-8 md:overflow-x-auto pb-8">
                  {days.map((day) => (
                    <DayColumn
                      key={day.id}
                      day={day}
                      activities={filteredActivities}
                      onAddActivity={handleAddActivity}
                      onEditActivity={handleEditActivity}
                      onDeleteActivity={handleDeleteActivity}
                      currency={tripData?.currency}
                    />
                  ))}
                </div>
                
                <DragOverlay>
                  {activeId ? (
                    <SortableActivityCard
                      activity={activities.find(a => a.id === activeId)}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      currency={tripData?.currency}
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </TabsContent>

            <TabsContent value="map" className="p-4 md:p-6">
              <div className="max-w-5xl mx-auto">
                <div className="mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Trip Route</h2>
                  <p className="text-sm md:text-base text-gray-600">Visualize your trip activities on the map</p>
                </div>
                <div className="trip-map">
                  <TripMap activities={activities} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="p-4 md:p-6">
              <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Trip Statistics</h2>
                  <p className="text-sm md:text-base text-gray-600">Analyze your trip data and spending</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <Card>
                    <CardContent className="p-4 md:p-6 text-center">
                      <Calendar className="h-6 w-6 md:h-8 md:w-8 text-blue-500 mx-auto mb-2 md:mb-3" />
                      <div className="text-2xl md:text-3xl font-bold text-gray-900">{tripDuration}</div>
                      <div className="text-sm md:text-base text-gray-600">Days</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 md:p-6 text-center">
                      <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-purple-500 mx-auto mb-2 md:mb-3" />
                      <div className="text-2xl md:text-3xl font-bold text-gray-900">{totalActivities}</div>
                      <div className="text-sm md:text-base text-gray-600">Activities</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 md:p-6 text-center">
                      <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-green-500 mx-auto mb-2 md:mb-3" />
                      <div className="text-xl md:text-3xl font-bold text-gray-900">{getCurrencySymbol(tripData?.currency)}{totalCost.toFixed(2)}</div>
                      <div className="text-sm md:text-base text-gray-600">Total Cost</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 md:p-6 text-center">
                      <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-orange-500 mx-auto mb-2 md:mb-3" />
                      <div className="text-xl md:text-3xl font-bold text-gray-900">{getCurrencySymbol(tripData?.currency)}{(totalCost / tripDuration).toFixed(2)}</div>
                      <div className="text-sm md:text-base text-gray-600">Per Day</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Activity Dialog */}
      <ActivityDialog
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
        activity={editingActivity}
        dayId={selectedDayId}
        onSave={handleSaveActivity}
      />
      
      <Toaster />
    </div>
  );
}

// Enhanced Home Component
function Home() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [newTrip, setNewTrip] = useState({
    title: '',
    date_start: '',
    date_end: '',
    currency: 'USD',
    theme: 'blue'
  });

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const response = await axios.get(`${API}/trips`);
      setTrips(response.data);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/trips`, newTrip);
      const tripId = response.data.id;
      
      const startDate = new Date(newTrip.date_start);
      const endDate = new Date(newTrip.date_end);
      const dayCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      for (let i = 0; i < dayCount; i++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i);
        
        await axios.post(`${API}/trips/${tripId}/days`, {
          date: dayDate.toISOString().split('T')[0],
          index: i + 1,
          notes: null
        });
      }
      
      setCreateDialogOpen(false);
      toast({
        title: "Success!",
        description: "Trip created successfully",
      });
      navigate(`/trip/${tripId}`);
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: "Error",
        description: "Failed to create trip",
        variant: "destructive",
      });
    }
  };

  const deleteTrip = async () => {
    if (!tripToDelete) return;
    
    try {
      await axios.delete(`${API}/trips/${tripToDelete.id}`);
      setTrips(trips.filter(trip => trip.id !== tripToDelete.id));
      toast({
        title: "Success!",
        description: "Trip deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTripToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                <Globe2 className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Plan Your Perfect{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Adventure
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your travel dreams into reality with our intelligent drag-and-drop planner. 
              Create detailed itineraries, manage activities, and never miss a moment of your journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Sparkles className="mr-3 h-6 w-6" />
                Start Planning
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-4 border-2 hover:bg-gray-50"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
          <p className="text-xl text-gray-600">Powerful features to make trip planning effortless</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-8 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="p-3 bg-blue-500 rounded-xl w-fit mb-6">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Drag & Drop Planning</h3>
            <p className="text-gray-600 leading-relaxed">
              Intuitive Kanban-style interface. Drag activities between days, reorder your schedule, 
              and see changes in real-time.
            </p>
          </Card>
          
          <Card className="p-8 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="p-3 bg-green-500 rounded-xl w-fit mb-6">
              <Map className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Interactive Maps</h3>
            <p className="text-gray-600 leading-relaxed">
              Visualize your journey on interactive maps. See routes, distances, 
              and optimize your daily travel plans.
            </p>
          </Card>
          
          <Card className="p-8 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="p-3 bg-purple-500 rounded-xl w-fit mb-6">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Analytics</h3>
            <p className="text-gray-600 leading-relaxed">
              Track expenses, analyze time distribution, and get insights 
              to optimize your travel budget and schedule.
            </p>
          </Card>
        </div>
      </div>

      {/* Recent Trips */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Your Trips</h2>
            <p className="text-gray-600 text-lg">Manage and revisit your adventures</p>
          </div>
          <Button 
            variant="outline" 
            className="border-2 hover:bg-blue-50 hover:border-blue-300"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-5 w-5" />
            New Trip
          </Button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="p-6 bg-gray-50 rounded-full w-fit mx-auto mb-8">
              <Calendar className="h-20 w-20 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready for Your First Adventure?</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Create your first trip to unlock the full potential of our planning tools.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Trip
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card 
                key={trip.id} 
                className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden relative"
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600" />
                
                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTripToDelete(trip);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
                
                <CardContent 
                  className="p-6 cursor-pointer"
                  onClick={() => navigate(`/trip/${trip.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight pr-8">
                      {trip.title}
                    </h3>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                      {trip.currency}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="mr-3 h-4 w-4" />
                      <span className="font-medium">
                        {format(parseISO(trip.date_start), 'MMM d')} - {format(parseISO(trip.date_end), 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="mr-3 h-4 w-4" />
                      <span>Created {format(parseISO(trip.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Click to open</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-blue-600 font-medium">View Trip →</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Create Trip Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create New Trip
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={createTrip} className="space-y-6 mt-6">
            <div>
              <Label htmlFor="trip-title" className="text-lg font-semibold">Where are you going? *</Label>
              <Input
                id="trip-title"
                value={newTrip.title}
                onChange={(e) => setNewTrip({...newTrip, title: e.target.value})}
                placeholder="My Amazing European Adventure"
                className="mt-2 h-12 text-lg"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="start-date" className="text-lg font-semibold">Start Date *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newTrip.date_start}
                  onChange={(e) => setNewTrip({...newTrip, date_start: e.target.value})}
                  className="mt-2 h-12"
                  required
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-lg font-semibold">End Date *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newTrip.date_end}
                  onChange={(e) => setNewTrip({...newTrip, date_end: e.target.value})}
                  className="mt-2 h-12"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="currency" className="text-lg font-semibold">Currency</Label>
              <Select value={newTrip.currency} onValueChange={(value) => setNewTrip({...newTrip, currency: value})}>
                <SelectTrigger className="mt-2 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">🇺🇸 USD ($)</SelectItem>
                  <SelectItem value="EUR">🇪🇺 EUR (€)</SelectItem>
                  <SelectItem value="GBP">🇬🇧 GBP (£)</SelectItem>
                  <SelectItem value="INR">🇮🇳 INR (₹)</SelectItem>
                  <SelectItem value="JPY">🇯🇵 JPY (¥)</SelectItem>
                  <SelectItem value="CAD">🇨🇦 CAD ($)</SelectItem>
                  <SelectItem value="AUD">🇦🇺 AUD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCreateDialogOpen(false)}
                className="px-8"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Create Trip
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Trip Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">Delete Trip</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete <span className="font-semibold">"{tripToDelete?.title}"</span>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800 text-sm font-medium">
                  This action cannot be undone. All activities and data will be permanently deleted.
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={deleteTrip}
              className="px-6"
            >
              Delete Trip
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </div>
  );
}

// Main App Component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trip/:tripId" element={<TripPlanner />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;