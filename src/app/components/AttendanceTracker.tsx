'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QrCode, Users, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import api from '../lib/api';
import QRCode from 'qrcode';
import Alert from './Alert';
import { useAutoDismissAlert } from '../hooks/useAutoDismissAlert';

const sessionSchema = z.object({
  classId: z.string().min(1, 'Please select a class'),
  duration: z.number().min(1).max(30),
  classDuration: z.number().refine((val) => val > 0, {
    message: 'Class duration must be greater than 0',
  }),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface Class {
  id: string;
  name: string;
  subject: string;
  schedule: string;
}

interface Session {
  id: string;
  otp: string;
  validUntil: string;
  clockInDeadline?: string;
  classDuration?: number;
  createdAt: string;
  class: Class;
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  sessionId: string;
  timestamp: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
}

interface SessionAttendance {
  session: {
    id: string;
    otp: string;
    validUntil: string;
    clockInDeadline?: string;
    classDuration?: number;
    createdAt: string;
    class: {
      id: string;
      name: string;
      subject: string;
    };
  };
  attendanceRecords: AttendanceRecord[];
  summary: {
    totalAttended: number;
    clockedInCount?: number;
    completedCount?: number;
    sessionCreated: string;
    sessionValidUntil: string;
    clockInDeadline?: string;
  };
}

interface SessionStats {
  sessionId: string;
  clockedInCount: number;
  completedCount: number;
  totalCount: number;
  clockInDeadline: string;
  clockInDeadlinePassed: boolean;
  classDuration: number;
  createdAt: string;
  validUntil: string;
}

export default function AttendanceTracker() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [currentSessionOTP, setCurrentSessionOTP] = useState<string>('');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { alert, showAlert, dismissAlert } = useAutoDismissAlert({ timeout: 6000 });
  const [, setSelectedSession] = useState<string>('');
  const [sessionAttendance, setSessionAttendance] = useState<SessionAttendance | null>(null);
  const [sessionStats, setSessionStats] = useState<Record<string, SessionStats>>({});
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
  });

  useEffect(() => {
    fetchClasses();
    fetchSessions();
    fetchAttendanceRecords();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showAlert(error.response?.data?.message || 'Failed to fetch classes', 'error');
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions');
      setSessions(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showAlert(error.response?.data?.message || 'Failed to fetch sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const response = await api.get('/attendance');
      setAttendanceRecords(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showAlert(error.response?.data?.message || 'Failed to fetch attendance records', 'error');
    }
  };

  const onSubmit = async (data: SessionFormData) => {
    try {
      const response = await api.post('/sessions', {
        classId: data.classId,
        duration: data.duration,
        classDuration: data.classDuration,
      });
      
      const newSession = response.data;
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      form.reset();
      
      // Generate QR code for the new session
      const qrData = JSON.stringify({
        sessionId: newSession.id,
        otp: newSession.otp,
        classId: data.classId,
      });
      
      const qrCodeUrl = await QRCode.toDataURL(qrData);
      setQrCodeData(qrCodeUrl);
      setCurrentSessionOTP(newSession.otp);
      setShowQR(true);
      showAlert('Session created successfully! QR code is ready.', 'success');
      
      // Start fetching stats for this session
      fetchSessionStats(newSession.id);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showAlert(error.response?.data?.message || 'Failed to create session', 'error');
    }
  };

  const generateQRCode = async (session: Session) => {
    const qrData = JSON.stringify({
      sessionId: session.id,
      otp: session.otp,
      classId: session.class.id,
    });
    
    const qrCodeUrl = await QRCode.toDataURL(qrData);
    setQrCodeData(qrCodeUrl);
    setCurrentSessionOTP(session.otp);
    setShowQR(true);
  };

  const markAttendance = async (otp: string) => {
    try {
      await api.post('/attendance/mark', { otp });
      showAlert('Attendance marked successfully!', 'success');
      fetchAttendanceRecords();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showAlert(error.response?.data?.message || 'Failed to mark attendance', 'error');
    }
  };

  const fetchSessionAttendance = async (sessionId: string) => {
    try {
      const response = await api.get(`/attendance/session/${sessionId}`);
      setSessionAttendance(response.data);
      setShowSessionModal(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showAlert(error.response?.data?.message || 'Failed to fetch session attendance', 'error');
    }
  };

  const fetchSessionStats = async (sessionId: string) => {
    try {
      const response = await api.get(`/attendance/session/${sessionId}/stats`);
      setSessionStats(prev => ({
        ...prev,
        [sessionId]: response.data,
      }));
    } catch (err: unknown) {
      // Silently fail for stats - don't show error to user
      console.error('Failed to fetch session stats:', err);
    }
  };

  // Auto-refresh stats for active sessions
  useEffect(() => {
    if (!activeSessionId) return;

    const interval = setInterval(() => {
      fetchSessionStats(activeSessionId);
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [activeSessionId]);

  // Check for active sessions on mount and set active session
  useEffect(() => {
    const now = new Date();
    const activeSession = sessions.find(session => {
      const deadline = session.clockInDeadline ? new Date(session.clockInDeadline) : null;
      return deadline && now < deadline;
    });
    
    if (activeSession) {
      setActiveSessionId(activeSession.id);
      fetchSessionStats(activeSession.id);
    }
  }, [sessions]);

  const formatTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const remaining = Math.max(0, deadlineDate.getTime() - now.getTime());
    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const filteredSessions = selectedClass 
    ? sessions.filter(session => session.class.id === selectedClass)
    : sessions;

  const filteredAttendance = selectedClass
    ? attendanceRecords.filter(record => 
        sessions.find(session => session.id === record.sessionId)?.class.id === selectedClass
      )
    : attendanceRecords;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-cmu-maroon">Attendance Tracker</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Create sessions and monitor student attendance</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-cmu-maroon focus:border-cmu-maroon"
          >
            <option value="">All Classes</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name} - {classItem.subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onDismiss={dismissAlert}
        />
      )}

      {/* Create Session Form */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Create Attendance Session</h3>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Class</label>
              <select
                {...form.register('classId')}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cmu-maroon focus:border-cmu-maroon"
              >
                <option value="">Select a class</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name} - {classItem.subject}
                  </option>
                ))}
              </select>
              {form.formState.errors.classId && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.classId.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">OTP Duration / Clock-In Deadline (minutes)</label>
              <input
                {...form.register('duration', { valueAsNumber: true })}
                type="number"
                min="1"
                max="30"
                defaultValue="10"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cmu-maroon focus:border-cmu-maroon"
              />
              <p className="mt-1 text-xs text-gray-500">Students must clock in within this time. OTP expires after this. (1-30 min)</p>
              {form.formState.errors.duration && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.duration.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class Duration (minutes)</label>
              <input
                {...form.register('classDuration', { valueAsNumber: true })}
                type="number"
                min="0.01"
                step="any"
                defaultValue="90"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cmu-maroon focus:border-cmu-maroon"
              />
              <p className="mt-1 text-xs text-gray-500">Total class duration (must be greater than 0)</p>
              {form.formState.errors.classDuration && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.classDuration.message}</p>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="btn-cmu-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Session</span>
          </button>
        </form>
      </div>

      {/* QR Code Modal */}
      {showQR && qrCodeData && (
        <div className="fixed inset-0 bg-gradient-to-br from-cmu-maroon-dark via-cmu-maroon to-cmu-gold-dark bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gradient-to-br from-cmu-maroon to-cmu-maroon-dark p-4 sm:p-6 rounded-lg max-w-md w-full mx-2 sm:mx-4 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4 text-center">Attendance QR Code</h3>
            <div className="text-center">
              <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg mb-3 sm:mb-4 flex justify-center">
                <img 
                  src={qrCodeData} 
                  alt="QR Code" 
                  className="mx-auto max-w-full h-auto w-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px]" 
                />
              </div>
              
              {/* OTP Display */}
              {currentSessionOTP && (
                <div className="bg-white bg-opacity-20 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm text-cmu-gold-light mb-2">Manual OTP Entry:</p>
                  <div className="bg-white rounded-lg p-2 sm:p-3">
                    <span className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-cmu-maroon tracking-wider break-all">
                      {currentSessionOTP}
                    </span>
                  </div>
                  <p className="text-xs text-cmu-gold-light mt-2">
                    Students can also enter this code manually
                  </p>
                </div>
              )}
              
              <p className="text-xs sm:text-sm text-cmu-gold-light mb-3 sm:mb-4 px-2">
                Students can scan this QR code to mark their attendance
              </p>
              <button
                onClick={() => setShowQR(false)}
                className="w-full sm:w-auto bg-cmu-gold text-cmu-maroon px-4 sm:px-6 py-2 rounded-lg hover:bg-cmu-gold-dark hover:text-white font-medium transition-all duration-200 shadow-sm text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Attendance Modal */}
      {showSessionModal && sessionAttendance && (
        <div className="fixed inset-0 bg-[#7700010f] bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200 bg-cmu-maroon text-white flex-shrink-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base sm:text-lg font-medium truncate">Session Attendance</h3>
                <button
                  onClick={() => {
                    setShowSessionModal(false);
                    setSessionAttendance(null);
                  }}
                  className="text-white hover:text-cmu-gold-light transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1">
              <div className="p-3 sm:p-4 md:p-6">
                {/* Session Summary */}
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-base sm:text-lg font-medium text-blue-900 mb-2 break-words">
                    {sessionAttendance.session.class.name}
                    {sessionAttendance.session.class.subject && (
                      <span className="text-blue-700"> - {sessionAttendance.session.class.subject}</span>
                    )}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="font-medium text-blue-800">OTP:</span>
                      <span className="ml-2 font-mono">{sessionAttendance.session.otp}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Total Attended:</span>
                      <span className="ml-2 font-semibold">{sessionAttendance.summary.totalAttended}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Session Duration:</span>
                      <span className="ml-2">
                        {new Date(sessionAttendance.session.createdAt).toLocaleString()} - {new Date(sessionAttendance.session.validUntil).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attendance List */}
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance Time
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sessionAttendance.attendanceRecords.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500">
                            <Users className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                            <p className="text-base sm:text-lg font-medium">No students have marked attendance yet</p>
                            <p className="text-xs sm:text-sm mt-1">Share the OTP or QR code with your students</p>
                          </td>
                        </tr>
                      ) : (
                        sessionAttendance.attendanceRecords.map((record) => (
                          <tr key={record.id}>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <div className="text-xs sm:text-sm font-medium text-gray-900">
                                {record.student.name}
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                              {record.student.email}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                              {new Date(record.timestamp).toLocaleString()}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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

            {/* Modal Footer */}
            <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowSessionModal(false);
                    setSessionAttendance(null);
                  }}
                  className="w-full sm:w-auto bg-cmu-maroon text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-cmu-maroon-dark font-medium transition-all duration-200 shadow-sm text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
        </div>
        <div className="p-5 space-y-3">
          {filteredSessions.map((session) => {
            const isValid = new Date(session.validUntil) > new Date();
            const stats = sessionStats[session.id];
            const clockInDeadline = session.clockInDeadline ? new Date(session.clockInDeadline) : null;
            const clockInDeadlinePassed = clockInDeadline ? new Date() > clockInDeadline : false;
            const isActive = clockInDeadline && !clockInDeadlinePassed;
            
            // Auto-fetch stats for active sessions
            if (isActive && !stats) {
              fetchSessionStats(session.id);
            }
            
            return (
              <div 
                key={session.id} 
                className={`rounded-lg border transition-all ${
                  !isValid 
                    ? 'bg-gray-50 border-gray-200' 
                    : isActive 
                      ? 'bg-white border-cmu-maroon border-2 shadow-md' 
                      : 'bg-white border-gray-200'
                }`}
              >
                <div className="p-5">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className={`text-lg font-semibold ${isValid ? 'text-gray-900' : 'text-gray-500'}`}>
                          {session.class.name}
                        </h4>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-cmu-maroon text-white text-xs font-medium rounded">
                            ACTIVE
                          </span>
                        )}
                        {!isValid && (
                          <span className="px-2 py-0.5 bg-gray-300 text-gray-600 text-xs font-medium rounded">
                            EXPIRED
                          </span>
                        )}
                      </div>
                      {session.class.subject && (
                        <p className={`text-sm mb-3 ${isValid ? 'text-gray-600' : 'text-gray-400'}`}>
                          {session.class.subject}
                        </p>
                      )}
                      
                      {/* OTP Display */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded">
                        <span className="text-xs font-medium text-gray-600">OTP:</span>
                        <span className={`text-base font-mono font-semibold ${isValid ? 'text-cmu-maroon' : 'text-gray-400'}`}>
                          {session.otp}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      {isValid ? (
                        <button
                          onClick={() => generateQRCode(session)}
                          className="flex items-center gap-2 px-4 py-2 bg-cmu-maroon text-white hover:bg-cmu-maroon-dark rounded transition-colors text-sm font-medium"
                          title="Generate QR Code for this session"
                        >
                          <QrCode className="h-4 w-4" />
                          <span>Show QR</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed text-sm font-medium">
                          <QrCode className="h-4 w-4" />
                          <span>Expired</span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setSelectedSession(session.id);
                          fetchSessionAttendance(session.id);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-cmu-gold text-cmu-maroon hover:bg-cmu-gold-dark hover:text-white rounded transition-colors text-sm font-medium"
                        title="View attendance records for this session"
                      >
                        <Users className="h-4 w-4" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Real-time Stats */}
                  {stats && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="text-xs font-medium text-gray-600 mb-1">Clocked In</p>
                        <p className="text-2xl font-bold text-cmu-maroon">{stats.clockedInCount}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="text-xs font-medium text-gray-600 mb-1">Completed</p>
                        <p className="text-2xl font-bold text-cmu-maroon">{stats.completedCount}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="text-xs font-medium text-gray-600 mb-1">Total</p>
                        <p className="text-2xl font-bold text-gray-700">{stats.totalCount}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Clock-In Deadline Countdown */}
                  {clockInDeadline && (
                    <div className={`p-3 rounded border ${
                      !clockInDeadlinePassed 
                        ? 'bg-cmu-gold bg-opacity-10 border-cmu-gold' 
                        : 'bg-gray-100 border-gray-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${!clockInDeadlinePassed ? 'text-cmu-maroon' : 'text-gray-600'}`}>
                          Clock-In Deadline
                        </span>
                        {!clockInDeadlinePassed ? (
                          <span className="text-lg font-bold text-cmu-maroon font-mono">
                            {formatTimeRemaining(session.clockInDeadline!)}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-300 text-gray-700 text-xs font-medium rounded">
                            CLOSED
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Session Info Footer */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Valid until: {new Date(session.validUntil).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active sessions</h3>
            <p className="mt-1 text-sm text-gray-500">Create a new session to start tracking attendance.</p>
          </div>
        )}
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Attendance Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{record.student.name}</div>
                      <div className="text-sm text-gray-500">{record.student.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sessions.find(s => s.id === record.sessionId)?.class.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAttendance.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
              <p className="mt-1 text-sm text-gray-500">Attendance records will appear here once students mark their attendance.</p>
            </div>
          )}
        </div>
      </div>

      {/* Student Attendance Input */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Mark Attendance (Student)</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Enter OTP from teacher"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cmu-maroon focus:border-cmu-maroon"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const otp = (e.target as HTMLInputElement).value;
                if (otp) {
                  markAttendance(otp);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Enter OTP from teacher"]') as HTMLInputElement;
              if (input?.value) {
                markAttendance(input.value);
                input.value = '';
              }
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Mark Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
