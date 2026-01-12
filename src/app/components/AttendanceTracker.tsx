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
  clockInTime?: string | null;
  clockOutTime?: string | null;
  status?: string;
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
  const [sessionTab, setSessionTab] = useState<'active' | 'inactive'>('active');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [currentSessionOTP, setCurrentSessionOTP] = useState<string>('');
  const [currentSessionDeadline, setCurrentSessionDeadline] = useState<string | null>(null);
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
      setCurrentSessionDeadline(newSession.clockInDeadline || newSession.validUntil);
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
    setCurrentSessionDeadline(session.clockInDeadline || session.validUntil);
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

  // Auto-close QR modal when deadline expires
  useEffect(() => {
    if (!showQR || !currentSessionDeadline) return;

    const deadline = new Date(currentSessionDeadline);
    const now = new Date();
    const timeUntilDeadline = deadline.getTime() - now.getTime();

    // If deadline has already passed, close immediately
    if (timeUntilDeadline <= 0) {
      setShowQR(false);
      setCurrentSessionDeadline(null);
      showAlert('Clock-in deadline has expired. The session is now closed.', 'info');
      return;
    }

    // Set timeout to close modal when deadline expires
    const timeout = setTimeout(() => {
      setShowQR(false);
      setCurrentSessionDeadline(null);
      showAlert('Clock-in deadline has expired. The session is now closed.', 'info');
    }, timeUntilDeadline);

    return () => clearTimeout(timeout);
  }, [showQR, currentSessionDeadline]);

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

  // Filter sessions by active/inactive status
  const getSessionStatus = (session: Session) => {
    const isValid = new Date(session.validUntil) > new Date();
    const clockInDeadline = session.clockInDeadline ? new Date(session.clockInDeadline) : null;
    const clockInDeadlinePassed = clockInDeadline ? new Date() > clockInDeadline : false;
    const isActive = clockInDeadline && !clockInDeadlinePassed && isValid;
    return isActive;
  };

  const filteredSessions = sessions.filter(session => {
    const isActive = getSessionStatus(session);
    const matchesTab = sessionTab === 'active' ? isActive : !isActive;
    const matchesClass = selectedClass ? session.class.id === selectedClass : true;
    return matchesTab && matchesClass;
  });

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
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-cmu-maroon via-cmu-maroon to-cmu-maroon-dark rounded-xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Attendance Tracker</h2>
                <p className="text-sm sm:text-base text-white/90 mt-1">Create sessions and monitor student attendance</p>
              </div>
            </div>
          </div>
          {/* <div className="flex-shrink-0">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full sm:w-auto bg-white border-2 border-white/20 rounded-lg px-4 py-2.5 text-sm sm:text-base font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-md hover:shadow-lg transition-all"
            >
              <option value="">All Classes</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name} - {classItem.subject}
                </option>
              ))}
            </select>
          </div> */}
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
      <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Create Attendance Session</h3>
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
              <p className="mt-1 text-xs text-gray-500">Students must clock in within this time. OTP expires after this.</p>
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
              {/* <p className="mt-1 text-xs text-gray-500">Total class duration (must be greater than 0)</p> */}
              {form.formState.errors.classDuration && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.classDuration.message}</p>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="bg-cmu-maroon text-white px-6 py-3 rounded-lg hover:bg-cmu-maroon-dark font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Create Session</span>
          </button>
        </form>
      </div>

      {/* QR Code Modal */}
      {showQR && qrCodeData && (
        <div className="fixed inset-0 bg-gradient-to-br from-cmu-maroon-dark via-cmu-maroon to-cmu-gold-dark bg-opacity-95 flex items-center justify-center z-50 p-3 sm:p-4 md:p-5 overflow-y-auto">
          <div className="bg-gradient-to-br from-cmu-maroon to-cmu-maroon-dark p-4 sm:p-5 md:p-6 rounded-xl max-w-5xl w-full mx-2 sm:mx-3 my-3 sm:my-4 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowQR(false);
                setCurrentSessionDeadline(null);
              }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 flex items-center justify-center group"
              aria-label="Close"
            >
              <XCircle className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
            </button>
            
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-5 md:mb-6 text-center pr-10">Attendance QR Code</h3>
            
            {/* Two Column Layout - Optimized for 14" screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8 items-center">
              {/* Left Column - QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-3 sm:p-4 md:p-5 rounded-xl shadow-xl w-full flex justify-center">
                  <img 
                    src={qrCodeData} 
                    alt="QR Code" 
                    className="w-full max-w-[240px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-[380px] h-auto" 
                  />
                </div>
                <p className="text-xs sm:text-sm text-cmu-gold mt-2 sm:mt-3 text-center px-2 font-medium">
                  Students can scan this QR code to mark their attendance
                </p>
              </div>
              
              {/* Right Column - OTP and Countdown */}
              <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
                {/* OTP Display */}
                {currentSessionOTP && (
                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-lg border-2 border-cmu-gold/20">
                    <p className="text-sm sm:text-base md:text-lg font-bold text-cmu-maroon mb-3 sm:mb-4 text-center uppercase tracking-wide">
                      Manual OTP Entry:
                    </p>
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 sm:p-4 md:p-5 border-2 border-cmu-maroon/10">
                      <span className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-mono font-bold text-cmu-maroon tracking-wider block text-center break-all leading-tight">
                        {currentSessionOTP}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 text-center">
                      Students can also enter this code manually
                    </p>
                  </div>
                )}
                
                {/* Deadline countdown */}
                {currentSessionDeadline && (
                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-lg border-2 border-cmu-gold/20">
                    <p className="text-sm sm:text-base md:text-lg font-bold text-cmu-maroon mb-3 sm:mb-4 text-center uppercase tracking-wide">
                      Time remaining:
                    </p>
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 sm:p-4 md:p-5 border-2 border-cmu-maroon/10">
                      <p className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold text-cmu-maroon font-mono text-center tracking-wider leading-tight">
                        {formatTimeRemaining(currentSessionDeadline)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-br from-cmu-maroon/5 to-cmu-maroon/10 rounded-lg border border-cmu-maroon/20">
                  <h4 className="text-base sm:text-lg font-medium text-cmu-maroon mb-2 break-words">
                    {sessionAttendance.session.class.name}
                    {sessionAttendance.session.class.subject && (
                      <span className="text-cmu-maroon/80"> - {sessionAttendance.session.class.subject}</span>
                    )}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="font-semibold text-cmu-maroon">OTP:</span>
                      <span className="ml-2 font-mono text-gray-700">{sessionAttendance.session.otp}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-cmu-maroon">Total Attended:</span>
                      <span className="ml-2 font-semibold text-gray-700">{sessionAttendance.summary.totalAttended}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-cmu-maroon">Session Duration:</span>
                      <span className="ml-2 text-gray-700">
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
                          Clock In Time
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Clock Out Time
                        </th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sessionAttendance.attendanceRecords.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500">
                            <Users className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                            <p className="text-base sm:text-lg font-medium">No students have marked attendance yet</p>
                            <p className="text-xs sm:text-sm mt-1">Share the OTP or QR code with your students</p>
                          </td>
                        </tr>
                      ) : (
                        sessionAttendance.attendanceRecords.map((record) => {
                          const clockInTime = record.clockInTime ? new Date(record.clockInTime) : (record.timestamp ? new Date(record.timestamp) : null);
                          const clockOutTime = record.clockOutTime ? new Date(record.clockOutTime) : null;
                          const didNotClockOut = clockInTime && !clockOutTime;
                          const status = record.status || (clockOutTime ? 'COMPLETED' : clockInTime ? 'CLOCKED_IN' : 'UNKNOWN');
                          
                          return (
                            <tr 
                              key={record.id}
                              className={didNotClockOut ? 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-400' : ''}
                            >
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="text-xs sm:text-sm font-medium text-gray-900">
                                  {record.student.name}
                                  {didNotClockOut && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-200 text-yellow-800">
                                      No Clock Out
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                {record.student.email}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                                {clockInTime ? clockInTime.toLocaleString() : '-'}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                                {clockOutTime ? (
                                  <span className="text-gray-900">{clockOutTime.toLocaleString()}</span>
                                ) : (
                                  <span className="text-yellow-600 font-semibold">Not clocked out</span>
                                )}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                {status === 'COMPLETED' ? (
                                  <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Completed
                                  </span>
                                ) : status === 'CLOCKED_IN' || didNotClockOut ? (
                                  <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Clocked In
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Present
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

      {/* Sessions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Sessions</h3>
          </div>
          {/* Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setSessionTab('active')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                sessionTab === 'active'
                  ? 'bg-cmu-maroon text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Active Sessions
            </button>
            <button
              onClick={() => setSessionTab('inactive')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                sessionTab === 'inactive'
                  ? 'bg-cmu-maroon text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Inactive Sessions
            </button>
          </div>
        </div>
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          {filteredSessions.map((session) => {
            const isValid = new Date(session.validUntil) > new Date();
            const stats = sessionStats[session.id];
            const clockInDeadline = session.clockInDeadline ? new Date(session.clockInDeadline) : null;
            const clockInDeadlinePassed = clockInDeadline ? new Date() > clockInDeadline : false;
            const isActive = clockInDeadline && !clockInDeadlinePassed;
            
            // Auto-fetch stats for all sessions (active and inactive)
            if (!stats) {
              fetchSessionStats(session.id);
            }
            
            return (
              <div 
                key={session.id} 
                className={`rounded-xl border transition-all duration-300 hover:shadow-lg ${
                  !isValid 
                    ? 'bg-gray-50 border-gray-200' 
                    : isActive 
                      ? 'bg-white border-cmu-maroon border-2 shadow-md' 
                      : 'bg-white border-gray-200 hover:border-cmu-maroon/30'
                }`}
              >
                <div className="p-5 sm:p-6">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-4 sm:mb-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <h4 className={`text-lg sm:text-xl font-bold ${isValid ? 'text-gray-900' : 'text-gray-500'}`}>
                          {session.class.name}
                        </h4>
                        {isActive && (
                          <span className="ml-2 flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-cmu-gold text-cmu-maroon animate-pulse">
                            Active
                          </span>
                        )}
                        {!isValid && (
                          <span className="ml-2 flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-300 text-gray-600">
                            Expired
                          </span>
                        )}
                      </div>
                      {session.class.subject && (
                        <p className={`text-sm sm:text-base mb-3 ${isValid ? 'text-gray-600' : 'text-gray-400'}`}>
                          {session.class.subject}
                        </p>
                      )}
                      
                      {/* OTP Display */}
                      <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 shadow-sm">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">OTP:</span>
                        <span className={`text-base sm:text-lg font-mono font-bold ${isValid ? 'text-cmu-maroon' : 'text-gray-400'}`}>
                          {session.otp}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-3 ml-4 flex-shrink-0">
                      {isValid ? (
                        <button
                          onClick={() => generateQRCode(session)}
                          className="flex items-center gap-2 px-4 py-2 bg-cmu-maroon text-white hover:bg-cmu-maroon-dark rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                          title="Generate QR Code for this session"
                        >
                          <QrCode className="h-4 w-4" />
                          <span className="hidden sm:inline">Show QR</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed text-sm font-medium">
                          <QrCode className="h-4 w-4" />
                          <span className="hidden sm:inline">Expired</span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setSelectedSession(session.id);
                          fetchSessionAttendance(session.id);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-cmu-gold text-cmu-maroon hover:bg-cmu-gold-dark hover:text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                        title="View attendance records for this session"
                      >
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Real-time Stats - Always show for both active and inactive sessions */}
                  {stats ? (
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
                      <div className="bg-gradient-to-br from-cmu-maroon/10 to-cmu-maroon/5 p-4 rounded-lg border-2 border-cmu-maroon/30 shadow-sm">
                        <p className="text-xs font-semibold text-cmu-maroon uppercase tracking-wide mb-2">Clocked In</p>
                        <p className="text-2xl sm:text-3xl font-bold text-cmu-maroon">{stats.clockedInCount}</p>
                      </div>
                      <div className="bg-gradient-to-br from-cmu-gold/20 to-cmu-gold/10 p-4 rounded-lg border-2 border-cmu-gold/40 shadow-sm">
                        <p className="text-xs font-semibold text-cmu-maroon uppercase tracking-wide mb-2">Completed</p>
                        <p className="text-2xl sm:text-3xl font-bold text-cmu-maroon">{stats.completedCount}</p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Total</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalCount}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
                      <div className="bg-gradient-to-br from-cmu-maroon/10 to-cmu-maroon/5 p-4 rounded-lg border-2 border-cmu-maroon/30 shadow-sm">
                        <p className="text-xs font-semibold text-cmu-maroon uppercase tracking-wide mb-2">Clocked In</p>
                        <p className="text-2xl sm:text-3xl font-bold text-cmu-maroon">-</p>
                      </div>
                      <div className="bg-gradient-to-br from-cmu-gold/20 to-cmu-gold/10 p-4 rounded-lg border-2 border-cmu-gold/40 shadow-sm">
                        <p className="text-xs font-semibold text-cmu-maroon uppercase tracking-wide mb-2">Completed</p>
                        <p className="text-2xl sm:text-3xl font-bold text-cmu-maroon">-</p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Total</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">-</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Clock-In Deadline Countdown */}
                  {clockInDeadline && (
                    <div className={`p-4 rounded-lg border-2 ${
                      !clockInDeadlinePassed 
                        ? 'bg-gradient-to-br from-cmu-gold/10 to-cmu-gold/5 border-cmu-gold' 
                        : 'bg-gray-100 border-gray-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold uppercase tracking-wide ${!clockInDeadlinePassed ? 'text-cmu-maroon' : 'text-gray-600'}`}>
                          Clock-In Deadline
                        </span>
                        {!clockInDeadlinePassed ? (
                          <span className="text-xl sm:text-2xl font-bold text-cmu-maroon font-mono">
                            {formatTimeRemaining(session.clockInDeadline!)}
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg">
                            CLOSED
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Session Info Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">
                      Valid until: {new Date(session.validUntil).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filteredSessions.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
              {sessionTab === 'active' ? 'No active sessions' : 'No inactive sessions'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {sessionTab === 'active' 
                ? 'Create a new session to start tracking attendance.' 
                : 'All sessions are currently active.'}
            </p>
          </div>
        )}
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Attendance Records</h3>
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
            <div className="text-center py-12 sm:py-16">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">No attendance records</h3>
              <p className="text-sm sm:text-base text-gray-600">Attendance records will appear here once students mark their attendance.</p>
            </div>
          )}
        </div>
      </div>

      {/* Student Attendance Input */}
      {/* <div className="bg-white p-6 rounded-lg shadow">
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
      </div> */}
    </div>
  );
}
