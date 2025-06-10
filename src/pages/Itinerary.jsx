import React from 'react'
import { useTrip } from '../context/TripContext'
import { useAuth } from '../context/AuthContext'

const Itinerary = () => {
  const { currentTrip, loading, error, saveTrip, clearError } = useTrip()
  const { user } = useAuth()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Generating Your Perfect Itinerary...</h2>
          <p className="text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error generating itinerary</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentTrip) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No itinerary generated yet</h2>
          <p className="text-gray-500">Create a trip to see your personalized itinerary here</p>
        </div>
      </div>
    )
  }

  const handleSaveTrip = async () => {
    const success = await saveTrip(currentTrip)
    if (success) {
      alert('Trip saved successfully!')
    } else {
      alert('Failed to save trip. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  const getWeatherIcon = (condition) => {
    const icons = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Snow': '❄️',
      'Thunderstorm': '⛈️',
      'Drizzle': '🌦️',
      'Mist': '🌫️',
      'Fog': '🌫️'
    }
    return icons[condition] || '🌤️'
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{currentTrip.summary?.title || `Trip to ${currentTrip.destination}`}</h1>
            <p className="text-blue-100 mb-4">
              {currentTrip.summary?.description || `${currentTrip.duration} days in ${currentTrip.destination}`}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">📅 {formatDate(currentTrip.startDate)}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">⏱️ {currentTrip.duration} days</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">💰 {currentTrip.budget}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">👥 {currentTrip.groupType}</span>
            </div>
          </div>
          {user && (
            <button
              onClick={handleSaveTrip}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Save Trip
            </button>
          )}
        </div>
      </div>

      {/* Weather Overview */}
      {currentTrip.weather && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            🌤️ Weather in {currentTrip.weather.location}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {currentTrip.weather.forecast?.slice(0, 5).map((day, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-1">{getWeatherIcon(day.condition)}</div>
                <div className="text-sm text-gray-600">Day {index + 1}</div>
                <div className="font-semibold">{day.temperature}°C</div>
                <div className="text-xs text-gray-500 capitalize">{day.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trip Highlights */}
      {currentTrip.summary?.highlights && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">✨ Trip Highlights</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {currentTrip.summary.highlights.map((highlight, index) => (
              <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-500 mr-3">⭐</span>
                <span className="text-gray-700">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Itinerary */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">📋 Daily Itinerary</h2>
        
        {currentTrip.itinerary?.map((day, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {/* Day Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Day {day.day} - {formatDate(day.date)}
                  </h3>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    {getWeatherIcon(day.condition)}
                    <span className="ml-1">{day.temperature}°C</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Time Periods */}
            <div className="divide-y">
              {/* Morning */}
              {day.morning && (
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-20 text-center">
                      <div className="text-2xl mb-1">🌅</div>
                      <div className="text-sm font-medium text-gray-600">Morning</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">{day.morning.activity}</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">📍 Location:</span> {day.morning.location}</p>
                        <p><span className="font-medium">⏱️ Duration:</span> {day.morning.duration}</p>
                        <p><span className="font-medium">💰 Cost:</span> {day.morning.cost}</p>
                        <p className="text-gray-700">{day.morning.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Afternoon */}
              {day.afternoon && (
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-20 text-center">
                      <div className="text-2xl mb-1">☀️</div>
                      <div className="text-sm font-medium text-gray-600">Afternoon</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">{day.afternoon.activity}</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">📍 Location:</span> {day.afternoon.location}</p>
                        <p><span className="font-medium">⏱️ Duration:</span> {day.afternoon.duration}</p>
                        <p><span className="font-medium">💰 Cost:</span> {day.afternoon.cost}</p>
                        <p className="text-gray-700">{day.afternoon.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Evening */}
              {day.evening && (
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-20 text-center">
                      <div className="text-2xl mb-1">🌆</div>
                      <div className="text-sm font-medium text-gray-600">Evening</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">{day.evening.activity}</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">📍 Location:</span> {day.evening.location}</p>
                        <p><span className="font-medium">⏱️ Duration:</span> {day.evening.duration}</p>
                        <p><span className="font-medium">💰 Cost:</span> {day.evening.cost}</p>
                        <p className="text-gray-700">{day.evening.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      {currentTrip.tips && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">💡 Travel Tips</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Transportation */}
            {currentTrip.tips.transportation && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  🚗 Transportation
                </h3>
                <p className="text-gray-600 text-sm">{currentTrip.tips.transportation}</p>
              </div>
            )}

            {/* Budget Tips */}
            {currentTrip.tips.budget && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  💰 Budget Tips
                </h3>
                <ul className="space-y-1">
                  {currentTrip.tips.budget.map((tip, index) => (
                    <li key={index} className="text-gray-600 text-sm flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Packing */}
            {currentTrip.tips.packing && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  🎒 Packing List
                </h3>
                <ul className="space-y-1">
                  {currentTrip.tips.packing.map((item, index) => (
                    <li key={index} className="text-gray-600 text-sm flex items-start">
                      <span className="text-blue-500 mr-2 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trip Metadata */}
      <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
        Generated on {new Date(currentTrip.generatedOn).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  )
}

export default Itinerary