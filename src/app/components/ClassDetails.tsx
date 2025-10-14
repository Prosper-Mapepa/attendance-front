import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, BarChart3, CheckCircle, User, Mail, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import api from '../lib/api';

interface ClassDetailsData {
  class: {
    id: string;
    name: string;
    subject?: string;
    schedule?: string;
    description?: string;
    teacher: {
      id: string;
      name: string;
      email: string;
    };
  };
  statistics: {
    totalSessions: number;
    totalAttendanceRecords: number;
    totalEnrolledStudents: number;
    averageAttendancePerSession: number;
  };
  recentSessions: Array<{
    id: string;
    otp: string;
    createdAt: string;
    validUntil: string;
    attendanceCount: number;
  }>;
  enrolledStudents: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  studentAttendanceStats: Array<{
    student: {
      id: string;
      name: string;
      email: string;
    };
    totalAttendance: number;
    attendanceRate: number;
    lastAttendance: string | null;
  }>;
  recentAttendanceRecords: Array<{
    id: string;
    timestamp: string;
    student: {
      id: string;
      name: string;
      email: string;
    };
    session: {
      id: string;
      otp: string;
      createdAt: string;
      validUntil: string;
    };
  }>;
}

interface ClassDetailsProps {
  classId: string;
  onBack: () => void;
}

export default function ClassDetails({ classId, onBack }: ClassDetailsProps) {
  const [data, setData] = useState<ClassDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flaggedStudents, setFlaggedStudents] = useState<any[]>([]);
  const [showFlaggedStudents, setShowFlaggedStudents] = useState(false);

  // Helper function to format relative time
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  useEffect(() => {
    fetchClassDetails();
    fetchFlaggedStudents();
  }, [classId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/classes/${classId}/details`);
      setData(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch class details');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlaggedStudents = async () => {
    try {
      const response = await api.get(`/attendance/flagged-students/${classId}`);
      setFlaggedStudents(response.data);
    } catch (error) {
      console.error('Error fetching flagged students:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Classes</span>
        </button>
      </div>

      {/* Class Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-cmu-maroon to-cmu-maroon-dark text-white">
          <h2 className="text-2xl font-bold">{data.class.name}</h2>
          {data.class.subject && (
            <p className="text-lg text-cmu-gold-light mt-1">{data.class.subject}</p>
          )}
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Class Information</h3>
              <div className="space-y-3">
                {data.class.schedule && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{data.class.schedule}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Teacher: {data.class.teacher.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{data.class.teacher.email}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
              <p className="text-sm text-gray-600">
                {data.class.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-cmu p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-cmu-maroon" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sessions</p>
              <p className="text-2xl font-bold text-cmu-maroon">{data.statistics.totalSessions}</p>
            </div>
          </div>
        </div>
        <div className="card-cmu p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-cmu-gold" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Attendance</p>
              <p className="text-2xl font-bold text-cmu-gold-dark">{data.statistics.totalAttendanceRecords}</p>
            </div>
          </div>
        </div>
        <div className="card-cmu p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-cmu-maroon-light" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Enrolled Students</p>
              <p className="text-2xl font-bold text-cmu-maroon-light">{data.statistics.totalEnrolledStudents}</p>
            </div>
          </div>
        </div>
        <div className="card-cmu p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-cmu-gold-dark" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Attendance</p>
              <p className="text-2xl font-bold text-cmu-gold-dark">{data.statistics.averageAttendancePerSession}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flagged Students Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-medium text-gray-900">Flagged Students</h3>
                {flaggedStudents.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {flaggedStudents.length}
                  </span>
                )}
              </div>
                <p className="text-sm text-gray-500 mt-1">
                  Students flagged in this class only
                </p>
            </div>
            <div className="flex items-center space-x-2">
              {showFlaggedStudents && (
                <button
                  onClick={fetchFlaggedStudents}
                  className="text-sm px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  title="Refresh flagged students"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => {
                  setShowFlaggedStudents(!showFlaggedStudents);
                  if (!showFlaggedStudents) {
                    fetchFlaggedStudents();
                  }
                }}
                className={`text-sm px-3 py-1 rounded-md transition-colors ${
                  showFlaggedStudents 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showFlaggedStudents ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>
        
        {showFlaggedStudents && (
          <div className="p-6">
            {flaggedStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No flagged students in this class</p>
                  <p className="text-sm text-gray-400 mt-1">Students will appear here after 3 suspicious attendance attempts in this class</p>
              </div>
            ) : (
              <div className="space-y-4">
                {flaggedStudents.map((student, index) => (
                  <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-red-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{student.studentName}</h4>
                            <p className="text-sm text-gray-600">{student.studentEmail}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                            <div className="text-xs text-gray-400 italic">{getRelativeTime(student.flaggedAt)}</div>
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
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Sessions</h3>
          </div>
          <div className="p-6">
            {data.recentSessions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No sessions created yet.</p>
            ) : (
              <div className="space-y-3">
                {data.recentSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          OTP: <span className="font-mono">{session.otp}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          {session.attendanceCount} attended
                        </p>
                        <p className="text-xs text-gray-500">
                          Valid until: {new Date(session.validUntil).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enrolled Students */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Enrolled Students</h3>
          </div>
          <div className="p-6">
            {data.enrolledStudents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No students enrolled yet.</p>
            ) : (
              <div className="space-y-3">
                {data.enrolledStudents.map((student) => {
                  const stats = data.studentAttendanceStats.find(s => s.student.id === student.id);
                  return (
                    <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-blue-600">
                            {stats?.totalAttendance || 0} sessions
                          </p>
                          <p className="text-xs text-gray-500">
                            {stats ? `${Math.round(stats.attendanceRate)}%` : '0%'} rate
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Attendance Records */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Attendance Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session OTP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.recentAttendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium">No attendance records yet</p>
                    <p className="text-sm">Attendance records will appear here once students mark their attendance.</p>
                  </td>
                </tr>
              ) : (
                data.recentAttendanceRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.student.name}</div>
                        <div className="text-sm text-gray-500">{record.student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {record.session.otp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Present
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
