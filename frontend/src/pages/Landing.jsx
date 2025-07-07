import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Sparkles, Globe, Compass, Camera, Star, ArrowRight, Play, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LoginModal from '../components/LoginModal'

const Landing = () => {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout, loading } = useAuth()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSignInClick = () => {
    if (isLoggedIn) {
      // If user is logged in, show dropdown menu or navigate to dashboard
      navigate('/my-trips')
    } else {
      // Show login modal
      setShowLoginModal(true)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    // Optional: Navigate to saved trips after login
    navigate('/my-trips')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading ExploreIt...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-teal-900/20"></div>
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-3xl font-bold">ExploreIt</span>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4" />
                  <span>
                    {user?.isAnonymous ? 'Anonymous User' : (user?.displayName || user?.email || 'User')}
                  </span>
                </div>
                
                <button
                  onClick={() => navigate('/my-trips')}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full hover:bg-blue-500/30 transition-all duration-300 text-sm"
                >
                  My Trips
                </button>
                
                <button
                  onClick={handleLogout}
                  className="p-2 border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleSignInClick}
                className="px-6 py-2 border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-14">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            
            {/* Left Side - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2 rounded-full border border-blue-500/30">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300">AI-Powered Trip Planning</span>
                </div>
                
                <h1 className="text-6xl lg:text-8xl font-bold leading-none">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    Plan Epic
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                    Adventures
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 max-w-xl leading-relaxed">
                  Get personalized day-by-day itineraries with real places, live weather, and AI recommendations that locals would give you.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/plan')}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-blue-500/25 flex items-center justify-center"
                >
                  Start Planning
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="group px-8 py-4 border border-white/20 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center">
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="flex space-x-8 pt-8">
                <div>
                  <div className="text-3xl font-bold text-blue-400">50K+</div>
                  <div className="text-sm text-gray-400">Trips Planned</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400">4.9</div>
                  <div className="text-sm text-gray-400">User Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-teal-400">200+</div>
                  <div className="text-sm text-gray-400">Destinations</div>
                </div>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="relative">
              <div className="relative z-10 space-y-4">
                {/* Floating Cards */}
                <div className="transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <MapPin className="w-6 h-6 text-white" />
                      <span className="font-semibold">Udupi, Karnataka</span>
                    </div>
                    <p className="text-sm text-blue-100">5 days • Beach & Culture</p>
                    <div className="flex items-center mt-3">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-blue-400"></div>
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
                      </div>
                      <span className="ml-3 text-sm text-blue-100">+12 others saved</span>
                    </div>
                  </div>
                </div>

                <div className="transform -rotate-2 hover:rotate-0 transition-transform duration-500 ml-8">
                  <div className="bg-gradient-to-r from-teal-500/90 to-blue-500/90 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <Camera className="w-6 h-6 text-white" />
                      <span className="font-semibold">Tokyo Adventure</span>
                    </div>
                    <p className="text-sm text-teal-100">7 days • Food & Temples</p>
                    <div className="flex items-center mt-3">
                      <Star className="w-4 h-4 text-yellow-300 fill-current" />
                      <span className="ml-1 text-sm text-teal-100">Perfect itinerary!</span>
                    </div>
                  </div>
                </div>

                <div className="transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <Globe className="w-6 h-6 text-white" />
                      <span className="font-semibold">Europe Backpack</span>
                    </div>
                    <p className="text-sm text-purple-100">8 days • 8 iconic places</p>
                    <div className="mt-3 text-sm text-purple-100">
                      Generated in 30 seconds ⚡
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-xl opacity-60 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full blur-2xl opacity-40 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Why Choose ExploreIt?
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Everything you need for the perfect trip, powered by AI</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 bg-gradient-to-b from-white/5 to-transparent rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Smart Destinations</h3>
              <p className="text-gray-400 leading-relaxed">AI analyzes millions of reviews and local insights to recommend hidden gems and must-visit spots tailored to your style.</p>
            </div>

            <div className="group p-8 bg-gradient-to-b from-white/5 to-transparent rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Perfect Timing</h3>
              <p className="text-gray-400 leading-relaxed">Day-by-day schedules optimized for crowds, weather, and opening hours. Never miss out on experiences again.</p>
            </div>

            <div className="group p-8 bg-gradient-to-b from-white/5 to-transparent rounded-3xl border border-white/10 hover:border-teal-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Local Secrets</h3>
              <p className="text-gray-400 leading-relaxed">Get insider tips and local recommendations that you won't find in guidebooks. Experience destinations like a local.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Main Footer Content */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            {/* Brand */}
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold">ExploreIt</span>
              </div>
              <p className="text-gray-400 text-sm text-center md:text-left">
                AI-powered travel planning for unforgettable adventures
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
             <a href="mailto:exploreit1216@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Email</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 ExploreIt. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <span className="text-gray-600">•</span>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <span className="text-gray-600">•</span>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        message="Welcome to ExploreIt!"
      />
    </div>
  )
}

export default Landing