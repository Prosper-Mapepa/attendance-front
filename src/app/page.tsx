'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, LogOut, QrCode, Shield, Clock, BarChart3, Smartphone, CheckCircle, ArrowRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import LoginForm from './components/LoginForm';
import ClassManagement from './components/ClassManagement';
import AttendanceTracker from './components/AttendanceTracker';
import StudentDashboard from './components/StudentDashboard';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Logo size={40} variant="simple" showText={false} className="sm:w-12 sm:h-12" />
              {/* <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">
                  AttendIQ
                </h1>
              </div> */}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/signup"
                className="group relative flex items-center justify-center btn-cmu-primary text-sm sm:text-base px-5 sm:px-6 py-2 sm:py-2.5 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-semibold overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cmu-maroon-dark to-cmu-maroon opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center">
                  Get Started
                  <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white via-gray-50 to-white min-h-screen flex items-center overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-cmu-maroon/5 via-transparent to-cmu-gold/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cmu-maroon/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cmu-gold/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cmu-maroon/3 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 sm:py-16 z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left space-y-6">
              {/* Main Heading with Animation */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight animate-fade-in">
                  Attend<span className="text-cmu-maroon bg-gradient-to-r from-cmu-maroon to-cmu-maroon-dark bg-clip-text text-transparent">IQ</span>
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-cmu-maroon to-cmu-gold rounded-full mx-auto lg:mx-0"></div>
              </div>
              
              {/* Description */}
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Streamline classroom attendance with QR codes, OTP verification, and real-time attendance tracking.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-row justify-between gap-4 pt-2 max-w-xl mx-auto lg:mx-0">
                <Link
                  href="/signup"
                  className="group relative flex items-center justify-center btn-cmu-primary text-base px-8 py-3.5 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex-1 font-semibold overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-cmu-maroon-dark to-cmu-maroon opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <button 
                  onClick={() => setShowLogin(true)} 
                  className="group flex items-center justify-center btn-cmu-secondary text-base px-8 py-3.5 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex-1 font-semibold"
                >
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
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
      <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 via-transparent to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            {/* <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-cmu-gold/20 to-cmu-gold/10 border border-cmu-gold/30 text-cmu-maroon text-sm font-semibold mb-6 shadow-sm">
              <Star className="h-4 w-4 mr-2 fill-cmu-gold text-cmu-maroon" />
              Powerful Features
            </div> */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-6">
              Everything You Need
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Comprehensive tools for efficient classroom attendance management and student engagement
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="group relative bg-white rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-2xl border border-gray-200 hover:border-cmu-maroon/30 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-cmu-maroon/5 via-cmu-maroon/3 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cmu-maroon to-cmu-maroon-dark rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <QrCode className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-cmu-maroon transition-colors text-center">QR Code Scanning</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">
                  Students can quickly mark attendance by scanning QR codes displayed in the classroom with their smartphones.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-2xl border border-gray-200 hover:border-cmu-maroon/30 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-cmu-maroon/5 via-cmu-maroon/3 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cmu-maroon to-cmu-maroon-dark rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-cmu-maroon transition-colors text-center">OTP Verification</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">
                  Secure one-time password verification ensures only authorized students can mark attendance.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-2xl border border-gray-200 hover:border-cmu-maroon/30 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-cmu-maroon/5 via-cmu-maroon/3 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cmu-maroon to-cmu-maroon-dark rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-cmu-maroon transition-colors text-center">Real-time Tracking</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">
                  Monitor attendance in real-time with instant updates and notifications for instructors and administrators.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-2xl border border-gray-200 hover:border-cmu-maroon/30 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-cmu-maroon/5 via-cmu-maroon/3 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cmu-maroon to-cmu-maroon-dark rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <BarChart3 className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-cmu-maroon transition-colors text-center">Analytics & Reports</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">
                  Comprehensive attendance reports and analytics for better insights and decision making.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-2xl border border-gray-200 hover:border-cmu-maroon/30 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-cmu-maroon/5 via-cmu-maroon/3 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cmu-maroon to-cmu-maroon-dark rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Smartphone className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-cmu-maroon transition-colors text-center">Mobile Optimized</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">
                  Fully responsive design works perfectly on all devices and screen sizes for seamless user experience.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-2xl border border-gray-200 hover:border-cmu-maroon/30 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-cmu-maroon/5 via-cmu-maroon/3 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cmu-maroon to-cmu-maroon-dark rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <MapPin className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-cmu-maroon transition-colors text-center">Location Verification</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed text-center">
                  GPS-based location verification ensures students are physically present in class for accurate attendance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cmu-maroon/5 via-transparent to-cmu-gold/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Designed for Success
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Tailored solutions for every role in the educational ecosystem
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 max-w-6xl mx-auto">
            <div className="group flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-white/60 hover:bg-white shadow-md hover:shadow-xl border border-gray-200 hover:border-cmu-gold/30 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cmu-gold to-cmu-gold-dark rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-cmu-maroon" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-cmu-maroon transition-colors">For Instructors</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Streamline attendance taking, reduce administrative burden, and focus more on teaching with automated tracking and comprehensive reporting.
              </p>
            </div>

            <div className="group flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-white/60 hover:bg-white shadow-md hover:shadow-xl border border-gray-200 hover:border-cmu-gold/30 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cmu-gold to-cmu-gold-dark rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-cmu-maroon" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-cmu-maroon transition-colors">For Students</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Quick and easy attendance marking with your smartphone, real-time attendance status, and transparent tracking for better engagement.
              </p>
            </div>

            <div className="group flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-white/60 hover:bg-white shadow-md hover:shadow-xl border border-gray-200 hover:border-cmu-gold/30 transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cmu-gold to-cmu-gold-dark rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-cmu-maroon" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-cmu-maroon transition-colors">For Administration</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
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
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cmu-maroon/10 to-cmu-gold/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <Logo size={40} variant="simple" showText={false} className="sm:w-12 sm:h-12" />
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">AttendIQ</h3>
                </div>
              </div>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 max-w-sm">
                Modern attendance tracking system for efficient classroom management.
              </p>
          
            </div>
            
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 text-cmu-gold">Resources</h4>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-300">
                <li>
                  <a 
                    href="/privacy-policy" 
                    className="hover:text-cmu-gold transition-colors cursor-pointer flex items-center"
                  >
                    <span className="w-1.5 h-1.5 bg-cmu-gold rounded-full mr-2"></span>
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 sm:mt-12 pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 text-center md:text-left">
              <p className="text-xs sm:text-sm text-gray-400">
                &copy; 2025 AttendIQ. All rights reserved.
              </p>
              <div className="flex items-center justify-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-400">
                <span className="hover:text-cmu-gold transition-colors">
                Built by <a href="https://prosper-mapepa-portfolio.netlify.app" target="_blank" rel="noopener noreferrer" className="hover:text-cmu-gold transition-colors font-bold text-white">Prosper Mapepa </a>
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
    <div className="relative w-full max-w-sm lg:max-w-md">
      {/* Slider Container with Reduced Padding */}
      <div className="relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200/50">
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {screenshots.map((screenshot, index) => (
            <div key={index} className="min-w-full flex justify-center items-center p-3 sm:p-4 lg:p-5">
              <div className="relative w-full max-w-[200px] sm:max-w-[240px] lg:max-w-[280px] aspect-[9/19.5] mx-auto">
                {/* Phone Frame with Reduced Padding */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-300 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl p-1.5 sm:p-2 transform hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-black rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden relative ring-1 ring-gray-800/20">
                    <Image
                      src={`/assets/${screenshot}`}
                      alt={`AttendIQ mobile screenshot ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 640px) 200px, (max-width: 1024px) 240px, 280px"
                      quality={90}
                      unoptimized={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots with Reduced Spacing */}
      <div className="flex justify-center items-center gap-1.5 mt-3 sm:mt-4">
        {screenshots.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'w-7 h-1.5 bg-cmu-maroon shadow-sm'
                : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400 hover:w-2'
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Logo size={40} variant="simple" showText={false} className="sm:w-12 sm:h-12" />
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-white">
                    AttendIQ
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-white font-medium">
                  Welcome, {user.name}
                </p>
                <p className="text-xs text-cmu-gold-light">
                  {user.role === 'TEACHER' ? 'Instructor' : 'Student'}
                </p>
              </div>
              <div className="text-right sm:hidden">
                <p className="text-xs text-white font-medium truncate max-w-[100px]">
                  {user.name}
                </p>
                <p className="text-xs text-cmu-gold-light">
                  {user.role === 'TEACHER' ? 'Instructor' : 'Student'}
                </p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 sm:space-x-2 bg-cmu-gold text-cmu-maroon px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium hover:bg-cmu-gold-dark hover:text-white transition-all duration-200 shadow-sm text-sm sm:text-base"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Only for Teachers */}
      {user.role === 'TEACHER' && (
        <nav className="nav-cmu">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {[
                { id: 'classes', label: 'Classes', icon: BookOpen },
                { id: 'attendance', label: 'Attendance', icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`nav-item flex items-center space-x-2 py-4 px-1 border-b-4 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'active border-cmu-maroon rounded'
                        : 'border-transparent hover:border-cmu-maroon'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {user.role === 'TEACHER' ? (
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
