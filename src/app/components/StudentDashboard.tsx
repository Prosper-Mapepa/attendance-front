import { useState, useEffect } from 'react';
import { BookOpen, Plus, QrCode, CheckCircle, Trash2, LogOut, Clock } from 'lucide-react';
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
  clockInTime?: string | null;
  clockOutTime?: string | null;
  status?: string;
  session: {
    id: string;
    otp: string;
    validUntil: string;
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
  
  // Clock In/Out States
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentSession, setCurrentSession] = useState<{ otp: string; endTime: Date } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [canClockOut, setCanClockOut] = useState(false);
  const [clockingOut, setClockingOut] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Check for active clock in status
  useEffect(() => {
    const checkClockInStatus = () => {
      const clockedInRecord = attendanceRecords.find(
        record => record.status === 'CLOCKED_IN' || 
        (record.clockInTime && !record.clockOutTime && new Date(record.session.validUntil) > new Date())
      );
      
      if (clockedInRecord) {
        setIsClockedIn(true);
        setCurrentSession({
          otp: clockedInRecord.session.otp,
          endTime: new Date(clockedInRecord.session.validUntil)
        });
      } else {
        setIsClockedIn(false);
        setCurrentSession(null);
      }
    };

    checkClockInStatus();
  }, [attendanceRecords]);

  // Timer for clock out countdown
  useEffect(() => {
    if (!isClockedIn || !currentSession) return;

    const interval = setInterval(() => {
      const now = new Date();
      const remaining = Math.max(0, currentSession.endTime.getTime() - now.getTime());
      setTimeRemaining(remaining);
      setCanClockOut(remaining === 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [isClockedIn, currentSession]);

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

      const response = await api.post('/attendance/mark', attendanceData);
      const responseData = response.data;
      
      const currentOtp = otpInput; // Save OTP before clearing
      setOtpInput('');
      fetchData(); // Refresh data
      
      // Handle clock in response
      if (responseData.isClockedIn) {
        setIsClockedIn(true);
        if (responseData.sessionEndTime) {
          setCurrentSession({
            otp: currentOtp,
            endTime: new Date(responseData.sessionEndTime)
          });
        }
        showAlert('Clock in successful! Please wait for class to end before clocking out.', 'success');
      } else {
        showAlert('Attendance marked successfully!', 'success');
      }
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

  const handleClockOut = async () => {
    if (!canClockOut || !currentSession) {
      showAlert('Please wait for class to end before clocking out', 'warning');
      return;
    }

    setClockingOut(true);
    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const clockOutData = {
        otp: currentSession.otp,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      const response = await api.post('/attendance/clock-out', clockOutData);
      showAlert(`Clock out successful! You attended for ${response.data.timeElapsed} minutes.`, 'success');
      
      // Reset states
      setIsClockedIn(false);
      setCurrentSession(null);
      setTimeRemaining(0);
      setCanClockOut(false);
      fetchData(); // Refresh data
    } catch (err: unknown) {
      if (err instanceof GeolocationPositionError) {
        showAlert('Location permission required. Please enable location services to clock out.', 'error');
      } else {
        const error = err as { response?: { data?: { message?: string } } };
        showAlert(error.response?.data?.message || 'Failed to clock out', 'error');
      }
    } finally {
      setClockingOut(false);
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-cmu-maroon">Student Dashboard</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your classes and track your attendance</p>
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
        <nav className="-mb-px flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto">
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
                className={`nav-item flex items-center space-x-1 sm:space-x-2 py-2 px-1 border-b-4 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'active border-cmu-maroon rounded '
                    : 'border-transparent hover:border-cmu-maroon'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
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
          {isClockedIn ? (
            /* Clock In Status */
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                  You are Clocked In
                </h3>
              </div>
              <div className="p-6">
                <div className="max-w-md mx-auto text-center">
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900 mb-2">
                      {timeRemaining > 0 
                        ? `Time remaining: ${formatTimeRemaining(timeRemaining)}`
                        : 'Class has ended. You can clock out now.'
                      }
                    </p>
                  </div>
                  
                  <button
                    onClick={handleClockOut}
                    disabled={!canClockOut || clockingOut}
                    className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center space-x-2 ${
                      canClockOut && !clockingOut
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {clockingOut ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Clocking Out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4" />
                        <span>Clock Out</span>
                      </>
                    )}
                  </button>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    You must wait for class to end before clocking out.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Clock In Form */
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Clock In</h3>
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
                      disabled={loading}
                      className="btn-cmu-primary flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Clock In</span>
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
                      <li>• You must wait for class to end before clocking out</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attendance Records Tab */}
      {activeTab === 'records' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Attendance Records</h3>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock In
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clock Out
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 sm:px-6 py-4 text-center text-gray-500 text-sm">
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((record) => {
                    const clockInTime = record.clockInTime ? new Date(record.clockInTime) : new Date(record.timestamp);
                    const clockOutTime = record.clockOutTime ? new Date(record.clockOutTime) : null;
                    const status = record.status || (clockOutTime ? 'COMPLETED' : 'CLOCKED_IN');
                    
                    return (
                      <tr key={record.id}>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {record.session.class.name}
                            </div>
                            {record.session.class.subject && (
                              <div className="text-xs sm:text-sm text-gray-500">
                                {record.session.class.subject}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {clockInTime.toLocaleString()}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {clockOutTime ? clockOutTime.toLocaleString() : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          {status === 'COMPLETED' ? (
                            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </span>
                          ) : status === 'CLOCKED_IN' ? (
                            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Clocked In
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
