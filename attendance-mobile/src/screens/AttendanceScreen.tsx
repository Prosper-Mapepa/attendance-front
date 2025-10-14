import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

const AttendanceScreen: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'Please enable location services to mark attendance.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const markAttendance = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP code');
      return;
    }

    setLoading(true);
    try {
      // Request location permission
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Get device info
      const deviceInfo = {
        userAgent: 'CMU-Mobile-App',
        screenResolution: 'Mobile',
      };

      // Prepare attendance data
      const attendanceData = {
        otp: otp.trim(),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        ...deviceInfo,
      };

      // Submit attendance
      await api.post('/attendance/mark', attendanceData);
      
      Alert.alert(
        'Success!',
        'Your attendance has been marked successfully.',
        [
          {
            text: 'OK',
            onPress: () => setOtp(''),
          },
        ]
      );
    } catch (error: any) {
      let errorMessage = 'Failed to mark attendance';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          {/* <Text style={styles.title}>Mark Attendance</Text> */}
          <Text style={styles.subtitle}>
            Enter the OTP code from your teacher's QR code
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>OTP Code</Text>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter OTP code"
              keyboardType="numeric"
              maxLength={6}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={markAttendance}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Mark Attendance</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📍 Location Requirements</Text>
          <Text style={styles.infoText}>
            • You must be physically present in the classroom
          </Text>
          <Text style={styles.infoText}>
            • Location services must be enabled
          </Text>
          <Text style={styles.infoText}>
            • You must be within 50 meters of the class location
          </Text>
          <Text style={styles.infoText}>
            • If you're in the correct room but get an error, ask your teacher to check the class location settings
          </Text>
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>💡 How to get the OTP:</Text>
          <Text style={styles.helpText}>
            1. Your teacher will display a QR code
          </Text>
          <Text style={styles.helpText}>
            2. Scan the QR code or ask for the OTP number
          </Text>
          <Text style={styles.helpText}>
            3. Enter the OTP code above
          </Text>
          <Text style={styles.helpText}>
            4. Tap "Mark Attendance"
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#8B0000',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    backgroundColor: '#f9f9f9',
  },
  submitButton: {
    backgroundColor: '#8B0000',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 4,
    lineHeight: 20,
  },
  helpCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f57c00',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#f57c00',
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default AttendanceScreen;

