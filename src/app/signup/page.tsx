'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Logo from '../components/LogoAuth';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['TEACHER', 'STUDENT']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError('');
    try {
      await register(data.name, data.email, data.password, data.role);
      // Redirect to dashboard after successful registration
      router.push('/');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-8 sm:mb-10">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-cmu-maroon-dark transition-colors font-normal text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Home
          </button>
        </div>
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="mb-3 sm:mb-4">
            <Logo size={80} variant="simple" showText={false} className="w-20 h-20 sm:w-28 sm:h-28" />
          </div>
          <p className="text-center text-base sm:text-lg text-gray-600 font-medium px-4">
            Create your account
          </p>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto">
        <div className="bg-white py-8 sm:py-10 px-5 sm:px-6 lg:px-10 shadow-md rounded-xl sm:rounded-2xl border border-gray-200/60">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-4 sm:space-y-5" onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  {...registerForm.register('name')}
                  type="text"
                  autoComplete="name"
                  className="appearance-none block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cmu-maroon focus:border-transparent text-sm sm:text-base transition-all bg-white"
                  placeholder="Enter your full name"
                />
              </div>
              {registerForm.formState.errors.name && (
                <p className="mt-1.5 text-xs sm:text-sm text-red-600">{registerForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  {...registerForm.register('email')}
                  type="email"
                  autoComplete="email"
                  className="appearance-none block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cmu-maroon focus:border-transparent text-sm sm:text-base transition-all bg-white"
                  placeholder="Enter your email"
                />
              </div>
              {registerForm.formState.errors.email && (
                <p className="mt-1.5 text-xs sm:text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Role
              </label>
              <select
                {...registerForm.register('role')}
                className="block w-full pl-3 pr-10 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cmu-maroon focus:border-transparent transition-all bg-white"
              >
                <option value="TEACHER">Instructor</option>
                <option value="STUDENT">Student</option>
              </select>
              {registerForm.formState.errors.role && (
                <p className="mt-1.5 text-xs sm:text-sm text-red-600">{registerForm.formState.errors.role.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  {...registerForm.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="appearance-none block w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cmu-maroon focus:border-transparent text-sm sm:text-base transition-all bg-white"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>
              </div>
              {registerForm.formState.errors.password && (
                <p className="mt-1.5 text-xs sm:text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  {...registerForm.register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="appearance-none block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cmu-maroon focus:border-transparent text-sm sm:text-base transition-all bg-white"
                  placeholder="Confirm your password"
                />
              </div>
              {registerForm.formState.errors.confirmPassword && (
                <p className="mt-1.5 text-xs sm:text-sm text-red-600">{registerForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="pt-1 sm:pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-cmu-primary w-full flex justify-center py-2.5 sm:py-3 px-4 text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="mt-6 sm:mt-8 text-center px-4">
        <p className="text-sm sm:text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/')}
            className="font-semibold text-cmu-maroon hover:text-cmu-maroon-dark transition-colors underline-offset-2 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <AuthProvider>
      <SignupForm />
    </AuthProvider>
  );
}

