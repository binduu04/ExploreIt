// // src/pages/TripPlanner.jsx - Complete Trip Planning Form
// import React, { useState } from 'react'
// import { ArrowLeft, MapPin, Calendar, Heart, DollarSign, Users, Sparkles, ArrowRight, Loader } from 'lucide-react'
// import { useNavigate } from 'react-router-dom'
// import { useTrip } from '../context/TripContext'

// const TripPlanner = () => {
//   const navigate = useNavigate()
//   const { tripForm, updateTripForm } = useTrip()
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [errors, setErrors] = useState({})

//   const handleInputChange = (field, value) => {
//     updateTripForm(field, value)
//     // Clear error when user starts typing
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: '' }))
//     }
//   }

//   const validateForm = () => {
//     const newErrors = {}
    
//     if (!tripForm.destination.trim()) {
//       newErrors.destination = 'Please enter a destination'
//     }
//     if (!tripForm.duration || tripForm.duration < 1) {
//       newErrors.duration = 'Please enter trip duration'
//     }
//     if (!tripForm.preferences.trim()) {
//       newErrors.preferences = 'Tell us what you like to do'
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleGenerateTrip = async () => {
//     if (!validateForm()) return

//     setIsGenerating(true)
    
//     // Simulate API call for now
//     setTimeout(() => {
//       console.log('Generating trip with:', tripForm)
//       setIsGenerating(false)
//       // Navigate to itinerary page (will implement in next phase)
//       navigate('/itinerary');
//       //alert('Trip generation coming in next phase!')
//     }, 3000)
//   }

//   const preferenceSuggestions = [
//     'Adventure & Hiking', 'Food & Restaurants', 'Museums & Culture', 
//     'Beaches & Relaxation', 'Nightlife & Entertainment', 'Shopping',
//     'Photography & Sightseeing', 'Local Experiences', 'Nature & Wildlife'
//   ]

//   const budgetOptions = [
//     { value: 'budget', label: 'Budget ($50-100/day)', icon: '💰' },
//     { value: 'mid', label: 'Mid-range ($100-200/day)', icon: '💳' },
//     { value: 'luxury', label: 'Luxury ($200+/day)', icon: '💎' }
//   ]

//   const groupOptions = [
//     { value: 'solo', label: 'Solo Traveler', icon: '🧳' },
//     { value: 'couple', label: 'Couple', icon: '💕' },
//     { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
//     { value: 'friends', label: 'Friends Group', icon: '👥' }
//   ]

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
//       {/* Header */}
//       <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
//         <div className="max-w-6xl mx-auto px-4 py-4">
//           <button
//             onClick={() => navigate('/')}
//             className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5 mr-2" />
//             Back to Home
//           </button>
//         </div>
//       </header>

//       <div className="max-w-4xl mx-auto px-4 py-12">
//         {/* Header Section */}
//         <div className="text-center mb-12">
//           <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-6 py-3 rounded-full border border-blue-200/50 mb-6">
//             <Sparkles className="w-5 h-5 text-blue-500" />
//             <span className="text-blue-700 font-medium">AI Trip Planner</span>
//           </div>
          
//           <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
//             Plan Your Perfect Trip
//           </h1>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//             Tell us about your dream destination and we'll create a personalized day-by-day itinerary just for you.
//           </p>
//         </div>

//         {/* Main Form */}
//         <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 md:p-12">
//           <div className="space-y-8">
            
//             {/* Destination Input */}
//             <div className="space-y-3">
//               <label className="flex items-center text-lg font-semibold text-gray-800">
//                 <MapPin className="w-5 h-5 mr-2 text-blue-500" />
//                 Where do you want to go?
//               </label>
//               <input
//                 type="text"
//                 placeholder="e.g., Paris, Tokyo, Bali, New York..."
//                 value={tripForm.destination}
//                 onChange={(e) => handleInputChange('destination', e.target.value)}
//                 className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-200 text-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-0 ${
//                   errors.destination 
//                     ? 'border-red-300 focus:border-red-500' 
//                     : 'border-gray-200 focus:border-blue-500'
//                 }`}
//               />
//               {errors.destination && (
//                 <p className="text-red-500 text-sm mt-1">{errors.destination}</p>
//               )}
//             </div>

//             {/* Duration Input */}
//             <div className="space-y-3">
//               <label className="flex items-center text-lg font-semibold text-gray-800">
//                 <Calendar className="w-5 h-5 mr-2 text-blue-500" />
//                 How many days?
//               </label>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                 {[1, 2, 3, 4, 5, 7, 10, 14].map((days) => (
//                   <button
//                     key={days}
//                     onClick={() => handleInputChange('duration', days)}
//                     className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
//                       tripForm.duration === days
//                         ? 'border-blue-500 bg-blue-50 text-blue-600'
//                         : 'border-gray-200 hover:border-blue-300 bg-white/50'
//                     }`}
//                   >
//                     {days} {days === 1 ? 'day' : 'days'}
//                   </button>
//                 ))}
//               </div>
//               <input
//                 type="number"
//                 placeholder="Or enter custom days..."
//                 value={tripForm.duration > 14 ? tripForm.duration : ''}
//                 onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || '')}
//                 className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-0"
//               />
//               {errors.duration && (
//                 <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
//               )}
//             </div>

//             {/* Preferences */}
//             <div className="space-y-3">
//               <label className="flex items-center text-lg font-semibold text-gray-800">
//                 <Heart className="w-5 h-5 mr-2 text-blue-500" />
//                 What do you love doing?
//               </label>
//               <textarea
//                 placeholder="e.g., exploring local food, visiting museums, hiking, photography, nightlife..."
//                 value={tripForm.preferences}
//                 onChange={(e) => handleInputChange('preferences', e.target.value)}
//                 rows="3"
//                 className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-200 text-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-0 resize-none ${
//                   errors.preferences 
//                     ? 'border-red-300 focus:border-red-500' 
//                     : 'border-gray-200 focus:border-blue-500'
//                 }`}
//               />
              
//               {/* Preference Suggestions */}
//               <div className="flex flex-wrap gap-2 mt-3">
//                 {preferenceSuggestions.map((suggestion) => (
//                   <button
//                     key={suggestion}
//                     onClick={() => {
//                       const current = tripForm.preferences
//                       const newPrefs = current ? `${current}, ${suggestion}` : suggestion
//                       handleInputChange('preferences', newPrefs)
//                     }}
//                     className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors text-sm"
//                   >
//                     + {suggestion}
//                   </button>
//                 ))}
//               </div>
//               {errors.preferences && (
//                 <p className="text-red-500 text-sm mt-1">{errors.preferences}</p>
//               )}
//             </div>

//             {/* Budget Selection */}
//             <div className="space-y-3">
//               <label className="flex items-center text-lg font-semibold text-gray-800">
//                 <DollarSign className="w-5 h-5 mr-2 text-blue-500" />
//                 What's your budget? (Optional)
//               </label>
//               <div className="grid md:grid-cols-3 gap-4">
//                 {budgetOptions.map((option) => (
//                   <button
//                     key={option.value}
//                     onClick={() => handleInputChange('budget', option.value)}
//                     className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
//                       tripForm.budget === option.value
//                         ? 'border-blue-500 bg-blue-50'
//                         : 'border-gray-200 hover:border-blue-300 bg-white/50'
//                     }`}
//                   >
//                     <div className="text-2xl mb-2">{option.icon}</div>
//                     <div className="font-medium text-gray-800">{option.label}</div>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Group Type */}
//             <div className="space-y-3">
//               <label className="flex items-center text-lg font-semibold text-gray-800">
//                 <Users className="w-5 h-5 mr-2 text-blue-500" />
//                 Who's traveling?
//               </label>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 {groupOptions.map((option) => (
//                   <button
//                     key={option.value}
//                     onClick={() => handleInputChange('groupType', option.value)}
//                     className={`p-4 rounded-2xl border-2 transition-all duration-200 text-center ${
//                       tripForm.groupType === option.value
//                         ? 'border-blue-500 bg-blue-50'
//                         : 'border-gray-200 hover:border-blue-300 bg-white/50'
//                     }`}
//                   >
//                     <div className="text-2xl mb-2">{option.icon}</div>
//                     <div className="font-medium text-gray-800 text-sm">{option.label}</div>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Generate Button */}
//             <div className="pt-6">
//               <button
//                 onClick={handleGenerateTrip}
//                 disabled={isGenerating}
//                 className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-6 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-purple-600 transform hover:scale-[1.02] transition-all duration-300 shadow-2xl shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
//               >
//                 {isGenerating ? (
//                   <>
//                     <Loader className="w-6 h-6 mr-3 animate-spin" />
//                     Creating Your Perfect Trip...
//                   </>
//                 ) : (
//                   <>
//                     Generate My Trip
//                     <ArrowRight className="w-6 h-6 ml-3" />
//                   </>
//                 )}
//               </button>
              
//               <p className="text-center text-gray-500 mt-4 text-sm">
//                 ✨ This will take 10-15 seconds to create your personalized itinerary
//               </p>
//             </div>
//           </div>

//           {/* Form Preview */}
//           {(tripForm.destination || tripForm.duration || tripForm.preferences) && (
//             <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50">
//               <h3 className="font-semibold text-gray-800 mb-3">Trip Preview:</h3>
//               <div className="text-sm text-gray-700 space-y-1">
//                 {tripForm.destination && <p>📍 <strong>Destination:</strong> {tripForm.destination}</p>}
//                 {tripForm.duration && <p>📅 <strong>Duration:</strong> {tripForm.duration} days</p>}
//                 {tripForm.preferences && <p>❤️ <strong>Interests:</strong> {tripForm.preferences}</p>}
//                 {tripForm.budget && <p>💰 <strong>Budget:</strong> {budgetOptions.find(b => b.value === tripForm.budget)?.label}</p>}
//                 {tripForm.groupType && <p>👥 <strong>Group:</strong> {groupOptions.find(g => g.value === tripForm.groupType)?.label}</p>}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default TripPlanner


// src/pages/TripPlanner.jsx - Enhanced Trip Planning Form with Weather Integration
import React, { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, Calendar, Heart, DollarSign, Users, Sparkles, ArrowRight, Loader, AlertCircle, Star, Cloud, Thermometer } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../context/TripContext'

const TripPlanner = () => {
  const navigate = useNavigate()
  const { tripForm, updateTripForm, generateItinerary, loading, error, clearError } = useTrip()
  const [errors, setErrors] = useState({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Clear error when component mounts
  useEffect(() => {
    clearError()
  }, [clearError])

  const handleInputChange = (field, value) => {
    updateTripForm(field, value)
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!tripForm.destination.trim()) {
      newErrors.destination = 'Please enter a destination'
    }
    
    const duration = parseInt(tripForm.duration)
    if (!tripForm.duration || duration < 1) {
      newErrors.duration = 'Please enter trip duration (minimum 1 day)'
    } else if (duration > 14) {
      newErrors.duration = 'Maximum trip duration is 14 days'
    }
    
    if (!tripForm.preferences.trim()) {
      newErrors.preferences = 'Tell us what you like to do'
    }

    // Validate start date
    const startDate = new Date(tripForm.startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (startDate < today) {
      newErrors.startDate = 'Start date cannot be in the past'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGenerateTrip = async () => {
    if (!validateForm()) return

    try {
      console.log('🚀 Starting trip generation...')
      const generatedTrip = await generateItinerary(tripForm)
      
      if (generatedTrip) {
        console.log('✅ Trip generated, navigating to results...')
        navigate('/itinerary')
      }
    } catch (error) {
      console.error('❌ Trip generation failed:', error)
    }
  }

  const preferenceSuggestions = [
    'Adventure & Hiking', 'Food & Restaurants', 'Museums & Culture', 
    'Beaches & Relaxation', 'Nightlife & Entertainment', 'Shopping',
    'Photography & Sightseeing', 'Local Experiences', 'Nature & Wildlife',
    'Architecture & History', 'Art Galleries', 'Street Markets'
  ]

  const budgetOptions = [
    { value: 'budget', label: 'Budget ($50-100/day)', icon: '💰', desc: 'Hostels, street food, free activities' },
    { value: 'mid', label: 'Mid-range ($100-200/day)', icon: '💳', desc: 'Hotels, restaurants, paid attractions' },
    { value: 'luxury', label: 'Luxury ($200+/day)', icon: '💎', desc: 'Premium hotels, fine dining, private tours' }
  ]

  const groupOptions = [
    { value: 'solo', label: 'Solo Traveler', icon: '🧳', desc: 'Flexible pace, personal interests' },
    { value: 'couple', label: 'Couple', icon: '💕', desc: 'Romantic experiences, intimate settings' },
    { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Kid-friendly activities, family accommodations' },
    { value: 'friends', label: 'Friends Group', icon: '👥', desc: 'Group activities, social experiences' }
  ]

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-6 py-3 rounded-full border border-blue-200/50 mb-6">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span className="text-blue-700 font-medium">AI Trip Planner with Weather Intelligence</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Plan Your Perfect Trip
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us about your dream destination and we'll create a personalized, weather-optimized itinerary with local insights and realistic planning.
          </p>
          
          {/* Weather Integration Badge */}
          <div className="flex items-center justify-center space-x-4 mt-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-blue-500" />
              <span>Real-time weather integration</span>
            </div>
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span>Climate-optimized activities</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Local expert insights</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">Generation Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <p className="text-red-600 text-xs mt-2">Don't worry! We'll still create a great itinerary for you.</p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 md:p-12">
          <div className="space-y-8">
            
            {/* Destination Input */}
            <div className="space-y-3">
              <label className="flex items-center text-lg font-semibold text-gray-800">
                <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                Where do you want to go? *
              </label>
              <input
                type="text"
                placeholder="e.g., Paris, Tokyo, Bali, New York, Rome..."
                value={tripForm.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-200 text-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-0 ${
                  errors.destination 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              {errors.destination && (
                <p className="text-red-500 text-sm mt-1">{errors.destination}</p>
              )}
            </div>

            {/* Duration and Start Date */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Duration Input */}
              <div className="space-y-3">
                <label className="flex items-center text-lg font-semibold text-gray-800">
                  <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                  How many days? *
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[1, 2, 3, 4, 5, 7, 10, 14].map((days) => (
                    <button
                      key={days}
                      onClick={() => handleInputChange('duration', days)}
                      className={`px-3 py-2 rounded-xl border-2 transition-all duration-200 font-medium text-sm ${
                        tripForm.duration === days
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-blue-300 bg-white/50'
                      }`}
                    >
                      {days} {days === 1 ? 'day' : 'days'}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="14"
                  placeholder="Custom days (1-14)"
                  value={tripForm.duration > 14 ? tripForm.duration : ''}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || '')}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-0"
                />
                {errors.duration && (
                  <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
                )}
              </div>

              {/* Start Date */}
              <div className="space-y-3">
                <label className="flex items-center text-lg font-semibold text-gray-800">
                  <Calendar className="w-5 h-5 mr-2 text-green-500" />
                  When do you start?
                </label>
                <input
                  type="date"
                  min={getMinDate()}
                  value={tripForm.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-0 ${
                    errors.startDate 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                )}
                <p className="text-xs text-gray-500">
                  📊 First 5 days get accurate weather forecasts, remaining days use seasonal patterns
                </p>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-3">
              <label className="flex items-center text-lg font-semibold text-gray-800">
                <Heart className="w-5 h-5 mr-2 text-blue-500" />
                What do you love doing? *
              </label>
              <textarea
                placeholder="e.g., exploring local food markets, visiting art museums, hiking trails, photography, trying street food, historical sites..."
                value={tripForm.preferences}
                onChange={(e) => handleInputChange('preferences', e.target.value)}
                rows="3"
                className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-200 text-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-0 resize-none ${
                  errors.preferences 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              
              {/* Preference Suggestions */}
              <div className="flex flex-wrap gap-2 mt-3">
                {preferenceSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      const current = tripForm.preferences
                      const newPrefs = current ? `${current}, ${suggestion}` : suggestion
                      handleInputChange('preferences', newPrefs)
                    }}
                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors text-sm"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
              {errors.preferences && (
                <p className="text-red-500 text-sm mt-1">{errors.preferences}</p>
              )}
            </div>

            {/* Budget Selection */}
            <div className="space-y-3">
              <label className="flex items-center text-lg font-semibold text-gray-800">
                <DollarSign className="w-5 h-5 mr-2 text-blue-500" />
                What's your budget?
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {budgetOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange('budget', option.value)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                      tripForm.budget === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 bg-white/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-medium text-gray-800 mb-1">{option.label}</div>
                    <div className="text-xs text-gray-600">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Group Type */}
            <div className="space-y-3">
              <label className="flex items-center text-lg font-semibold text-gray-800">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                Who's traveling?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {groupOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange('groupType', option.value)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 text-center ${
                      tripForm.groupType === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 bg-white/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-medium text-gray-800 text-sm mb-1">{option.label}</div>
                    <div className="text-xs text-gray-600">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="pt-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
              >
                {showAdvanced ? '↑' : '↓'} Advanced Options
              </button>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="space-y-6 pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <label className="flex items-center text-lg font-semibold text-gray-800">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Specific places you want to visit (Optional)
                  </label>
                  <textarea
                    placeholder="e.g., Eiffel Tower, Louvre Museum, Montmartre district..."
                    value={tripForm.specificPlaces}
                    onChange={(e) => handleInputChange('specificPlaces', e.target.value)}
                    rows="2"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-0 resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    💡 Leave blank for AI to suggest the best spots based on your interests
                  </p>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="pt-6">
              <button
                onClick={handleGenerateTrip}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-6 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-purple-600 transform hover:scale-[1.02] transition-all duration-300 shadow-2xl shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="w-6 h-6 mr-3 animate-spin" />
                    Creating Your Weather-Smart Itinerary...
                  </>
                ) : (
                  <>
                    Generate My Smart Trip
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </>
                )}
              </button>
              
              <p className="text-center text-gray-500 mt-4 text-sm">
                ✨ This will take 15-30 seconds to analyze weather patterns and create your personalized itinerary
              </p>
            </div>
          </div>

          {/* Form Preview */}
          {(tripForm.destination || tripForm.duration || tripForm.preferences) && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Trip Preview:
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                {tripForm.destination && <p>📍 <strong>Destination:</strong> {tripForm.destination}</p>}
                {tripForm.duration && <p>📅 <strong>Duration:</strong> {tripForm.duration} days</p>}
                {tripForm.startDate && <p>🗓️ <strong>Start Date:</strong> {new Date(tripForm.startDate).toLocaleDateString()}</p>}
                </div>
                </div>)}
                </div>
                </div>
                </div>
  )}

  export default TripPlanner
