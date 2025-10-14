'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, BookOpen, Calendar, Edit, Trash2, Eye, MapPin, AlertTriangle, Users, Clock, Map } from 'lucide-react';
import api from '../lib/api';
import ClassDetails from './ClassDetails';
import Alert from './Alert';
import GoogleMapLocationPicker from './GoogleMapLocationPicker';
import { useAutoDismissAlert } from '../hooks/useAutoDismissAlert';
import { geocodeAddress } from '../utils/geocoding';

// CMU Building Database
const CMU_BUILDINGS: Record<string, {
  latitude: number;
  longitude: number;
  address: string;
  rooms: string[];
}> = {
  "Engineering Building": {
    latitude: 43.5842,
    longitude: -84.7674,
    address: "Engineering Building, Central Michigan University, Mount Pleasant, MI",
    rooms: ["Room 101", "Room 102", "Room 201", "Room 202", "Room 301", "Room 302"]
  },
  "Business Building": {
    latitude: 43.5850,
    longitude: -84.7680,
    address: "Business Building, Central Michigan University, Mount Pleasant, MI",
    rooms: ["MBA 610", "MBA 620", "MBA 630", "Room 101", "Room 102", "Room 201"]
  },
  "Library": {
    latitude: 43.5835,
    longitude: -84.7670,
    address: "Charles V. Park Library, Central Michigan University, Mount Pleasant, MI",
    rooms: ["Study Room A", "Study Room B", "Conference Room 1", "Conference Room 2"]
  },
  "Student Center": {
    latitude: 43.5840,
    longitude: -84.7665,
    address: "Bovee University Center, Central Michigan University, Mount Pleasant, MI",
    rooms: ["Meeting Room 1", "Meeting Room 2", "Conference Room A", "Conference Room B"]
  },
  "Grawn Hall": {
    latitude: 43.5930,
    longitude: -84.7761,
    address: "Grawn Hall, Central Michigan University, Mount Pleasant, MI",
    rooms: ["Room 101", "Room 102", "Room 201", "Room 202", "Room 301"]
  }
};

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  description: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  schedule: z.string().min(1, 'Schedule is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  locationRadius: z.number().min(10).max(200).optional(),
});

type ClassFormData = z.infer<typeof classSchema>;

interface Class {
  id: string;
  name: string;
  description?: string;
  subject: string;
  schedule: string;
  latitude?: number;
  longitude?: number;
  locationRadius?: number;
  teacher: {
    id: string;
    name: string;
    email: string;
  };
  sessions?: Array<{
    id: string;
    otp: string;
    validUntil: string;
    createdAt: string;
  }>;
}

export default function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const { alert, showAlert, dismissAlert } = useAutoDismissAlert({ timeout: 6000 });
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [flaggedStudents, setFlaggedStudents] = useState<any[]>([]);
  const [showFlaggedStudents, setShowFlaggedStudents] = useState(false);

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
  });

  useEffect(() => {
    fetchClasses();
    fetchFlaggedStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      console.log('Fetching classes with token:', localStorage.getItem('token'));
      
      const response = await api.get('/classes');
      console.log('Classes response:', response.data);
      setClasses(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Error fetching classes:', err);
      console.error('Error response:', error.response);
      showAlert(error.response?.data?.message || 'Failed to fetch classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlaggedStudents = async () => {
    try {
      const response = await api.get('/attendance/flagged-students');
      setFlaggedStudents(response.data);
    } catch (error) {
      console.error('Error fetching flagged students:', error);
      showAlert('Failed to fetch flagged students', 'error');
    }
  };

  // Group flagged students by class
  const groupedFlaggedStudents = flaggedStudents.reduce((acc, student) => {
    const className = student.className;
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(student);
    return acc;
  }, {} as Record<string, typeof flaggedStudents>);

  const onSubmit = async (data: ClassFormData) => {
    try {
      if (editingClass) {
        await api.patch(`/classes/${editingClass.id}`, data);
      } else {
        await api.post('/classes', data);
      }
      setShowForm(false);
      setEditingClass(null);
      form.reset();
      fetchClasses();
      showAlert(editingClass ? 'Class updated successfully!' : 'Class created successfully!', 'success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showAlert(error.response?.data?.message || 'Failed to save class', 'error');
    }
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    form.reset({
      name: classItem.name,
      description: classItem.description || '',
      subject: classItem.subject,
      schedule: classItem.schedule,
      latitude: classItem.latitude || undefined,
      longitude: classItem.longitude || undefined,
      locationRadius: classItem.locationRadius || undefined,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    
    try {
      await api.delete(`/classes/${id}`);
      fetchClasses();
      showAlert('Class deleted successfully!', 'success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showAlert(error.response?.data?.message || 'Failed to delete class', 'error');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClass(null);
    form.reset();
    setShowLocationPicker(false);
    setShowMapPicker(false);
    setSelectedBuilding('');
    setSelectedRoom('');
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    form.setValue('latitude', lat);
    form.setValue('longitude', lng);
    // Clear building/room selection when using map picker
    setSelectedBuilding('');
    setSelectedRoom('');
  };

  const handleBuildingSelect = async (buildingName: string) => {
    setSelectedBuilding(buildingName);
    setSelectedRoom('');
    
    try {
      // Use Google geocoding to get accurate coordinates
      const fullAddress = `${buildingName}, Central Michigan University, Mount Pleasant, MI`;
      const result = await geocodeAddress(fullAddress);
      
      if (result) {
        form.setValue('latitude', result.lat);
        form.setValue('longitude', result.lng);
      } else {
        // Fallback to hardcoded coordinates if geocoding fails
        const building = CMU_BUILDINGS[buildingName];
        if (building) {
          form.setValue('latitude', building.latitude);
          form.setValue('longitude', building.longitude);
        }
      }
    } catch (error) {
      console.error('Geocoding failed, using fallback coordinates:', error);
      // Fallback to hardcoded coordinates
      const building = CMU_BUILDINGS[buildingName];
      if (building) {
        form.setValue('latitude', building.latitude);
        form.setValue('longitude', building.longitude);
      }
    }
  };

  const handleRoomSelect = (roomName: string) => {
    setSelectedRoom(roomName);
    // Add small offset for room-specific location
    const building = CMU_BUILDINGS[selectedBuilding];
    if (building) {
      const roomOffset = 0.0001; // Small offset for room precision
      form.setValue('latitude', building.latitude + roomOffset);
      form.setValue('longitude', building.longitude + roomOffset);
    }
  };

  const openLocationPicker = () => {
    // If editing and has location data, try to match with CMU buildings
    if (editingClass && editingClass.latitude && editingClass.longitude) {
      const currentLat = editingClass.latitude;
      const currentLng = editingClass.longitude;
      
      // Find matching building (with small tolerance for room offsets)
      for (const [buildingName, buildingData] of Object.entries(CMU_BUILDINGS)) {
        const latDiff = Math.abs(currentLat - buildingData.latitude);
        const lngDiff = Math.abs(currentLng - buildingData.longitude);
        
        // If within 0.0002 degrees (roughly 20 meters), consider it a match
        if (latDiff < 0.0002 && lngDiff < 0.0002) {
          setSelectedBuilding(buildingName);
          break;
        }
      }
    }
    setShowLocationPicker(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cmu-maroon"></div>
      </div>
    );
  }

  // Show detailed class view if a class is selected
  if (selectedClassId) {
    return (
      <ClassDetails
        classId={selectedClassId}
        onBack={() => setSelectedClassId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-cmu-maroon">Classes</h2>
          <p className="text-gray-600 mt-1">Manage your courses and track attendance</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setShowFlaggedStudents(!showFlaggedStudents);
              if (!showFlaggedStudents) {
                fetchFlaggedStudents();
              }
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showFlaggedStudents 
                ? 'bg-red-100 text-red-700 border border-red-300' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Flagged Students</span>
            {flaggedStudents.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {flaggedStudents.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-cmu-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* Flagged Students Section */}
      {showFlaggedStudents && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-medium text-gray-900">Flagged Students</h3>
          </div>
          
          {flaggedStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No flagged students at this time</p>
              <p className="text-sm text-gray-400 mt-1">Students will appear here after 3 suspicious attendance attempts</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedFlaggedStudents).map(([className, students]) => (
                <div key={className} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Class Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-gray-600" />
                        <h4 className="font-medium text-gray-900">{className}</h4>
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          {(students as any[]).length} flagged
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Students in this class */}
                  <div className="p-4 space-y-3">
                    {(students as any[]).map((student: any, index: number) => (
                      <div key={`${student.id}-${index}`} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                  <Users className="h-5 w-5 text-red-600" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{student.studentName}</h5>
                                <p className="text-sm text-gray-600">{student.studentEmail}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                  <span>Attempts: <strong>{student.attemptCount || student.reasons.length}</strong></span>
                                  <span>•</span>
                                  <span className="font-medium text-red-600">Suspicious Activity</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-2 mb-3">
                                {student.reasons.map((reason: string, reasonIndex: number) => (
                                  <span
                                    key={reasonIndex}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                                  >
                                    {reason}
                                  </span>
                                ))}
                              </div>
                              
                              <button
                                onClick={() => {
                                  const studentIndex = flaggedStudents.findIndex(s => s.id === student.id);
                                  const updatedStudents = [...flaggedStudents];
                                  updatedStudents[studentIndex] = {
                                    ...updatedStudents[studentIndex],
                                    showDetails: !updatedStudents[studentIndex].showDetails
                                  };
                                  setFlaggedStudents(updatedStudents);
                                }}
                                className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                              >
                                <span>View Details</span>
                                <svg 
                                  className={`w-4 h-4 transition-transform ${student.showDetails ? 'rotate-180' : ''}`}
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              
                              {student.showDetails && student.notes && (
                                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                  <p className="text-xs text-red-700">
                                    {student.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 text-right">
                            <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
                              <Clock className="h-4 w-4" />
                              <div className="text-right">
                                <div className="font-medium">{new Date(student.flaggedAt).toLocaleDateString()}</div>
                                <div className="text-xs">{new Date(student.flaggedAt).toLocaleTimeString()}</div>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              student.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {student.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onDismiss={dismissAlert}
        />
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingClass ? 'Edit Class' : 'Create New Class'}
          </h3>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Class Name</label>
                <input
                  {...form.register('name')}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cmu-maroon focus:border-cmu-maroon"
                  placeholder="e.g., Math 101"
                />
                {form.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  {...form.register('subject')}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cmu-maroon focus:border-cmu-maroon"
                  placeholder="e.g., Mathematics"
                />
                {form.formState.errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.subject.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Schedule</label>
              <input
                {...form.register('schedule')}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cmu-maroon focus:border-cmu-maroon"
                placeholder="e.g., Monday, Wednesday, Friday 9:00 AM - 10:30 AM"
              />
              {form.formState.errors.schedule && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.schedule.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
              <textarea
                {...form.register('description')}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cmu-maroon focus:border-cmu-maroon"
                placeholder="Brief description of the class"
              />
            </div>
            
            <div className="border-t-0.5 pt-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">Location Settings (Optional)</h4>
              <p className="text-sm text-gray-600 mb-4">
                Set classroom coordinates to enable location-based attendance verification
              </p>
              
              {/* Location Selection Options */}
              <div className="mb-4">
                <div className="flex space-x-3 mb-3">
                  {/* CMU Building Picker */}
                  {/* <button
                    type="button"
                    onClick={openLocationPicker}
                    className="flex items-center space-x-2 px-4 py-2 bg-cmu-gold text-cmu-maroon rounded-lg hover:bg-cmu-gold-dark hover:text-white transition-all duration-200 shadow-sm font-medium"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>
                      {editingClass && editingClass.latitude && editingClass.longitude 
                        ? 'Update CMU Building' 
                        : 'CMU Building'
                      }
                    </span>
                  </button> */}

                  {/* Map Picker */}
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-cmu-maroon text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm font-medium"
                  >
                    <Map className="h-4 w-4" />
                    <span>
                      {editingClass && editingClass.latitude && editingClass.longitude 
                        ? 'Update with Google Maps' 
                        : 'Select with Google Maps'
                      }
                    </span>
                  </button>
                </div>
                
                <p className="text-xs text-gray-500">
                  🏛️ Choose from CMU buildings for quick setup, or 🗺️ select precise coordinates with Google Maps
                </p>
                {editingClass && editingClass.latitude && editingClass.longitude && (
                  <p className="text-xs text-cmu-maroon mt-1 font-medium">
                    📍 Current: {editingClass.latitude.toFixed(6)}, {editingClass.longitude.toFixed(6)} 
                    {editingClass.locationRadius && ` (${editingClass.locationRadius}m radius)`}
                  </p>
                )}
              </div>

              {/* Location Picker Modal */}
              {showLocationPicker && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Select CMU Building & Room</h3>
                    
                    {/* Building Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Building</label>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.keys(CMU_BUILDINGS).map((buildingName) => (
                          <button
                            key={buildingName}
                            onClick={() => handleBuildingSelect(buildingName)}
                            className={`p-3 text-left rounded-lg border transition-all duration-200 ${
                              selectedBuilding === buildingName
                                ? 'border-cmu-maroon bg-cmu-maroon text-white'
                                : 'border-gray-300 hover:border-cmu-maroon hover:bg-gray-50'
                            }`}
                          >
                            <div className="font-medium">{buildingName}</div>
                            <div className="text-sm opacity-75">{CMU_BUILDINGS[buildingName].address}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Room Selection */}
                    {selectedBuilding && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Room (Optional)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {CMU_BUILDINGS[selectedBuilding].rooms.map((roomName) => (
                            <button
                              key={roomName}
                              onClick={() => handleRoomSelect(roomName)}
                              className={`p-2 text-sm rounded-lg border transition-all duration-200 ${
                                selectedRoom === roomName
                                  ? 'border-cmu-gold-dark bg-cmu-gold-dark text-white'
                                  : 'border-gray-300 hover:border-cmu-gold-dark hover:bg-gray-50'
                              }`}
                            >
                              {roomName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selected Location Display */}
                    {selectedBuilding && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">Selected Location:</h4>
                        <p className="text-sm text-gray-600">
                          {selectedBuilding} {selectedRoom && `- ${selectedRoom}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          Coordinates: {form.watch('latitude')?.toFixed(6)}, {form.watch('longitude')?.toFixed(6)}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowLocationPicker(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setShowLocationPicker(false)}
                        className="px-4 py-2 bg-cmu-maroon text-white rounded-md hover:bg-cmu-maroon-dark"
                      >
                        Confirm Location
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Google Map Location Picker Modal */}
              {showMapPicker && (
                <GoogleMapLocationPicker
                  initialLat={editingClass?.latitude}
                  initialLng={editingClass?.longitude}
                  onLocationSelect={handleMapLocationSelect}
                  onClose={() => setShowMapPicker(false)}
                />
              )}

              {/* Manual Coordinate Entry */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Latitude</label>
                  <input
                    {...form.register('latitude', { valueAsNumber: true })}
                    type="number"
                    step="any"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cmu-maroon focus:border-cmu-maroon font-mono text-sm"
                    placeholder="43.584200"
                  />
                  <p className="text-xs text-gray-500 mt-1">6 decimal places (~0.1m precision)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Longitude</label>
                  <input
                    {...form.register('longitude', { valueAsNumber: true })}
                    type="number"
                    step="any"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cmu-maroon focus:border-cmu-maroon font-mono text-sm"
                    placeholder="-84.767400"
                  />
                  <p className="text-xs text-gray-500 mt-1">6 decimal places (~0.1m precision)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Radius (meters)</label>
                  <input
                    {...form.register('locationRadius', { valueAsNumber: true })}
                    type="number"
                    min="10"
                    max="200"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cmu-maroon focus:border-cmu-maroon"
                    placeholder="50"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Use the CMU Building selector above for automatic setup, or enter coordinates manually. Students must be within this radius to mark attendance.
              </p>
              
              {/* Troubleshooting Info */}
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-900 mb-2">🔧 Troubleshooting Location Issues</h4>
                <ul className="text-xs text-yellow-800 space-y-1">
                  <li>• If students get &quot;Too far from class&quot; errors, check if coordinates are accurate</li>
                  <li>• Consider increasing the radius for larger classrooms (up to 200m)</li>
                  <li>• Verify the classroom location using Google Maps</li>
                  <li>• Test location verification from the actual classroom</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-cmu-primary"
              >
                {editingClass ? 'Update Class' : 'Create Class'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <div key={classItem.id} className="card-cmu p-6 flex flex-col">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{classItem.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{classItem.subject}</p>
              {classItem.description && (
                <p className="text-sm text-gray-500 mt-2">{classItem.description}</p>
              )}
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{classItem.schedule}</span>
                </div>
                
                {classItem.sessions && classItem.sessions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Active Session:</p>
                    <div className="text-xs bg-gray-50 px-2 py-1 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-mono">OTP: {classItem.sessions[0].otp}</span>
                        <span className="text-gray-500">
                          Valid until: {new Date(classItem.sessions[0].validUntil).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons at Bottom */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-center space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClassId(classItem.id);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-cmu-maroon hover:bg-cmu-maroon hover:text-white rounded-lg transition-all duration-200 shadow-sm border border-cmu-maroon"
                  title="View Details"
                >
                  <Eye className="h-4 w-4 hover:text-white" />
                  <span className="text-sm font-medium hover:text-white">View</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(classItem);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-cmu-gold-dark hover:bg-cmu-gold hover:text-cmu-maroon rounded-lg transition-all duration-200 shadow-sm border border-cmu-gold-dark"
                  title="Edit Class"
                >
                  <Edit className="h-4 w-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(classItem.id);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 shadow-sm border border-red-600"
                  title="Delete Class"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No classes</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new class.</p>
        </div>
      )}
    </div>
  );
}
