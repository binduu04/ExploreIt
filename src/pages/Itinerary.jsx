import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, MapPin, Calendar, Clock, Star, Save, RefreshCw, 
  Download, Sun, Cloud, Droplets, Thermometer, Lightbulb,
  Coffee, Camera, Utensils, CheckCircle, Heart
} from 'lucide-react'
import { useTrip } from '../context/TripContext'
import { useAuth } from '../context/AuthContext'
import LoginModal from '../components/LoginModal'

const Itinerary = () => {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const { currentTrip, tripForm, generateItinerary, saveTrip, loading } = useTrip()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  // Generate trip on component mount if no current trip
  useEffect(() => {
    if (!currentTrip && tripForm.destination) {
      generateItinerary(tripForm)
    } else if (!tripForm.destination) {
      // Redirect to planner if no form data
      navigate('/plan')
    }
  }, [])

  const handleSaveTrip = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }

    setSaveLoading(true)
    const success = await saveTrip(currentTrip)
    setSaveLoading(false)

    if (success) {
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    }
  }

  const handleRegenerate = async () => {
    await generateItinerary(tripForm)
  }

  const getActivityIcon = (activity) => {
    const activityLower = activity.toLowerCase()
    if (activityLower.includes('food') || activityLower.includes('restaurant')) return Utensils
    if (activityLower.includes('coffee')) return Coffee
    if (activityLower.includes('photo') || activityLower.includes('view')) return Camera
    return Star
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Creating Your Perfect Trip</h2>
          <p className="text-gray-600">Analyzing destinations, weather, and local insights...</p>
        </div>
      </div>
    )
  }

  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Trip Found</h2>
          <button
            onClick={() => navigate('/plan')}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Plan a New Trip
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/plan')}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Planning
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRegenerate}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </button>

              <button
                onClick={handleSaveTrip}
                disabled={saveLoading || savedSuccess}
                className={`flex items-center px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                  savedSuccess 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } disabled:opacity-50`}
              >
                {saveLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : savedSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Trip
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Trip Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {currentTrip.duration} Days in {currentTrip.destination}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                  {currentTrip.duration} {currentTrip.duration === 1 ? 'Day' : 'Days'}
                </div>
                <div className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-purple-500" />
                  {currentTrip.preferences}
                </div>
                {currentTrip.budget && (
                  <div className="flex items-center">
                    <span className="text-green-500 mr-2">💰</span>
                    {currentTrip.budget.charAt(0).toUpperCase() + currentTrip.budget.slice(1)} Budget
                  </div>
                )}
              </div>
            </div>

            {/* Weather Card */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-2xl min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Cloud className="w-6 h-6 mr-2" />
                  <span className="font-medium">Weather</span>
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{currentTrip.weather.temperature}</div>
              <div className="text-sm opacity-90 mb-2">{currentTrip.weather.condition}</div>
              <div className="text-xs opacity-75">Humidity: {currentTrip.weather.humidity}</div>
            </div>
          </div>
        </div>

        {/* Daily Itinerary */}
        <div className="space-y-6">
          {currentTrip.itinerary.map((day, dayIndex) => (
            <div key={day.day} className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
              {/* Day Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Calendar className="w-6 h-6 mr-3" />
                  Day {day.day}
                </h2>
              </div>

              {/* Day Activities */}
              <div className="p-6">
                <div className="grid gap-6">
                  {/* Morning */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <Sun className="w-5 h-5 mr-2 text-yellow-500" />
                      Morning
                    </h3>
                    {day.morning.map((activity, index) => {
                      const ActivityIcon = getActivityIcon(activity.activity)
                      return (
                        <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <ActivityIcon className="w-5 h-5 mr-3 text-yellow-600" />
                              <div>
                                <h4 className="font-semibold text-gray-800">{activity.activity}</h4>
                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {activity.location}
                                </p>
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-600">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {activity.time}
                              </div>
                              <div className="mt-1">{activity.duration}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-yellow-700 bg-yellow-100 rounded-lg p-2">
                            <Lightbulb className="w-4 h-4 mr-2" />
                            {activity.tip}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Afternoon */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <Sun className="w-5 h-5 mr-2 text-orange-500" />
                      Afternoon
                    </h3>
                    {day.afternoon.map((activity, index) => {
                      const ActivityIcon = getActivityIcon(activity.activity)
                      return (
                        <div key={index} className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <ActivityIcon className="w-5 h-5 mr-3 text-orange-600" />
                              <div>
                                <h4 className="font-semibold text-gray-800">{activity.activity}</h4>
                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {activity.location}
                                </p>
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-600">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {activity.time}
                              </div>
                              <div className="mt-1">{activity.duration}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-orange-700 bg-orange-100 rounded-lg p-2">
                            <Lightbulb className="w-4 h-4 mr-2" />
                            {activity.tip}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Evening */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <Star className="w-5 h-5 mr-2 text-purple-500" />
                      Evening
                    </h3>
                    {day.evening.map((activity, index) => {
                      const ActivityIcon = getActivityIcon(activity.activity)
                      return (
                        <div key={index} className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <ActivityIcon className="w-5 h-5 mr-3 text-purple-600" />
                              <div>
                                <h4 className="font-semibold text-gray-800">{activity.activity}</h4>
                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {activity.location}
                                </p>
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-600">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {activity.time}
                              </div>
                              <div className="mt-1">{activity.duration}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-purple-700 bg-purple-100 rounded-lg p-2">
                            <Lightbulb className="w-4 h-4 mr-2" />
                            {activity.tip}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/plan')}
            className="px-8 py-4 border border-gray-300 bg-white text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Plan Another Trip
          </button>
          
          {isLoggedIn && (
            <button
              onClick={() => navigate('/my-trips')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
            >
              View My Trips
            </button>
          )}
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false)
          handleSaveTrip()
        }}
        message="Save this trip?"
      />
    </div>
  )
}

export default Itinerary