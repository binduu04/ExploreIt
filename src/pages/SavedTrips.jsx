import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Plus, MapPin, Calendar, Trash2, Eye, Heart, 
  User, LogOut, Search, Filter, Grid, List, Globe, Star
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTrip } from '../context/TripContext'

const SavedTrips = () => {
  const navigate = useNavigate()
  const { user, logout, isLoggedIn } = useAuth()
  const { savedTrips, deleteTrip, setCurrentTrip } = useTrip()
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [deleteLoading, setDeleteLoading] = useState(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/')
    }
  }, [isLoggedIn, navigate])

  const handleDeleteTrip = async (tripId) => {
    setDeleteLoading(tripId)
    const success = await deleteTrip(tripId)
    setDeleteLoading(null)
    
    if (!success) {
      alert('Failed to delete trip. Please try again.')
    }
  }

  const handleViewTrip = (trip) => {
    setCurrentTrip(trip)
    navigate('/itinerary')
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const filteredTrips = savedTrips.filter(trip =>
    trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.preferences.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isLoggedIn) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Home
              </button>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <h1 className="text-2xl font-bold text-gray-800">My Trips</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>
                  {user?.isAnonymous ? 'Anonymous User' : (user?.displayName || user?.email || 'User')}
                </span>
              </div>
              
              <button
                onClick={() => navigate('/plan')}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Trip
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search trips by destination or preferences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none bg-white/50 backdrop-blur-sm"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">View:</span>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">{savedTrips.length}</p>
                <p className="text-gray-600">Total Trips</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {savedTrips.reduce((total, trip) => total + trip.duration, 0)}
                </p>
                <p className="text-gray-600">Total Days</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {new Set(savedTrips.map(trip => trip.destination)).size}
                </p>
                <p className="text-gray-600">Destinations</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-pink-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Trips Display */}
        {filteredTrips.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {savedTrips.length === 0 ? 'No saved trips yet' : 'No trips found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {savedTrips.length === 0 
                ? 'Start planning your first adventure!'
                : 'Try adjusting your search terms.'
              }
            </p>
            <button
              onClick={() => navigate('/plan')}
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Plan New Trip
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredTrips.map((trip) => (
              <div 
                key={trip.firestoreId} 
                className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300 ${
                  viewMode === 'list' ? 'flex items-center p-6' : 'flex flex-col'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Grid View */}
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {trip.destination}
                          </h3>
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <Calendar className="w-4 h-4 mr-1" />
                            {trip.duration} {trip.duration === 1 ? 'day' : 'days'}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Heart className="w-4 h-4 mr-1" />
                            {trip.preferences.length > 40 
                              ? `${trip.preferences.substring(0, 40)}...` 
                              : trip.preferences
                            }
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(trip.savedOn)}
                        </div>
                      </div>

                      {trip.budget && (
                        <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium mb-4">
                          {trip.budget.charAt(0).toUpperCase() + trip.budget.slice(1)} Budget
                        </div>
                      )}
                    </div>

                    <div className="p-6 pt-0 flex items-center justify-between">
                      <button
                        onClick={() => handleViewTrip(trip)}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Trip
                      </button>

                      <button
                        onClick={() => handleDeleteTrip(trip.firestoreId)}
                        disabled={deleteLoading === trip.firestoreId}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                        title="Delete trip"
                      >
                        {deleteLoading === trip.firestoreId ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{trip.destination}</h3>
                        <div className="text-sm text-gray-500">{formatDate(trip.savedOn)}</div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {trip.duration} {trip.duration === 1 ? 'day' : 'days'}
                        </div>
                        {trip.budget && (
                          <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            {trip.budget.charAt(0).toUpperCase() + trip.budget.slice(1)}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm">
                        {trip.preferences.length > 80 
                          ? `${trip.preferences.substring(0, 80)}...` 
                          : trip.preferences
                        }
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 ml-6">
                      <button
                        onClick={() => handleViewTrip(trip)}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </button>

                      <button
                        onClick={() => handleDeleteTrip(trip.firestoreId)}
                        disabled={deleteLoading === trip.firestoreId}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                        title="Delete trip"
                      >
                        {deleteLoading === trip.firestoreId ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SavedTrips