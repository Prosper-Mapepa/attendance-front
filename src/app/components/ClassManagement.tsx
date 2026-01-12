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
    clockInDeadline?: string;
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [classToDelete, setClassToDelete] = useState<{ id: string; name: string } | null>(null);

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
    // Convert meters to feet for display (1 meter = 3.28084 feet)
    const locationRadiusInFeet = classItem.locationRadius ? classItem.locationRadius / 0.3048 : undefined;
    form.reset({
      name: classItem.name,
      description: classItem.description || '',
      subject: classItem.subject,
      schedule: classItem.schedule,
      latitude: classItem.latitude || undefined,
      longitude: classItem.longitude || undefined,
      locationRadius: locationRadiusInFeet, // Will be converted back to meters on submit
    });
    setShowForm(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setClassToDelete({ id, name });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!classToDelete) return;
    
    try {
      await api.delete(`/classes/${classToDelete.id}`);
      fetchClasses();
      showAlert('Class deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setClassToDelete(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showAlert(error.response?.data?.message || 'Failed to delete class', 'error');
      setShowDeleteConfirm(false);
      setClassToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setClassToDelete(null);
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-cmu-maroon via-cmu-maroon to-cmu-maroon-dark rounded-xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Classes</h2>
                <p className="text-sm sm:text-base text-white/90 mt-1">Manage your courses and track attendance</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setShowFlaggedStudents(!showFlaggedStudents);
                if (!showFlaggedStudents) {
                  fetchFlaggedStudents();
                }
              }}
              className={`flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base shadow-md hover:shadow-lg ${
                showFlaggedStudents 
                  ? 'bg-red-500 text-white border-2 border-red-600' 
                  : 'bg-white text-gray-700 border-2 border-white/20 hover:bg-white/95 hover:border-white/30'
              }`}
            >
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Flagged Students</span>
              {flaggedStudents.length > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold rounded-full px-2.5 py-1 min-w-[24px] text-center flex-shrink-0 shadow-sm">
                  {flaggedStudents.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-cmu-gold text-cmu-maroon px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-cmu-gold-dark hover:text-white transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base shadow-md hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>Add Class</span>
            </button>
          </div>
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
        <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {editingClass ? 'Edit Class' : 'Create New Class'}
            </h3>
            <p className="text-sm text-gray-600">
              {editingClass ? 'Update your class information and settings' : 'Fill in the details below to create a new class'}
            </p>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            {/* Class Details Section */}
            <div className="space-y-5">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-5 w-5 text-cmu-maroon" />
                <h4 className="text-lg font-semibold text-gray-900">Class Details</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Class Name</label>
                  <input
                    {...form.register('name')}
                    className="block w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cmu-maroon focus:border-cmu-maroon transition-all"
                    placeholder="e.g., Math 101"
                  />
                  {form.formState.errors.name && (
                    <p className="mt-2 text-sm text-red-600">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <input
                    {...form.register('subject')}
                    className="block w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cmu-maroon focus:border-cmu-maroon transition-all"
                    placeholder="e.g., Mathematics"
                  />
                  {form.formState.errors.subject && (
                    <p className="mt-2 text-sm text-red-600">{form.formState.errors.subject.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1 text-cmu-maroon" />
                  Schedule
                </label>
                <input
                  {...form.register('schedule')}
                  className="block w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cmu-maroon focus:border-cmu-maroon transition-all"
                  placeholder="e.g., Monday, Wednesday, Friday 9:00 AM - 10:30 AM"
                />
                {form.formState.errors.schedule && (
                  <p className="mt-2 text-sm text-red-600">{form.formState.errors.schedule.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  {...form.register('description')}
                  rows={4}
                  className="block w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cmu-maroon focus:border-cmu-maroon transition-all resize-none"
                  placeholder="Brief description of the class"
                />
              </div>
            </div>
            
            {/* Location Settings Section */}
            <div className="border-t-2 border-gray-200 pt-6">
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="h-5 w-5 text-cmu-maroon" />
                <h4 className="text-lg font-semibold text-gray-900">Location Settings</h4>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Required</span>
              </div>
              <p className="text-sm text-gray-600 mb-5">
                Set classroom coordinates to enable location-based attendance verification
              </p>
              
              {/* Location Selection Options */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="flex items-center justify-center space-x-2 px-5 py-3 bg-cmu-maroon text-white rounded-lg hover:bg-cmu-maroon-dark transition-all duration-200 shadow-md hover:shadow-lg font-semibold w-full sm:w-auto"
                >
                  <Map className="h-5 w-5" />
                  <span>
                    {editingClass && editingClass.latitude && editingClass.longitude 
                      ? 'Update with Google Maps' 
                      : 'Select with Google Maps'
                    }
                  </span>
                </button>
                
                {editingClass && editingClass.latitude && editingClass.longitude && (
                  <div className="mt-4 p-3 bg-gradient-to-br from-cmu-maroon/5 to-cmu-maroon/10 rounded-lg border border-cmu-maroon/20">
                    <p className="text-sm font-semibold text-cmu-maroon mb-1">
                      📍 Current Location
                    </p>
                    <p className="text-xs text-gray-700 font-mono">
                      {editingClass.latitude.toFixed(6)}, {editingClass.longitude.toFixed(6)}
                      {editingClass.locationRadius && ` • ${Math.round(editingClass.locationRadius / 0.3048)}ft radius`}
                    </p>
                  </div>
                )}
              </div>

              {/* Location Picker Modal */}
              {showLocationPicker && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
                  <div className="bg-white p-5 sm:p-6 rounded-xl shadow-2xl max-w-2xl w-full mx-2 sm:mx-4 max-h-[90vh] sm:max-h-96 overflow-y-auto border border-gray-200">
                    <div className="flex items-center space-x-2 mb-5">
                      <MapPin className="h-5 w-5 text-cmu-maroon" />
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">Select CMU Building & Room</h3>
                    </div>
                    
                    {/* Building Selection */}
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Building</label>
                      <div className="grid grid-cols-1 gap-3">
                        {Object.keys(CMU_BUILDINGS).map((buildingName) => (
                          <button
                            key={buildingName}
                            onClick={() => handleBuildingSelect(buildingName)}
                            className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                              selectedBuilding === buildingName
                                ? 'border-cmu-maroon bg-cmu-maroon text-white shadow-md'
                                : 'border-gray-200 hover:border-cmu-maroon/50 hover:bg-gray-50'
                            }`}
                          >
                            <div className="font-semibold">{buildingName}</div>
                            <div className={`text-sm mt-1 ${selectedBuilding === buildingName ? 'opacity-90' : 'text-gray-600'}`}>
                              {CMU_BUILDINGS[buildingName].address}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Room Selection */}
                    {selectedBuilding && (
                      <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Room <span className="text-xs font-normal text-gray-500">(Optional)</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {CMU_BUILDINGS[selectedBuilding].rooms.map((roomName) => (
                            <button
                              key={roomName}
                              onClick={() => handleRoomSelect(roomName)}
                              className={`p-3 text-sm rounded-lg border-2 transition-all duration-200 font-medium ${
                                selectedRoom === roomName
                                  ? 'border-cmu-gold bg-cmu-gold text-cmu-maroon shadow-md'
                                  : 'border-gray-200 hover:border-cmu-gold/50 hover:bg-gray-50'
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
                      <div className="mb-5 p-4 bg-gradient-to-br from-cmu-maroon/5 to-cmu-maroon/10 rounded-lg border-2 border-cmu-maroon/20">
                        <h4 className="font-semibold text-cmu-maroon mb-2">Selected Location</h4>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {selectedBuilding} {selectedRoom && `- ${selectedRoom}`}
                        </p>
                        <p className="text-xs text-gray-600 font-mono">
                          Coordinates: {form.watch('latitude')?.toFixed(6)}, {form.watch('longitude')?.toFixed(6)}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setShowLocationPicker(false)}
                        className="w-full sm:w-auto px-5 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all duration-200 shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setShowLocationPicker(false)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-cmu-maroon text-white rounded-lg hover:bg-cmu-maroon-dark font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
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
              <div className="mb-5">
                {/* <h5 className="text-sm font-semibold text-gray-700 mb-4">Or Enter Coordinates Manually</h5> */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Latitude</label>
                    <input
                      {...form.register('latitude', { valueAsNumber: true })}
                      type="number"
                      step="any"
                      className="block w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cmu-maroon focus:border-cmu-maroon font-mono text-sm transition-all"
                      placeholder="43.584200"
                    />
                    {/* <p className="text-xs text-gray-500 mt-2">6 decimal places (~0.1m precision)</p> */}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Longitude</label>
                    <input
                      {...form.register('longitude', { valueAsNumber: true })}
                      type="number"
                      step="any"
                      className="block w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cmu-maroon focus:border-cmu-maroon font-mono text-sm transition-all"
                      placeholder="-84.767400"
                    />
                    {/* <p className="text-xs text-gray-500 mt-2">6 decimal places (~0.1m precision)</p> */}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Radius (feet)</label>
                    <input
                      {...form.register('locationRadius', { 
                        valueAsNumber: true,
                        setValueAs: (v) => {
                          // Convert feet to meters for backend (1 foot = 0.3048 meters)
                          const feet = parseFloat(v);
                          return isNaN(feet) ? undefined : feet * 0.3048;
                        }
                      })}
                      type="number"
                      min="5"
                      max="100"
                      step="1"
                      className="block w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cmu-maroon focus:border-cmu-maroon transition-all"
                      placeholder="30"
                    />
                    <p className="text-xs text-gray-500 mt-2">Range: 5-100 feet (more precise location verification)</p>
                  </div>
                </div>
              </div>
              
              {/* Info Box */}
              {/* <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="text-xl">💡</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-blue-900 mb-1">Location Setup Tip</h5>
                    <p className="text-xs text-blue-800">
                      Use Google Maps to select precise coordinates, or enter them manually. Students must be within the specified radius to mark attendance.
                    </p>
                  </div>
                </div>
              </div> */}
              
              {/* Troubleshooting Info */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertTriangle className="h-5 w-5 text-yellow-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-900 mb-2">Troubleshooting Location Issues</h4>
                    <ul className="text-xs text-yellow-800 space-y-1.5">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Location verification is precise - students must be within the exact radius to clock in/out</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>If students get &quot;Too far from class&quot; errors, verify coordinates are accurate (use Google Maps)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Consider increasing the radius for larger classrooms (up to 100ft / ~30m)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Test location verification from the actual classroom before the session starts</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Ensure students have location services enabled and accurate GPS signal</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-cmu-maroon text-white rounded-lg hover:bg-cmu-maroon-dark font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {editingClass ? 'Update Class' : 'Create Class'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 sm:p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-cmu-maroon/10 to-cmu-gold/10 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-cmu-maroon" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No classes yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">Get started by creating your first class</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-cmu-primary inline-flex items-center space-x-2 px-6 py-3 text-base font-semibold"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Class</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {classes.map((classItem) => {
            // Check if there's an actually active session (not expired)
            const now = new Date();
            const activeSession = classItem.sessions?.find(session => {
              const validUntil = new Date(session.validUntil);
              const clockInDeadline = session.clockInDeadline ? new Date(session.clockInDeadline) : null;
              
              // Session is active if validUntil hasn't passed
              // AND if clockInDeadline exists, it also hasn't passed
              if (now >= validUntil) return false;
              if (clockInDeadline && now >= clockInDeadline) return false;
              
              return true;
            });
            const hasActiveSession = !!activeSession;
            
            return (
              <div 
                key={classItem.id} 
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-cmu-maroon/30 overflow-hidden flex flex-col group"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-cmu-maroon to-cmu-maroon-dark p-5 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 truncate">{classItem.name}</h3>
                      <p className="text-sm sm:text-base text-white/90">{classItem.subject}</p>
                    </div>
                    {hasActiveSession && (
                      <span className="ml-3 flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-cmu-gold text-cmu-maroon animate-pulse">
                        Active
                      </span>
                    )}
                  </div>
                  {classItem.description && (
                    <p className="text-xs sm:text-sm text-white/80 line-clamp-2">{classItem.description}</p>
                  )}
                </div>
                
                {/* Card Body */}
                <div className="flex-1 p-5 sm:p-6 space-y-4">
                  {/* Schedule */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Calendar className="h-5 w-5 text-cmu-maroon" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Schedule</p>
                      <p className="text-sm sm:text-base text-gray-900 font-medium">{classItem.schedule}</p>
                    </div>
                  </div>
                  
                  {/* Active Session */}
                  {hasActiveSession && activeSession && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-3">Active Session</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">OTP Code:</span>
                          <span className="text-lg sm:text-xl font-mono font-bold text-cmu-maroon tracking-wider">
                            {activeSession.otp}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-green-200">
                          <span className="text-xs font-medium text-gray-600">Valid until:</span>
                          <span className="text-xs sm:text-sm text-gray-700 font-medium">
                            {new Date(activeSession.validUntil).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-5">
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClassId(classItem.id);
                      }}
                      className="group flex flex-col items-center justify-center space-y-1 px-3 py-2.5 bg-white text-cmu-maroon hover:bg-cmu-maroon/10 hover:text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-xl border-2 border-cmu-maroon/30 hover:border-cmu-maroon transform hover:scale-105 active:scale-95"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110" />
                      <span className="text-xs font-semibold">View</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(classItem);
                      }}
                      className="group flex flex-col items-center justify-center space-y-1 px-3 py-2.5 bg-white text-cmu-gold-dark hover:bg-orange-500 hover:text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-xl border-2 border-cmu-gold/40 hover:border-cmu-gold transform hover:scale-105 active:scale-95"
                      title="Edit Class"
                    >
                      <Edit className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110" />
                      <span className="text-xs font-semibold">Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(classItem.id, classItem.name);
                      }}
                      className="group flex flex-col items-center justify-center space-y-1 px-3 py-2.5 bg-white text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-300 shadow-sm hover:shadow-xl border-2 border-red-300 hover:border-red-600 transform hover:scale-105 active:scale-95"
                      title="Delete Class"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110" />
                      <span className="text-xs font-semibold">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {classes.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No classes</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new class.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && classToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 rounded-t-xl border-b border-red-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Class</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <p className="text-base text-gray-700 mb-1">
                Are you sure you want to delete
              </p>
              <p className="text-lg font-semibold text-cmu-maroon mb-4">
                "{classToDelete.name}"?
              </p>
              <p className="text-sm text-gray-500">
                All associated sessions and attendance records will be permanently deleted.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Delete Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
