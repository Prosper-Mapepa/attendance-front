import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface Class {
  id: string;
  name: string;
  subject?: string;
  schedule?: string;
  description?: string;
}

interface Enrollment {
  id: string;
  class: Class;
  enrolledAt: string;
}

interface AttendanceRecord {
  id: string;
  timestamp: string;
  session: {
    id: string;
    otp: string;
    class: {
      name: string;
      subject?: string;
    };
  };
}

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrollmentsRes, attendanceRes] = await Promise.all([
        api.get('/enrollments'),
        api.get('/attendance'),
      ]);
      setEnrollments(enrollmentsRes.data);
      setAttendanceRecords(attendanceRes.data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B0000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{enrollments.length}</Text>
          <Text style={styles.statLabel}>Classes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{attendanceRecords.length}</Text>
          <Text style={styles.statLabel}>Attendance Records</Text>
        </View>
      </View>

      {/* My Classes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Classes</Text>
        {enrollments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No classes enrolled</Text>
            <Text style={styles.emptySubtext}>
              Contact your teacher to enroll in classes
            </Text>
          </View>
        ) : (
          enrollments.map((enrollment) => (
            <View key={enrollment.id} style={styles.classCard}>
              <View style={styles.classHeader}>
                <Text style={styles.className}>{enrollment.class.name}</Text>
                {enrollment.class.subject && (
                  <Text style={styles.classSubject}>{enrollment.class.subject}</Text>
                )}
              </View>
              {enrollment.class.schedule && (
                <Text style={styles.classSchedule}>{enrollment.class.schedule}</Text>
              )}
              {enrollment.class.description && (
                <Text style={styles.classDescription}>{enrollment.class.description}</Text>
              )}
            </View>
          ))
        )}
      </View>

      {/* Recent Attendance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Attendance</Text>
        {attendanceRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No attendance records</Text>
            <Text style={styles.emptySubtext}>
              Mark attendance when your teacher starts a session
            </Text>
          </View>
        ) : (
          attendanceRecords.slice(0, 5).map((record) => (
            <View key={record.id} style={styles.attendanceCard}>
              <View style={styles.attendanceHeader}>
                <Text style={styles.attendanceClass}>
                  {record.session.class.name}
                </Text>
                <Text style={styles.attendanceTime}>
                  {new Date(record.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.attendanceOTP}>
                OTP: {record.session.otp}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#8B0000',
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#FFD700', // CMU Gold
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#8B0000',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  classCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    marginBottom: 8,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  classSubject: {
    fontSize: 14,
    color: '#8B0000',
    fontWeight: '600',
  },
  classSchedule: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  classDescription: {
    fontSize: 14,
    color: '#999',
  },
  attendanceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  attendanceClass: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  attendanceTime: {
    fontSize: 14,
    color: '#666',
  },
  attendanceOTP: {
    fontSize: 14,
    color: '#8B0000',
    fontFamily: 'monospace',
  },
});

export default DashboardScreen;

