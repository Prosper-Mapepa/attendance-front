'use client';

import { useState } from 'react';
import { BookOpen, Users, LogOut, QrCode, Shield, Clock, BarChart3, Smartphone, CheckCircle, ArrowRight, Star, Users2, Calendar, MapPin } from 'lucide-react';
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
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <Logo size={48} variant="light" showText={false} />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  AttendIQ
                </h1>
                <p className="text-sm text-cmu-gold-light">
                  Central Michigan University
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/business-model"
                className="text-white hover:text-cmu-gold transition-colors duration-200 font-medium"
              >
                Business Model
              </a>
              <button
                onClick={() => setShowLogin(true)}
                className="btn-cmu-secondary"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-cmu-maroon/5 to-cmu-gold/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-cmu-maroon/10 text-cmu-maroon text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-cmu-maroon rounded-full mr-2"></span>
              Central Michigan University
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              AttendIQ
              <span className="block text-cmu-maroon bg-gradient-to-r from-cmu-maroon to-cmu-maroon-dark bg-clip-text text-transparent">
                Smart Attendance
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Streamline classroom management with Session Manager, QR codes, OTP verification, and real-time attendance tracking for Central Michigan University.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={() => setShowLogin(true)}
                className="flex group btn-cmu-primary text-lg px-10 py-5 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform mt-1" />
              </button>
              <button className="flex group btn-cmu-secondary text-lg px-10 py-5 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                Sign In
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform mt-1" />
              </button>
            </div>
            <div className="mt-16 flex justify-center items-center space-x-8 text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Secure & Reliable</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Mobile Optimized</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Real-time Updates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-cmu-gold/20 text-cmu-maroon text-sm font-medium mb-6">
              <Star className="h-4 w-4 mr-2" />
              Powerful Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive tools for efficient classroom attendance management and student engagement
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 hover:border-cmu-maroon/20 transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-cmu-maroon/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cmu-maroon to-cmu-maroon-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <QrCode className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-cmu-maroon transition-colors">QR Code Scanning</h3>
                <p className="text-gray-600 leading-relaxed">
                  Students can quickly mark attendance by scanning QR codes displayed in the classroom with their smartphones.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 hover:border-cmu-maroon/20 transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-cmu-maroon/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cmu-maroon to-cmu-maroon-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-cmu-maroon transition-colors">OTP Verification</h3>
                <p className="text-gray-600 leading-relaxed">
                  Secure one-time password verification ensures only authorized students can mark attendance.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 hover:border-cmu-maroon/20 transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-cmu-maroon/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cmu-maroon to-cmu-maroon-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-cmu-maroon transition-colors">Real-time Tracking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Monitor attendance in real-time with instant updates and notifications for teachers and administrators.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 hover:border-cmu-maroon/20 transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-cmu-maroon/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cmu-maroon to-cmu-maroon-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-cmu-maroon transition-colors">Analytics & Reports</h3>
                <p className="text-gray-600 leading-relaxed">
                  Comprehensive attendance reports and analytics for better insights and decision making.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 hover:border-cmu-maroon/20 transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-cmu-maroon/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cmu-maroon to-cmu-maroon-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-cmu-maroon transition-colors">Mobile Optimized</h3>
                <p className="text-gray-600 leading-relaxed">
                  Fully responsive design works perfectly on all devices and screen sizes for seamless user experience.
                </p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 hover:border-cmu-maroon/20 transition-all duration-300 transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-cmu-maroon/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cmu-maroon to-cmu-maroon-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-cmu-maroon transition-colors">Location Verification</h3>
                <p className="text-gray-600 leading-relaxed">
                  GPS-based location verification ensures students are physically present in class for accurate attendance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cmu-maroon/5 via-transparent to-cmu-gold/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-cmu-gold/20 text-cmu-maroon text-sm font-medium mb-6">
                <Users2 className="h-4 w-4 mr-2" />
                Benefits for Everyone
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Designed for Success
              </h2>
              <div className="space-y-10">
                <div className="group flex items-start space-x-6 p-6 rounded-2xl hover:bg-white/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-cmu-gold to-cmu-gold-dark rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <CheckCircle className="h-6 w-6 text-cmu-maroon" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-cmu-maroon transition-colors">For Teachers</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Streamline attendance taking, reduce administrative burden, and focus more on teaching with automated tracking and comprehensive reporting.
                    </p>
                  </div>
                </div>

                <div className="group flex items-start space-x-6 p-6 rounded-2xl hover:bg-white/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-cmu-gold to-cmu-gold-dark rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <CheckCircle className="h-6 w-6 text-cmu-maroon" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-cmu-maroon transition-colors">For Students</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Quick and easy attendance marking with your smartphone, real-time attendance status, and transparent tracking for better engagement.
                    </p>
                  </div>
                </div>

                <div className="group flex items-start space-x-6 p-6 rounded-2xl hover:bg-white/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-cmu-gold to-cmu-gold-dark rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <CheckCircle className="h-6 w-6 text-cmu-maroon" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-cmu-maroon transition-colors">For Administration</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Comprehensive reporting, compliance tracking, and data-driven insights for better academic management and decision making.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-br from-cmu-maroon/5 to-cmu-gold/5 rounded-3xl"></div>
                <div className="relative">
                  <div className="text-center mb-10">
                    <div className="flex items-center justify-center mx-auto mb-6">
                      <Logo size={96} variant="color" showText={false} />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-3">AttendIQ</h3>
                    <p className="text-gray-600 text-lg">Trusted by Central Michigan University</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors duration-300">
                      <div className="w-10 h-10 bg-cmu-gold rounded-xl flex items-center justify-center">
                        <Star className="h-5 w-5 text-cmu-maroon" />
                      </div>
                      <span className="text-gray-700 font-medium text-lg">Secure & Reliable</span>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors duration-300">
                      <div className="w-10 h-10 bg-cmu-gold rounded-xl flex items-center justify-center">
                        <Star className="h-5 w-5 text-cmu-maroon" />
                      </div>
                      <span className="text-gray-700 font-medium text-lg">Easy to Use</span>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors duration-300">
                      <div className="w-10 h-10 bg-cmu-gold rounded-xl flex items-center justify-center">
                        <Star className="h-5 w-5 text-cmu-maroon" />
                      </div>
                      <span className="text-gray-700 font-medium text-lg">Real-time Updates</span>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors duration-300">
                      <div className="w-10 h-10 bg-cmu-gold rounded-xl flex items-center justify-center">
                        <Star className="h-5 w-5 text-cmu-maroon" />
                      </div>
                      <span className="text-gray-700 font-medium text-lg">Mobile Optimized</span>
                    </div>
                  </div>
                </div>
              </div>
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
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cmu-maroon/10 to-cmu-gold/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <Logo size={48} variant="color" showText={false} />
                <div>
                  <h3 className="text-xl font-bold">AttendIQ</h3>
                  {/* <p className="text-sm text-gray-400">System</p> */}
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Modern attendance tracking system designed specifically for Central Michigan University's academic community.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-cmu-maroon rounded-lg flex items-center justify-center hover:bg-cmu-maroon-dark transition-colors cursor-pointer">
                  <span className="text-xs font-bold">CMU</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6 text-cmu-gold">Features</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="hover:text-cmu-gold transition-colors cursor-pointer">QR Code Scanning</li>
                <li className="hover:text-cmu-gold transition-colors cursor-pointer">OTP Verification</li>
                <li className="hover:text-cmu-gold transition-colors cursor-pointer">Real-time Tracking</li>
                <li className="hover:text-cmu-gold transition-colors cursor-pointer">Analytics & Reports</li>
                <li className="hover:text-cmu-gold transition-colors cursor-pointer">Location Verification</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6 text-cmu-gold">Support</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="hover:text-cmu-gold transition-colors cursor-pointer">Help Center</li>
                <li className="hover:text-cmu-gold transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-cmu-gold transition-colors cursor-pointer">Contact Support</li>
                <li className="hover:text-cmu-gold transition-colors cursor-pointer">System Status</li>
                <li className="hover:text-cmu-gold transition-colors cursor-pointer">Training Resources</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6 text-cmu-gold">Central Michigan University</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="hover:text-cmu-gold transition-colors cursor-pointer">Mount Pleasant, MI</li>
                {/* <li className="hover:text-cmu-gold transition-colors cursor-pointer">Est. 1892</li> */}
                <li className="hover:text-cmu-gold transition-colors cursor-pointer">Go Chippewas!</li>
                <li className="hover:text-cmu-gold transition-colors cursor-pointer">Academic Excellence</li>
                <li>
                  <a 
                    href="/business-model" 
                    className="hover:text-cmu-gold transition-colors cursor-pointer"
                  >
                    Business Model
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray-400">
                &copy; 2025 Central Michigan University. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                {/* <span className="hover:text-cmu-gold transition-colors cursor-pointer">Privacy Policy</span>
                <span className="hover:text-cmu-gold transition-colors cursor-pointer">Terms of Service</span> */}
                <span className="hover:text-cmu-gold transition-colors cursor-pointer">Made by <a href="https://prosper-mapepa-portfolio.netlify.app" target="_blank" rel="noopener noreferrer" className="hover:text-cmu-gold transition-colors cursor-pointer font-bold text-white">Prosper Mapepa 😃</a></span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MainContent() {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('classes');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Logo size={80} variant="color" showText={false} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-cmu-maroon">
            AttendIQ
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we load your account...
          </p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cmu-maroon"></div>
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
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <Logo size={48} variant="light" showText={false} />
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    AttendIQ
                  </h1>
                  <p className="text-sm text-cmu-gold-light">
                    Central Michigan University
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-white font-medium">
                  Welcome, {user.name}
                </p>
                <p className="text-xs text-cmu-gold-light">
                  {user.role === 'TEACHER' ? 'Faculty' : 'Student'}
                </p>
              </div>
              <div className="text-right sm:hidden">
                <p className="text-xs text-white font-medium">
                  {user.name}
                </p>
                <p className="text-xs text-cmu-gold-light">
                  {user.role === 'TEACHER' ? 'Faculty' : 'Student'}
                </p>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 sm:space-x-2 bg-cmu-gold text-cmu-maroon px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-cmu-gold-dark hover:text-white transition-all duration-200 shadow-sm"
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
