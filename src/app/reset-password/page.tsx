'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';
import api from '../lib/api';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'fair' | 'good' | 'strong'>('weak');

  const [attemptedDeepLink, setAttemptedDeepLink] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }
  }, [token]);

  // Graceful deep linking - only attempt when user is on mobile and hasn't attempted yet
  const attemptDeepLink = () => {
    if (attemptedDeepLink || !token) return;
    
    if (typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      setAttemptedDeepLink(true);
      const deepLink = `attendiq://reset-password?token=${token}`;
      
      // Use hidden iframe for graceful deep linking (doesn't navigate away)
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = deepLink;
      document.body.appendChild(iframe);
      
      // Remove iframe after a short delay
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
  };

  const calculatePasswordStrength = (password: string): 'weak' | 'fair' | 'good' | 'strong' => {
    if (password.length === 0) return 'weak';
    
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'fair';
    if (score <= 6) return 'good';
    return 'strong';
  };

  const getPasswordStrengthColor = (strength: 'weak' | 'fair' | 'good' | 'strong'): string => {
    switch (strength) {
      case 'weak': return '#FF6B6B';
      case 'fair': return '#FF8C00';
      case 'good': return '#FFD700';
      case 'strong': return '#8B0000';
      default: return '#FF6B6B';
    }
  };

  const getPasswordStrengthText = (strength: 'weak' | 'fair' | 'good' | 'strong'): string => {
    switch (strength) {
      case 'weak': return 'Weak';
      case 'fair': return 'Fair';
      case 'good': return 'Good';
      case 'strong': return 'Strong';
      default: return 'Weak';
    }
  };

  const validatePassword = (password: string): { isValid: boolean; error?: string } => {
    if (password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters' };
    }
    if (password.length > 50) {
      return { isValid: false, error: 'Password must be less than 50 characters' };
    }
    
    const strength = calculatePasswordStrength(password);
    if (strength === 'weak') {
      return { 
        isValid: false, 
        error: 'Password is too weak. Use uppercase, lowercase, numbers, and special characters.' 
      };
    }
    
    return { isValid: true };
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordStrength(calculatePasswordStrength(text));
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    if (!password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || 'Invalid password');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: password,
      });
      
      setSuccess(true);
      
      // Redirect to login after success
      setTimeout(() => {
        router.push('/?reset=success');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A00000] via-[#8B0000] to-[#6B0000] flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Password Reset Successful!</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
            Your password has been reset successfully. You can now login with your new password.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#8B0000] text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-[#A00000] active:bg-[#6B0000] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A00000] via-[#8B0000] to-[#6B0000] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex justify-center mb-5 sm:mb-6">
            <Logo size={64} variant="simple" showText={false} className="sm:w-20 sm:h-20" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Reset Password
          </h1>
          <p className="text-sm sm:text-base text-white/80">Enter your new password below</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
          {/* Mobile App Option - Only show on mobile devices */}
          {typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && token && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800 mb-2 font-medium">Have the AttendIQ app?</p>
              <button
                type="button"
                onClick={attemptDeepLink}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                Open in App →
              </button>
            </div>
          )}

          {error && (
            <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-5 sm:space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="block w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] transition-all bg-white text-gray-900 placeholder-gray-400"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:opacity-70 transition-opacity"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex gap-1.5">
                      {[1, 2, 3, 4].map((segment) => {
                        const isActive = 
                          (passwordStrength === 'weak' && segment <= 1) ||
                          (passwordStrength === 'fair' && segment <= 2) ||
                          (passwordStrength === 'good' && segment <= 3) ||
                          (passwordStrength === 'strong' && segment <= 4);
                        
                        const colors = ['#FF6B6B', '#FF8C00', '#FFD700', '#8B0000'];
                        return (
                          <div
                            key={segment}
                            className="flex-1 h-1.5 rounded-full transition-all"
                            style={{
                              backgroundColor: isActive ? colors[segment - 1] : '#E5E7EB',
                            }}
                          />
                        );
                      })}
                    </div>
                    <span
                      className="text-xs font-bold min-w-[50px] text-right"
                      style={{ color: getPasswordStrengthColor(passwordStrength) }}
                    >
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] transition-all bg-white text-gray-900 placeholder-gray-400"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:opacity-70 transition-opacity"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-[#8B0000] text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-[#A00000] active:bg-[#6B0000] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Resetting...</span>
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-[#8B0000] hover:text-[#A00000] font-medium transition-colors inline-flex items-center gap-1"
            >
              <span>←</span>
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#A00000] via-[#8B0000] to-[#6B0000] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <Logo size={80} variant="simple" />
          </div>
          <p className="text-white/90">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}



