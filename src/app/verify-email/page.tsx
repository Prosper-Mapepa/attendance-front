'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import Logo from '../components/Logo';
import api from '../lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing verification token');
      return;
    }

    // On mobile devices, try to open the app if installed
    if (typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      // Try to open the app with deep link
      const deepLink = `attendiq://verify-email?token=${token}`;
      
      // Attempt to open the app
      window.location.href = deepLink;
      
      // If app doesn't open within 2 seconds, stay on web page
      setTimeout(() => {
        // User can continue with web-based verification
      }, 2000);
    }
  }, [token]);

  const handleVerifyEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid verification token');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-email', {
        token,
      });
      
      setSuccess(true);
      
      // Redirect to login after success
      setTimeout(() => {
        router.push('/?emailVerified=success');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify on page load if token exists
  useEffect(() => {
    if (token && !loading && !success && !error) {
      handleVerifyEmail();
    }
  }, [token]);

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified!</h2>
          <p className="text-gray-600 mb-6">
            Your email address has been successfully updated. You can now login with your new email address.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#8B0000] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#A00000] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A00000] via-[#8B0000] to-[#6B0000] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo size={80} variant="simple" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Attend<span className="text-[#FFD700]">IQ</span>
          </h1>
          <p className="text-white/90">Verify Your Email</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {loading && !error && (
            <div className="text-center py-8">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verifying Email...</h3>
              <p className="text-gray-600">Please wait while we verify your email address.</p>
            </div>
          )}

          {!loading && !error && !success && (
            <div className="text-center py-8">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Verify</h3>
              <p className="text-gray-600 mb-6">Click the button below to verify your email address.</p>
              <button
                onClick={handleVerifyEmail}
                className="w-full bg-[#8B0000] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#A00000] transition-colors"
              >
                Verify Email
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-[#8B0000] hover:underline font-medium"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
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
      <VerifyEmailContent />
    </Suspense>
  );
}



