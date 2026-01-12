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
  email: z.string()
    .email('Invalid email address')
    .refine((email) => email.endsWith('@cmich.edu'), {
      message: 'Email must be from @cmich.edu domain',
    }),
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
    <div className="min-h-screen relative bg-gradient-to-br from-[#8D0000] via-[#6B0000] via-[#8D0000] to-[#6B0000] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#8D0000] via-[#6B0000] via-[#6B0000] to-[#6B0000]"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cmu-gold/8 via-cmu-gold/5 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#6B0000]/80 via-[#6B0000]/40 via-[#6B0000]/15 to-transparent"></div>
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='%23ffffff' stroke-width='0.2'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-cmu-gold/12 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-[450px] h-[450px] bg-cmu-gold/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      
      <div className="relative w-full max-w-md mx-auto z-10">
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-white/90 hover:text-white transition-colors font-medium text-sm sm:text-base group"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Home
          </button>
        </div>
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-5 relative">
            <div className="absolute inset-0 bg-cmu-gold/20 rounded-full blur-xl animate-pulse"></div>
            <Logo size={80} variant="simple" showText={false} className="w-20 h-20 sm:w-28 sm:h-28 relative z-10" />
          </div>
          <h1 className="text-center text-2xl sm:text-3xl md:text-4xl text-white font-bold mb-2 drop-shadow-lg">
            Create your account
          </h1>
          <p className="text-center text-sm sm:text-base text-white/80">
            Join AttendIQ and streamline your attendance
          </p>
        </div>
      </div>

      <div className="relative w-full max-w-md mx-auto z-10">
        <div className="bg-white/95 backdrop-blur-2xl py-8 sm:py-10 px-5 sm:px-6 lg:px-10 shadow-2xl rounded-2xl sm:rounded-3xl border border-white/20">
          {error && (
            <div className="mb-6 bg-red-50/90 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r backdrop-blur-sm">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-5 sm:space-y-6" onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#8D0000] transition-colors" />
                </div>
                <input
                  {...registerForm.register('name')}
                  type="text"
                  autoComplete="name"
                  className="appearance-none block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D0000]/20 focus:border-[#8D0000] text-sm sm:text-base transition-all bg-white/80 hover:bg-white hover:border-gray-300"
                  placeholder="Enter your full name"
                />
              </div>
              {registerForm.formState.errors.name && (
                <p className="mt-2 text-xs sm:text-sm text-red-600 font-medium">{registerForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#8D0000] transition-colors" />
                </div>
                <input
                  {...registerForm.register('email')}
                  type="email"
                  autoComplete="email"
                  className="appearance-none block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D0000]/20 focus:border-[#8D0000] text-sm sm:text-base transition-all bg-white/80 hover:bg-white hover:border-gray-300"
                  placeholder="Enter your email"
                />
              </div>
              {registerForm.formState.errors.email && (
                <p className="mt-2 text-xs sm:text-sm text-red-600 font-medium">{registerForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-800 mb-2">
                Role
              </label>
              <select
                {...registerForm.register('role')}
                className="block w-full pl-4 pr-10 py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8D0000]/20 focus:border-[#8D0000] transition-all bg-white/80 hover:bg-white hover:border-gray-300 cursor-pointer"
              >
                <option value="TEACHER">Instructor</option>
                <option value="STUDENT">Student</option>
              </select>
              {registerForm.formState.errors.role && (
                <p className="mt-2 text-xs sm:text-sm text-red-600 font-medium">{registerForm.formState.errors.role.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#8D0000] transition-colors" />
                </div>
                <input
                  {...registerForm.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="appearance-none block w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D0000]/20 focus:border-[#8D0000] text-sm sm:text-base transition-all bg-white/80 hover:bg-white hover:border-gray-300"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-[#8D0000] transition-colors p-1 rounded-lg hover:bg-gray-100"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {registerForm.formState.errors.password && (
                <p className="mt-2 text-xs sm:text-sm text-red-600 font-medium">{registerForm.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#8D0000] transition-colors" />
                </div>
                <input
                  {...registerForm.register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="appearance-none block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8D0000]/20 focus:border-[#8D0000] text-sm sm:text-base transition-all bg-white/80 hover:bg-white hover:border-gray-300"
                  placeholder="Confirm your password"
                />
              </div>
              {registerForm.formState.errors.confirmPassword && (
                <p className="mt-2 text-xs sm:text-sm text-red-600 font-medium">{registerForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center bg-gradient-to-r from-[#8D0000] to-[#6B0000] text-white py-3.5 px-6 text-base font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-2 border-[#8D0000]/30 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#6B0000] to-[#8D0000] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">{loading ? 'Creating account...' : 'Create account'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="relative mt-6 sm:mt-8 text-center px-4 z-10">
        <p className="text-sm sm:text-base text-white/90">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/')}
            className="font-bold text-cmu-gold hover:text-cmu-gold-light transition-colors underline-offset-2 hover:underline"
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

