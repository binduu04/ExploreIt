import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft, MapPin, Calendar, Clock, DollarSign, Users, 
  Share2, Download, Heart, Star, Cloud, Thermometer, 
  Umbrella, Wind, Sun, CloudRain, Snowflake, Eye,
  AlertTriangle, CheckCircle, Info, Loader, RefreshCw,
  Camera, Utensils, Navigation, Phone, Wifi, ChevronDown,
  ChevronUp, Save, Edit, Trash2, Copy, ExternalLink
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../context/TripContext'

const Itinerary = () => {
  const navigate = useNavigate()
  const { currentTrip, saveTrip, loading, error, regenerateItinerary } = useTrip()
  
  const [expandedDays, setExpandedDays] = useState({})
  const [selectedDay, setSelectedDay] = useState(1)
  const [showWeatherDetails, setShowWeatherDetails] = useState(false)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [showAllDetails, setShowAllDetails] = useState(false)

  // Auto-expand first day on load
  useEffect(() => {
    if (currentTrip?.itinerary?.length > 0) {
      setExpandedDays({ 1: true })
    }
  }, [currentTrip])

  // Redirect if no trip data
  useEffect(() => {
    if (!loading && !currentTrip) {
      navigate('/plan')
    }
  }, [currentTrip, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Creating Your Smart Itinerary</h2>
          <p className="text-gray-600">Analyzing weather patterns and local insights...</p>
        </div>
      </div>
    )
  }

  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Itinerary Found</h2>
          <p className="text-gray-600 mb-6">Let's create your perfect trip!</p>
          <button
            onClick={() => navigate('/plan')}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
          >
            Plan New Trip
          </button>
        </div>
      </div>
    )
  }

  const handleSaveTrip = async () => {
    setSaving(true)
    const success = await saveTrip(currentTrip)
    if (success) {
      // Show success feedback
      setTimeout(() => setSaving(false), 1000)
    } else {
      setSaving(false)
    }
  }

  const handleRegenerateItinerary = async () => {
    setRegenerating(true)
    try {
      await regenerateItinerary(currentTrip)
    } finally {
      setRegenerating(false)
    }
  }

  const toggleDayExpansion = (dayNumber) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNumber]: !prev[dayNumber]
    }))
  }

  const getWeatherIcon = (conditions, size = 'w-5 h-5') => {
    const condition = conditions?.overall?.toLowerCase() || ''
    
    if (condition.includes('rain') || condition.includes('shower')) {
      return <CloudRain className={`${size} text-blue-500`} />
    } else if (condition.includes('snow')) {
      return <Snowflake className={`${size} text-blue-300`} />
    } else if (condition.includes('cloud')) {
      return <Cloud className={`${size} text-gray-500`} />
    } else if (condition.includes('clear') || condition.includes('sunny')) {
      return <Sun className={`${size} text-yellow-500`} />
    } else {
      return <Cloud className={`${size} text-gray-400`} />
    }
  }

  const getWeatherColor = (conditions) => {
    const condition = conditions?.overall?.toLowerCase() || ''
    
    if (condition.includes('rain')) return 'border-blue-200 bg-blue-50'
    if (condition.includes('snow')) return 'border-blue-100 bg-blue-25'
    if (condition.includes('cloud')) return 'border-gray-200 bg-gray-50'
    if (condition.includes('clear') || condition.includes('sunny')) return 'border-yellow-200 bg-yellow-50'
    return 'border-gray-200 bg-gray-50'
  }

  const getComfortColor = (comfort) => {
    const level = comfort?.toLowerCase() || ''
    
    if (level.includes('excellent') || level.includes('perfect')) return 'text-green-600'
    if (level.includes('comfortable') || level.includes('good')) return 'text-blue-600'
    if (level.includes('mild') || level.includes('moderate')) return 'text-yellow-600'
    if (level.includes('challenging') || level.includes('difficult')) return 'text-orange-600'
    return 'text-gray-600'
  }

  const formatBudget = (budget) => {
    if (!budget) return 'Budget varies'
    return budget.replace(/\$(\d+)-(\d+)/, '$$$1-$$$2')
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    // Could add toast notification here
  }

  const shareItinerary = () => {
    if (navigator.share) {
      navigator.share({
        title: `${currentTrip.destination} Trip Itinerary`,
        text: `Check out my ${currentTrip.duration}-day trip to ${currentTrip.destination}!`,
        url: window.location.href
      })
    } else {
      copyToClipboard(window.location.href)
    }
  }

  const weatherData = currentTrip.weatherData
  const itinerary = currentTrip.itinerary || []
  const hasWeatherData = weatherData && weatherData.forecast

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/planner')}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Plan Another Trip
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRegenerateItinerary}
                disabled={regenerating}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                {regenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
              
              <button
                onClick={shareItinerary}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              
              <button
                onClick={handleSaveTrip}
                disabled={saving}
                className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-pulse' : ''}`} />
                {saving ? 'Saving...' : 'Save Trip'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Trip Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-2 text-blue-600 mb-2">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium">Your Smart Itinerary</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                {currentTrip.destination}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{currentTrip.duration} days</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="capitalize">{currentTrip.groupType}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="capitalize">{currentTrip.budget} budget</span>
                </div>
                
                {currentTrip.startDate && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Starts {new Date(currentTrip.startDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Weather Summary */}
            {hasWeatherData && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <Cloud className="w-4 h-4 mr-2 text-blue-500" />
                    Weather Overview
                  </h3>
                  <button
                    onClick={() => setShowWeatherDetails(!showWeatherDetails)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {showWeatherDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Days 1-{weatherData.dataQuality?.accurateDays || 0}: Accurate forecasts</span>
                  </div>
                  
                  {weatherData.dataQuality?.estimatedDays > 0 && (
                    <div className="flex items-center space-x-2">
                      <Info className="w-4 h-4 text-blue-500" />
                      <span>Days {(weatherData.dataQuality?.accurateDays || 0) + 1}+: Seasonal estimates</span>
                    </div>
                  )}
                </div>

                {showWeatherDetails && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {weatherData.forecast?.slice(0, 4).map((day, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        {getWeatherIcon(day.conditions, 'w-3 h-3')}
                        <span>Day {index + 1}: {day.temperature?.average || 20}°C</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Display */}
          {(error || currentTrip.error) && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800">Generation Notice</h4>
                <p className="text-yellow-700 text-sm mt-1">{error || currentTrip.error}</p>
                <p className="text-yellow-600 text-xs mt-2">Your itinerary was still created successfully!</p>
              </div>
            </div>
          )}
        </div>

        {/* Day Selector */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 mb-8">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap mr-4">Jump to day:</span>
            {itinerary.map((dayData, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedDay(dayData.day || index + 1)
                  document.getElementById(`day-${dayData.day || index + 1}`)?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                  })
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-xl border-2 transition-all duration-200 ${
                  selectedDay === (dayData.day || index + 1)
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-blue-300 bg-white/50'
                }`}
              >
                Day {dayData.day || index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Itinerary Days */}
        <div className="space-y-8">
          {itinerary.map((dayData, index) => {
            const dayNumber = dayData.day || index + 1
            const isExpanded = expandedDays[dayNumber]
            const weather = dayData.weather || {}
            
            return (
              <div
                key={dayNumber}
                id={`day-${dayNumber}`}
                className={`bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border transition-all duration-300 ${getWeatherColor(weather.conditions)}`}
              >
                {/* Day Header */}
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => toggleDayExpansion(dayNumber)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl px-4 py-2 font-bold">
                        Day {dayNumber}
                      </div>
                      
                      {weather.date && (
                        <div className="text-gray-600">
                          {new Date(weather.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Weather Summary */}
                      <div className="flex items-center space-x-3 text-sm">
                        {getWeatherIcon(weather.conditions)}
                        <div className="text-right">
                          <div className="font-medium">
                            {weather.temperature?.min || 18}° - {weather.temperature?.max || 25}°C
                          </div>
                          <div className={`text-xs ${getComfortColor(weather.comfort)}`}>
                            {weather.comfort || 'Pleasant'}
                          </div>
                        </div>
                      </div>

                      <ChevronDown 
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Weather Details Bar */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Thermometer className="w-4 h-4" />
                      <span>Avg: {weather.temperature?.average || 22}°C</span>
                    </div>
                    
                    {weather.precipitation && (
                      <div className="flex items-center space-x-1">
                        <Umbrella className="w-4 h-4" />
                        <span>{weather.precipitation.probability || 20}% rain</span>
                      </div>
                    )}
                    
                    {weather.windSpeed && (
                      <div className="flex items-center space-x-1">
                        <Wind className="w-4 h-4" />
                        <span>{weather.windSpeed}km/h</span>
                      </div>
                    )}

                    {weather.accuracy && (
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        weather.accuracy === 'high' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {weather.accuracy === 'high' ? 'Real-time forecast' : 'Seasonal estimate'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Day Content */}
                {isExpanded && (
                  <div className="px-6 pb-6">
                    {/* Weather Strategy */}
                    {dayData.weather && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <Eye className="w-4 h-4 mr-2" />
                          Today's Weather Strategy
                        </h4>
                        <p className="text-sm text-gray-700">
                          {weather.conditions?.overall} conditions with temperatures ranging from {weather.temperature?.min}°C to {weather.temperature?.max}°C. 
                          {weather.precipitation?.expected ? ' Pack rain gear and plan indoor alternatives.' : ' Great day for outdoor activities!'}
                        </p>
                      </div>
                    )}

                    {/* Time Slots */}
                    <div className="space-y-6">
                      {/* Morning */}
                      {dayData.morning && dayData.morning.length > 0 && (
                        <TimeSlot 
                          title="Morning Adventure" 
                          time="9:00 - 12:00" 
                          activities={dayData.morning}
                          icon={<Sun className="w-5 h-5 text-yellow-500" />}
                        />
                      )}

                      {/* Afternoon */}
                      {dayData.afternoon && dayData.afternoon.length > 0 && (
                        <TimeSlot 
                          title="Afternoon Exploration" 
                          time="14:00 - 17:00" 
                          activities={dayData.afternoon}
                          icon={<Cloud className="w-5 h-5 text-blue-500" />}
                        />
                      )}

                      {/* Evening */}
                      {dayData.evening && dayData.evening.length > 0 && (
                        <TimeSlot 
                          title="Evening Experience" 
                          time="17:00 - 20:00" 
                          activities={dayData.evening}
                          icon={<Star className="w-5 h-5 text-purple-500" />}
                        />
                      )}
                    </div>

                    {/* Daily Summary */}
                    <div className="mt-6 pt-6 border-t border-gray-200 grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-800 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Daily Budget
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatBudget(dayData.dailyBudget)}
                        </p>
                      </div>
                      
                      {dayData.preparations && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-800 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Preparations
                          </h4>
                          <p className="text-sm text-gray-600">
                            {dayData.preparations}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Trip Summary */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl shadow-2xl text-white p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Your {currentTrip.destination} Adventure Awaits!</h2>
            <p className="text-blue-100 mb-6">
              {currentTrip.duration} days of carefully planned experiences with weather-optimized activities
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleSaveTrip}
                disabled={saving}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <Heart className="w-4 h-4 inline mr-2" />
                {saving ? 'Saving...' : 'Save This Trip'}
              </button>
              
              <button
                onClick={shareItinerary}
                className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                <Share2 className="w-4 h-4 inline mr-2" />
                Share Itinerary
              </button>
              
              <button
                onClick={() => navigate('/planner')}
                className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Plan Another Trip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Time Slot Component
const TimeSlot = ({ title, time, activities, icon }) => {
  const [expanded, setExpanded] = useState(false)
  
  if (!activities || activities.length === 0) return null
  
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <div 
        className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 cursor-pointer hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon}
            <div>
              <h3 className="font-semibold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-600">{time}</p>
            </div>
          </div>
          
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>
      
      {expanded && (
        <div className="p-6 space-y-6">
          {activities.map((activity, index) => (
            <ActivityCard key={index} activity={activity} />
          ))}
        </div>
      )}
    </div>
  )
}

// Activity Card Component
const ActivityCard = ({ activity }) => {
  const [showAllDetails, setShowAllDetails] = useState(false)
  
  if (!activity) return null
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="p-6">
        {/* Activity Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-gray-800 mb-2">
              {activity.activity || 'Activity'}
            </h4>
            
            {activity.location && (
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">{activity.location}</span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowAllDetails(!showAllDetails)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showAllDetails ? 'Less details' : 'More details'}
          </button>
        </div>

        {/* Key Information */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {activity.cost && (
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">{activity.cost}</span>
            </div>
          )}
          
          {activity.timeManagement && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700">{activity.timeManagement}</span>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {showAllDetails && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            {activity.transport && (
              <DetailItem icon={<Navigation className="w-4 h-4 text-blue-500" />} label="Getting There" value={activity.transport} />
            )}
            
            {activity.dressCode && (
              <DetailItem icon={<Eye className="w-4 h-4 text-purple-500" />} label="Dress Code" value={activity.dressCode} />
            )}
            
            {activity.weatherBackup && (
              <DetailItem icon={<Umbrella className="w-4 h-4 text-gray-500" />} label="Weather Backup" value={activity.weatherBackup} />
            )}
            
            {activity.insiderTip && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-yellow-800 text-sm">Insider Tip</h5>
                    <p className="text-yellow-700 text-sm mt-1">{activity.insiderTip}</p>
                  </div>
                </div>
              </div>
            )}
            
            {activity.notes && (
              <DetailItem icon={<Info className="w-4 h-4 text-blue-500" />} label="Additional Notes" value={activity.notes} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Detail Item Component
const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start space-x-3">
    {icon}
    <div className="flex-1">
      <h5 className="font-medium text-gray-700 text-sm">{label}</h5>
      <p className="text-gray-600 text-sm mt-1">{value}</p>
    </div>
  </div>
)

export default Itinerary