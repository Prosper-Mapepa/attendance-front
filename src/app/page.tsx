'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, LogOut, QrCode, Shield, Clock, BarChart3, Smartphone, CheckCircle, ArrowRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import LoginForm from './components/LoginForm';
import ClassManagement from './components/ClassManagement';
import AttendanceTracker from './components/AttendanceTracker';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import Logo from './components/Logo';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return <LoginForm onBack={() => setShowLogin(false)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="header-cmu">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Logo size={40} variant="simple" showText={false} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setShowLogin(true)}
                className="group flex items-center justify-center bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/40 text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-semibold whitespace-nowrap w-[100px] sm:w-[110px]"
              >
                Sign In
              </button>
              <Link
                href="/signup"
                className="group relative flex items-center justify-center btn-cmu-primary text-xs sm:text-sm px-4 sm:px-5 py-1.5 sm:py-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-semibold overflow-hidden whitespace-nowrap w-[100px] sm:w-[110px]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#6B0000] to-[#8D0000] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center justify-center w-full">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                  <ArrowRight className="ml-1 sm:ml-1.5 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Screen Futuristic Design */}
      <section className="relative bg-gradient-to-br from-[#8D0000] via-[#6B0000] via-[#8D0000] to-[#6B0000] flex items-center overflow-hidden min-h-screen">
        {/* Ultra-Smooth Multi-Layer Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8D0000] via-[#6B0000] via-[#6B0000] to-[#6B0000]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8D0000]/8 via-[#6B0000]/6 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#6B0000]/90 via-[#6B0000]/50 via-[#6B0000]/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#6B0000]/15 via-[#6B0000]/20 to-[#6B0000]/40"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-[#8D0000]/30 via-transparent to-transparent"></div>
        
        {/* Ultra-Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='120' height='120' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 120 0 L 0 0 0 120' fill='none' stroke='%23ffffff' stroke-width='0.25'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")` }}></div>
        
        {/* Ultra-Smooth Animated Gradient Orbs */}
        <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-[#8D0000]/15 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-[550px] h-[550px] bg-[#6B0000]/12 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-[700px] h-[700px] bg-cmu-maroon/12 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-[#8D0000]/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-cmu-maroon/10 rounded-full blur-[130px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full pt-4 sm:pt-6 md:pt-8 pb-8 sm:pb-10 md:pb-12 z-10">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left space-y-3 sm:space-y-4">
              {/* Compact Badge */}
              <div className="inline-flex items-center px-5 sm:px-6 py-2 sm:py-2.5 rounded-full  text-sm sm:text-base md:text-lg font-bold mb-2 sm:mb-3 shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
                {/* <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-cmu-gold rounded-full mr-2.5 animate-pulse shadow-md shadow-cmu-gold/50"></div>
                <span className="whitespace-nowrap">Smart Attendance System</span> */}
              </div>
              
              {/* Compact Heading */}
              <div className="space-y-2 sm:space-y-3 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight drop-shadow-2xl">
                  <span className="text-white inline-block animate-slide-in-left" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>Attend</span>
                  <span className="bg-gradient-to-r from-cmu-gold via-cmu-gold to-cmu-gold bg-clip-text text-transparent inline-block animate-slide-in-right ml-2" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>IQ</span>
                </h1>
                <div className="flex items-center gap-2 sm:gap-3 mx-auto lg:mx-0 w-fit opacity-0 animate-fade-in-scale" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                  <div className="h-0.5 w-12 sm:w-16 md:w-24 bg-gradient-to-r from-transparent via-cmu-gold to-cmu-gold"></div>
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-cmu-gold rounded-full shadow-md shadow-cmu-gold/50"></div>
                  <div className="h-0.5 w-12 sm:w-16 md:w-24 bg-gradient-to-l from-transparent via-cmu-gold to-cmu-gold"></div>
                </div>
              </div>
              
              {/* Compact Description */}
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light drop-shadow-md px-2 sm:px-0 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                Streamline classroom attendance with QR codes, OTP verification, and real-time attendance tracking.
              </p>
              
              {/* Download App Buttons */}
              <div className="flex flex-row gap-3 sm:gap-4 pt-3 max-w-lg mx-auto lg:mx-0 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
                <a
                  href="https://apps.apple.com/ca/app/attend-iq/id6756984192"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl border-2 border-white/30 hover:border-white/50 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 font-semibold text-xs sm:text-sm flex-1"
                >
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] opacity-80">Download on the</span>
                    <span className="text-sm sm:text-base font-bold">App Store</span>
                  </div>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.attendiq.app&pcampaignid=web_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl border-2 border-white/30 hover:border-white/50 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 hover:scale-105 transition-all duration-300 font-semibold text-xs sm:text-sm flex-1"
                >
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[10px] opacity-80">GET IT ON</span>
                    <span className="text-sm sm:text-base font-bold">Google Play</span>
                  </div>
                </a>
              </div>
              
              {/* Compact Trust Indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-5 pt-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-2 text-sm sm:text-base md:text-lg text-white/90">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-cmu-gold" />
                  <span className="font-medium">99.9% Accuracy</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base md:text-lg text-white/90">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-cmu-gold" />
                  <span className="font-medium">Real-time Updates</span>
                </div>
              </div>

              {/* Trust Badges */}
              {/* <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Secure & Reliable</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Real-time Updates</span>
                </div>
              </div> */}
            </div>
            
            {/* Right Column - Mobile Screenshot Slider */}
            <div className="flex justify-center lg:justify-end">
              <MobileScreenshotSlider />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/40 via-transparent to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-5 md:mb-6 leading-tight">
              Everything You Need
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive tools for efficient classroom attendance management and student engagement
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
            <div className="group relative bg-white rounded-3xl p-6 sm:p-7 md:p-8 shadow-lg hover:shadow-2xl border-2 border-gray-100 hover:border-cmu-maroon/40 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8D0000]/8 via-[#8D0000]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#8D0000]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-[#8D0000] via-[#6B0000] to-[#8D0000] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <QrCode className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-white mx-auto" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-cmu-maroon transition-colors text-center">QR Code Scanning</h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed text-center">
                  Students can quickly mark attendance by scanning QR codes displayed in the classroom with their smartphones.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-6 sm:p-7 md:p-8 shadow-lg hover:shadow-2xl border-2 border-gray-100 hover:border-cmu-maroon/40 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8D0000]/8 via-[#8D0000]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#8D0000]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-[#8D0000] via-[#6B0000] to-[#8D0000] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Shield className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-white mx-auto" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-cmu-maroon transition-colors text-center">OTP Verification</h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed text-center">
                  Secure one-time password verification ensures only authorized students can mark attendance.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-6 sm:p-7 md:p-8 shadow-lg hover:shadow-2xl border-2 border-gray-100 hover:border-cmu-maroon/40 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8D0000]/8 via-[#8D0000]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#8D0000]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-[#8D0000] via-[#6B0000] to-[#8D0000] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Clock className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-white mx-auto" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-cmu-maroon transition-colors text-center">Real-time Tracking</h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed text-center">
                  Monitor attendance in real-time with instant updates and notifications for instructors and administrators.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-6 sm:p-7 md:p-8 shadow-lg hover:shadow-2xl border-2 border-gray-100 hover:border-cmu-maroon/40 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8D0000]/8 via-[#8D0000]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#8D0000]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-[#8D0000] via-[#6B0000] to-[#8D0000] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <BarChart3 className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-white mx-auto" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-cmu-maroon transition-colors text-center">Analytics & Reports</h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed text-center">
                  Comprehensive attendance reports and analytics for better insights and decision making.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-6 sm:p-7 md:p-8 shadow-lg hover:shadow-2xl border-2 border-gray-100 hover:border-cmu-maroon/40 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8D0000]/8 via-[#8D0000]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#8D0000]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-[#8D0000] via-[#6B0000] to-[#8D0000] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Smartphone className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-white mx-auto" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-cmu-maroon transition-colors text-center">Mobile Optimized</h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed text-center">
                  Fully responsive design works perfectly on all devices and screen sizes for seamless user experience.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-6 sm:p-7 md:p-8 shadow-lg hover:shadow-2xl border-2 border-gray-100 hover:border-cmu-maroon/40 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8D0000]/8 via-[#8D0000]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#8D0000]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-[#8D0000] via-[#6B0000] to-[#8D0000] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <MapPin className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-white mx-auto" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-cmu-maroon transition-colors text-center">Location Verification</h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed text-center">
                  GPS-based location verification ensures students are physically present in class for accurate attendance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 sm:mb-5 md:mb-6 leading-tight">
              Designed for Success
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Tailored solutions for every role in the educational ecosystem
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 max-w-6xl mx-auto">
            <div className="group flex flex-col text-left p-6 sm:p-8 md:p-10 rounded-2xl bg-white border border-gray-200 hover:border-cmu-maroon/30 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-cmu-maroon transition-colors">For Instructors</h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Streamline attendance taking, reduce administrative burden, and focus more on teaching with automated tracking and comprehensive reporting.
              </p>
            </div>

            <div className="group flex flex-col text-left p-6 sm:p-8 md:p-10 rounded-2xl bg-white border border-gray-200 hover:border-cmu-maroon/30 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-cmu-maroon transition-colors">For Students</h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Quick and easy attendance marking with your smartphone, real-time attendance status, and transparent tracking for better engagement.
              </p>
            </div>

            <div className="group flex flex-col text-left p-6 sm:p-8 md:p-10 rounded-2xl bg-white border border-gray-200 hover:border-cmu-maroon/30 hover:shadow-lg transition-all duration-300 sm:col-span-2 md:col-span-1">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-cmu-maroon transition-colors">For Administration</h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Comprehensive reporting, compliance tracking, and data-driven insights for better academic management and decision making.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section
      <section className="py-24 bg-gradient-to-br from-cmu-maroon via-cmu-maroon-dark to-cmu-maroon text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cmu-gold/10 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-cmu-gold/20 text-cmu-gold text-sm font-medium mb-6">
              <Users2 className="h-4 w-4 mr-2" />
              Trusted by CMU Community
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Join Thousands of Users
            </h2>
            <p className="text-xl text-cmu-gold-light max-w-3xl mx-auto leading-relaxed">
              Experience the power of modern attendance tracking with our growing community
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-5xl md:text-6xl font-bold text-cmu-gold mb-4 group-hover:scale-110 transition-transform duration-300">500+</div>
              <div className="text-cmu-gold-light text-lg font-medium">Active Classes</div>
              <div className="text-sm text-white/70 mt-2">Growing daily</div>
            </div>
            <div className="group text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-5xl md:text-6xl font-bold text-cmu-gold mb-4 group-hover:scale-110 transition-transform duration-300">2,500+</div>
              <div className="text-cmu-gold-light text-lg font-medium">Students</div>
              <div className="text-sm text-white/70 mt-2">Engaged learners</div>
            </div>
            <div className="group text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-5xl md:text-6xl font-bold text-cmu-gold mb-4 group-hover:scale-110 transition-transform duration-300">150+</div>
              <div className="text-cmu-gold-light text-lg font-medium">Faculty Members</div>
              <div className="text-sm text-white/70 mt-2">Trusted educators</div>
            </div>
            <div className="group text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-5xl md:text-6xl font-bold text-cmu-gold mb-4 group-hover:scale-110 transition-transform duration-300">99.9%</div>
              <div className="text-cmu-gold-light text-lg font-medium">Uptime</div>
              <div className="text-sm text-white/70 mt-2">Reliable service</div>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      {/* <section className="py-24 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cmu-maroon/5 via-transparent to-cmu-gold/5"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-cmu-gold/20 text-cmu-maroon text-sm font-medium mb-8">
            <Calendar className="h-4 w-4 mr-2" />
            Ready to Get Started?
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
            Start Your Journey Today
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join the CMU community and experience modern attendance tracking that transforms how you manage your classes.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => setShowLogin(true)}
              className="flex group btn-cmu-primary text-xl px-12 py-6 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300"
            >
              Sign In Now
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform mt-1" />
            </button>
            <div className="flex items-center space-x-4 text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Free to use</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">No setup required</span>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#6B0000] via-[#6B0000] via-gray-900 to-gray-900 text-white py-10 sm:py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#6B0000]/8 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-[#6B0000]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#6B0000]/60 to-gray-900"></div>
        <div className="absolute inset-0 opacity-8" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='%23ffffff' stroke-width='0.2'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")` }}></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-cmu-maroon/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-900/30 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-10 md:mb-12">
            <div>
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-5">
                <Logo size={40} variant="simple" showText={false} className="sm:w-12 sm:h-12 md:w-14 md:h-14" />
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white">AttendIQ</h3>
                </div>
              </div>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-5 max-w-md">
                Modern attendance tracking system for efficient classroom management.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-base sm:text-lg md:text-xl mb-4 sm:mb-5 text-cmu-gold">Resources</h4>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base md:text-lg text-gray-300">
                <li>
                  <a 
                    href="/privacy-policy" 
                    className="hover:text-cmu-gold transition-colors cursor-pointer flex items-center group"
                  >
                    <span className="w-2 h-2 bg-cmu-gold rounded-full mr-3 group-hover:scale-125 transition-transform"></span>
                    <span className="group-hover:translate-x-1 transition-transform">Privacy Policy</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700/50 mt-6 sm:mt-8 md:mt-10 pt-6 sm:pt-8 md:pt-10">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 text-center md:text-left">
              <p className="text-sm sm:text-base text-gray-400">
                &copy; 2025 AttendIQ. All rights reserved.
              </p>
              <div className="flex items-center justify-center space-x-4 sm:space-x-5 md:space-x-6 text-sm sm:text-base text-gray-400">
                <span className="hover:text-cmu-gold transition-colors">
                Built by <a href="https://prosper-mapepa-portfolio.netlify.app" target="_blank" rel="noopener noreferrer" className="hover:text-cmu-gold transition-colors font-bold text-white hover:underline">Prosper Mapepa</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileScreenshotSlider() {
  const screenshots = ['a.png', 'b.png', 'c.png', 'd.png', 'e.png', 'f.png'];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % screenshots.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [screenshots.length]);

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md">
      {/* Enhanced Maroon Glow Effect */}
      <div className="absolute -inset-6 bg-gradient-to-br from-[#8D0000]/25 via-[#6B0000]/20 to-[#8D0000]/25 rounded-2xl blur-3xl opacity-80"></div>
      <div className="absolute -inset-4 bg-gradient-to-br from-[#8D0000]/20 via-[#6B0000]/15 to-[#8D0000]/20 rounded-2xl blur-2xl"></div>
      
      {/* Floating Slider Container - Transparent, No Border */}
      <div className="relative overflow-hidden opacity-0 animate-fade-in-scale" style={{ animationDelay: '0.9s', animationFillMode: 'forwards' }}>
        <div 
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {screenshots.map((screenshot, index) => (
            <div key={index} className="min-w-full flex justify-center items-center p-3 sm:p-4 md:p-5">
              <div className="relative w-full max-w-[180px] sm:max-w-[220px] md:max-w-[260px] lg:max-w-[300px] aspect-[9/19.5] mx-auto">
                {/* Floating Phone Frame */}
                <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] shadow-2xl transform hover:scale-105 transition-transform duration-500">
                  {/* Enhanced Maroon Glow Effect */}
                  <div className="absolute -inset-2 bg-gradient-to-br from-[#8D0000]/50 via-[#6B0000]/40 to-[#8D0000]/50 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] blur-lg"></div>
                  
                  {/* Enhanced Gradient Border Frame */}
                  <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-br from-[#8D0000] via-[#6B0000] via-[#8D0000] to-[#6B0000] p-[3px]">
                    {/* Screen Container */}
                    <div className="w-full h-full bg-black rounded-[1.75rem] sm:rounded-[2.25rem] md:rounded-[2.75rem] overflow-hidden relative">
                    <Image
                      src={`/assets/${screenshot}`}
                      alt={`AttendIQ mobile screenshot ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                        sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, (max-width: 1024px) 260px, 300px"
                      quality={90}
                      unoptimized={true}
                    />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compact Navigation Dots */}
      <div className="flex justify-center items-center gap-2 mt-3 sm:mt-4">
        {screenshots.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'w-8 h-2 bg-cmu-gold shadow-md shadow-cmu-gold/50'
                : 'w-2 h-2 bg-white/40 hover:bg-white/60 hover:w-2.5'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function MainContent() {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('classes');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center py-12 sm:px-6 lg:px-8">
        <div className="text-center max-w-md w-full px-4">
          {/* <div className="flex justify-center mb-6">
            <Logo size={80} variant="simple" showText={false} className="sm:w-24 sm:h-24 md:ml-8" />
          </div> */}
          {/* <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            Attend<span className="text-cmu-maroon">IQ</span>
          </h2> */}
          {/* <p className="text-base sm:text-lg text-gray-600 mb-8">
            Please wait while we load your account...
          </p> */}
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-cmu-maroon"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="header-cmu">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
            <div className="flex items-center min-w-0 flex-1">
              <Logo size={50} variant="simple" showText={false} className="ml-1 sm:w-10 sm:h-10 md:w-12 md:h-12 flex-shrink-0" />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-xs sm:text-sm text-white font-medium truncate max-w-[120px] sm:max-w-none">
                  Welcome, {user.name}
                </p>
                <p className="text-xs text-cmu-gold-light">
                  {user.role === 'ADMIN' ? 'Admin' : user.role === 'TEACHER' ? 'Instructor' : 'Student'}
                </p>
              </div>
              <div className="text-right sm:hidden">
                <p className="text-xs text-white font-medium truncate max-w-[80px]">
                  {user.name}
                </p>
                <p className="text-xs text-cmu-gold-light">
                  {user.role === 'ADMIN' ? 'Admin' : user.role === 'TEACHER' ? 'Instructor' : 'Student'}
                </p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 sm:space-x-2 bg-cmu-gold text-cmu-maroon px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg font-medium hover:bg-cmu-gold-dark hover:text-white transition-all duration-200 shadow-sm text-xs sm:text-sm md:text-base"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Only for Teachers */}
      {user.role === 'TEACHER' && (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto">
              {[
                { id: 'classes', label: 'Classes', icon: BookOpen },
                { id: 'attendance', label: 'Attendance', icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-200 relative ${
                      activeTab === tab.id
                        ? 'text-cmu-maroon'
                        : 'text-gray-600 hover:text-cmu-maroon'
                    }`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cmu-maroon rounded-t-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-6 lg:px-8">
        {user.role === 'ADMIN' ? (
          <AdminDashboard />
        ) : user.role === 'TEACHER' ? (
          <>
            {activeTab === 'classes' && <ClassManagement />}
            {activeTab === 'attendance' && <AttendanceTracker />}
          </>
        ) : (
          <StudentDashboard />
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
