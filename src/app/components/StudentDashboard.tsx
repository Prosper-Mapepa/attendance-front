import { useState, useEffect } from 'react';
import { BookOpen, Plus, QrCode, CheckCircle, Trash2 } from 'lucide-react';
import api from '../lib/api';
import Alert from './Alert';
import { useAutoDismissAlert } from '../hooks/useAutoDismissAlert';

interface Class {
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
}

interface Enrollment {
  id: string;
  enrolledAt: string;
  class: Class;
}


interface AttendanceRecord {
  id: string;
  timestamp: string;
  session: {
    class: Class;
  };
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('enrollments');
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { alert, showAlert, dismissAlert } = useAutoDismissAlert({ timeout: 6000 });
  const [otpInput, setOtpInput] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [availableRes, enrollmentsRes, attendanceRes] = await Promise.all([
        api.get('/enrollments/available'),
        api.get('/enrollments'),
        api.get('/attendance'),
      ]);
      
      setAvailableClasses(availableRes.data);
      setEnrollments(enrollmentsRes.data);
      setAttendanceRecords(attendanceRes.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showAlert(error.response?.data?.message || 'Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const enrollInClass = async (classId: string) => {
    try {
      await api.post(`/enrollments/${classId}`);
      fetchData(); // Refresh data
      showAlert('Successfully enrolled in class!', 'success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showAlert(error.response?.data?.message || 'Failed to enroll in class', 'error');
    }
  };

  const unenrollFromClass = async (classId: string) => {
    try {
      await api.delete(`/enrollments/${classId}`);
      fetchData(); // Refresh data
      showAlert('Successfully unenrolled from class!', 'success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showAlert(error.response?.data?.message || 'Failed to unenroll from class', 'error');
    }
  };

  const markAttendance = async () => {
    if (!otpInput.trim()) {
      showAlert('Please enter an OTP', 'warning');
      return;
    }

    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const attendanceData = {
        otp: otpInput,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`
      };

      await api.post('/attendance/mark', attendanceData);
      setOtpInput('');
      fetchData(); // Refresh data
      showAlert('Attendance marked successfully!', 'success');
    } catch (err: unknown) {
      if (err instanceof GeolocationPositionError) {
        showAlert('Location permission required. Please enable location services to mark attendance.', 'error');
      } else {
        const error = err as { response?: { data?: { message?: string } } };
        const errorMessage = error.response?.data?.message || 'Failed to mark attendance';
        
        // Provide helpful guidance for location verification errors
        if (errorMessage.includes('Location verification failed') || errorMessage.includes('Too far from class')) {
          showAlert(`${errorMessage}. Please ensure you are in the correct classroom and try again.`, 'error');
        } else if (errorMessage.includes('Location permission required')) {
          showAlert('Location permission required. Please enable location services in your browser settings and try again.', 'error');
        } else {
          showAlert(errorMessage, 'error');
        }
      }
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-cmu-maroon">Student Dashboard</h2>
        <p className="text-gray-600 mt-1">Manage your classes and track your attendance</p>
      </div>

      {/* Alert Message */}
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onDismiss={dismissAlert}
        />
      )}

      {/* Navigation Tabs */}
      <div className="nav-cmu">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'enrollments', label: 'My Classes', icon: BookOpen },
            { id: 'attendance', label: 'Mark Attendance', icon: QrCode },
            { id: 'records', label: 'Attendance Records', icon: CheckCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item flex items-center space-x-2 py-2 px-1 border-b-4 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'active border-cmu-maroon rounded '
                    : 'border-transparent hover:border-cmu-maroon'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Available Classes Tab */}
      {activeTab === 'enrollments' && (
        <div className="space-y-6">
          {/* Available Classes */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Available Classes</h3>
            </div>
            <div className="p-6">
              {availableClasses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No available classes to enroll in.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {availableClasses.map((classItem) => (
                    <div key={classItem.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{classItem.name}</h4>
                      {classItem.subject && (
                        <p className="text-sm text-gray-600 mt-1">Subject: {classItem.subject}</p>
                      )}
                      {classItem.schedule && (
                        <p className="text-sm text-gray-600 mt-1">Schedule: {classItem.schedule}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">Teacher: {classItem.teacher.name}</p>
                      <button
                        onClick={() => enrollInClass(classItem.id)}
                        className="btn-cmu-primary mt-3 w-full flex items-center justify-center space-x-2 text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Enroll</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My Enrollments */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">My Classes</h3>
            </div>
            <div className="p-6">
              {enrollments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">You are not enrolled in any classes.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{enrollment.class.name}</h4>
                      {enrollment.class.subject && (
                        <p className="text-sm text-gray-600 mt-1">Subject: {enrollment.class.subject}</p>
                      )}
                      {enrollment.class.schedule && (
                        <p className="text-sm text-gray-600 mt-1">Schedule: {enrollment.class.schedule}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">Teacher: {enrollment.class.teacher.name}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => unenrollFromClass(enrollment.class.id)}
                        className="btn-cmu-secondary mt-3 w-full flex items-center justify-center space-x-2 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Unenroll</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mark Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* OTP Input */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Mark Attendance</h3>
            </div>
            <div className="p-6">
              <div className="max-w-md mx-auto">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP from QR Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="otp"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cmu-maroon focus:border-transparent"
                  />
                  <button
                    onClick={markAttendance}
                    className="btn-cmu-primary flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Mark</span>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Scan the QR code displayed by your teacher to get the OTP.
                </p>
                
                {/* Location Requirements Info */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">📍 Location Requirements</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• You must be physically present in the classroom</li>
                    <li>• Location services must be enabled in your browser</li>
                    <li>• You must be within 50 meters of the class location</li>
                    <li>• If you&apos;re in the correct room but get an error, ask your teacher to check the class location settings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records Tab */}
      {activeTab === 'records' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Attendance Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.session.class.name}
                          </div>
                          {record.session.class.subject && (
                            <div className="text-sm text-gray-500">
                              {record.session.class.subject}
                            </div>
                          )}
                        </div>
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
      )}
    </div>
  );
}
