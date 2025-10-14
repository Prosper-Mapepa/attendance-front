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
  duration: z.number().min(5).max(120),
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
    sessionCreated: string;
    sessionValidUntil: string;
  };
}

export default function AttendanceTracker() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { alert, showAlert, dismissAlert } = useAutoDismissAlert({ timeout: 6000 });
  const [, setSelectedSession] = useState<string>('');
  const [sessionAttendance, setSessionAttendance] = useState<SessionAttendance | null>(null);

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
      });
      
      const newSession = response.data;
      setSessions(prev => [newSession, ...prev]);
      form.reset();
      
      // Generate QR code for the new session
      const qrData = JSON.stringify({
        sessionId: newSession.id,
        otp: newSession.otp,
        classId: data.classId,
      });
      
      const qrCodeUrl = await QRCode.toDataURL(qrData);
      setQrCodeData(qrCodeUrl);
      setShowQR(true);
      showAlert('Session created successfully! QR code is ready.', 'success');
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-cmu-maroon">Attendance Tracker</h2>
          <p className="text-gray-600 mt-1">Create sessions and monitor student attendance</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cmu-maroon focus:border-cmu-maroon"
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
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Create Attendance Session</h3>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <input
                {...form.register('duration', { valueAsNumber: true })}
                type="number"
                min="5"
                max="120"
                defaultValue="15"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cmu-maroon focus:border-cmu-maroon"
              />
              {form.formState.errors.duration && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.duration.message}</p>
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
        <div className="fixed inset-0 bg-gradient-to-br from-cmu-maroon-dark via-cmu-maroon to-cmu-gold-dark bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-cmu-maroon to-cmu-maroon-dark p-6 rounded-lg max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-medium text-white mb-4 text-center">Attendance QR Code</h3>
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg mb-4">
                <img src={qrCodeData} alt="QR Code" className="mx-auto" />
              </div>
              <p className="text-sm text-cmu-gold-light mb-4">
                Students can scan this QR code to mark their attendance
              </p>
              <button
                onClick={() => setShowQR(false)}
                className="bg-cmu-gold text-cmu-maroon px-6 py-2 rounded-lg hover:bg-cmu-gold-dark hover:text-white font-medium transition-all duration-200 shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Attendance Modal */}
      {showSessionModal && sessionAttendance && (
        <div className="fixed inset-0 bg-[#7700010f] bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-cmu-maroon text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Session Attendance</h3>
                <button
                  onClick={() => {
                    setShowSessionModal(false);
                    setSessionAttendance(null);
                  }}
                  className="text-white hover:text-cmu-gold-light transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-6">
                {/* Session Summary */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-lg font-medium text-blue-900 mb-2">
                    {sessionAttendance.session.class.name}
                    {sessionAttendance.session.class.subject && (
                      <span className="text-blue-700"> - {sessionAttendance.session.class.subject}</span>
                    )}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
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
                      {sessionAttendance.attendanceRecords.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-lg font-medium">No students have marked attendance yet</p>
                            <p className="text-sm">Share the OTP or QR code with your students</p>
                          </td>
                        </tr>
                      ) : (
                        sessionAttendance.attendanceRecords.map((record) => (
                          <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {record.student.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.student.email}
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

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowSessionModal(false);
                    setSessionAttendance(null);
                  }}
                  className="bg-cmu-maroon text-white px-6 py-2 rounded-lg hover:bg-cmu-maroon-dark font-medium transition-all duration-200 shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Sessions</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredSessions.map((session) => {
            const isValid = new Date(session.validUntil) > new Date();
            return (
              <div key={session.id} className={`p-6 ${!isValid ? 'bg-gray-50 border-l-4 border-gray-400' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className={`text-lg font-medium ${isValid ? 'text-gray-900' : 'text-gray-600'}`}>
                        {session.class.name}
                      </h4>
                      <span className={`text-sm ${isValid ? 'text-gray-500' : 'text-gray-400'}`}>
                        ({session.class.subject})
                      </span>
                      {isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${isValid ? 'text-gray-600' : 'text-gray-500'}`}>
                      OTP: <span className={`font-mono font-semibold ${isValid ? '' : 'text-gray-400'}`}>
                        {session.otp}
                      </span>
                    </p>
                    <p className={`text-sm mt-1 ${isValid ? 'text-gray-500' : 'text-red-900'}`}>
                      Valid until: {new Date(session.validUntil).toLocaleString()}
                      {!isValid && <span className="ml-2 text-xs font-medium">(EXPIRED)</span>}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    {isValid ? (
                      <button
                        onClick={() => generateQRCode(session)}
                        className="flex items-center space-x-2 px-4 py-2 bg-cmu-maroon text-white hover:bg-cmu-maroon-dark rounded-lg transition-all duration-200 shadow-sm font-medium"
                        title="Generate QR Code for this session"
                      >
                        <QrCode className="h-4 w-4" />
                        <span>Show QR</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
                        <QrCode className="h-4 w-4" />
                        <span>Session Expired</span>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setSelectedSession(session.id);
                        fetchSessionAttendance(session.id);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-cmu-gold text-cmu-maroon hover:bg-cmu-gold-dark hover:text-white rounded-lg transition-all duration-200 shadow-sm font-medium"
                      title="View attendance records for this session"
                    >
                      <Users className="h-4 w-4" />
                      <span>View Attendance</span>
                    </button>
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
