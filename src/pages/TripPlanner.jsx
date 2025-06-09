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

// // // src/pages/TripPlanner.jsx - Updated with Login Integration
// // import React, { useState } from 'react'
// // import { ArrowLeft, MapPin, Calendar, Heart, DollarSign, Users, Sparkles, ArrowRight, Loader } from 'lucide-react'
// // import { useNavigate } from 'react-router-dom'
// // import { useTrip } from '../context/TripContext'
// // import { useAuth } from '../context/AuthContext'
// // import LoginModal from '../components/LoginModal'

// // const TripPlanner = () => {
// //   const navigate = useNavigate()
// //   const { tripForm, updateTripForm } = useTrip()
// //   const { user, isLoggedIn } = useAuth()
// //   const [isGenerating, setIsGenerating] = useState(false)
// //   const [errors, setErrors] = useState({})
// //   const [showLoginModal, setShowLoginModal] = useState(false)
// //   const [generatedTrip, setGeneratedTrip] = useState(null)

// //   const handleInputChange = (field, value) => {
// //     updateTripForm(field, value)
// //     // Clear error when user starts typing
// //     if (errors[field]) {
// //       setErrors(prev => ({ ...prev, [field]: '' }))
// //     }
// //   }

// //   const validateForm = () => {
// //     const newErrors = {}
    
// //     if (!tripForm.destination.trim()) {
// //       newErrors.destination = 'Please enter a destination'
// //     }
// //     if (!tripForm.duration || tripForm.duration < 1) {
// //       newErrors.duration = 'Please enter trip duration'
// //     }
// //     if (!tripForm.preferences.trim()) {
// //       newErrors.preferences = 'Tell us what you like to do'
// //     }

// //     setErrors(newErrors)
// //     return Object.keys(newErrors).length === 0
// //   }

// //   const handleGenerateTrip = async () => {
// //     if (!validateForm()) return

// //     setIsGenerating(true)
    
// //     // Simulate AI trip generation
// //     setTimeout(() => {
// //       const mockTrip = {
// //         id: Date.now(),
// //         destination: tripForm.destination,
// //         duration: tripForm.duration,
// //         preferences: tripForm.preferences,
// //         budget: tripForm.budget,
// //         groupType: tripForm.groupType,
// //         createdAt: new Date(),
// //         // Mock itinerary data - will be replaced with real API calls later
// //         days: Array.from({ length: tripForm.duration }, (_, i) => ({
// //           day: i + 1,
// //           date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
// //           activities: [
// //             { time: 'Morning', activity: `Explore ${tripForm.destination}`, location: 'City Center' },
// //             { time: 'Afternoon', activity: 'Local cuisine experience', location: 'Restaurant District' },
// //             { time: 'Evening', activity: 'Sunset viewing', location: 'Scenic Viewpoint' }
// //           ]
// //         }))
// //       }
      
// //       setGeneratedTrip(mockTrip)
// //       setIsGenerating(false)
      
// //       // If user is not logged in, show login modal
// //       if (!isLoggedIn) {
// //         setShowLoginModal(true)
// //       } else {
// //         // Navigate directly to itinerary
// //         navigate('/itinerary', { state: { trip: mockTrip } })
// //       }
// //     }, 3000)
// //   }

// //   const handleLoginSuccess = () => {
// //     // After login, navigate to itinerary with the generated trip
// //     if (generatedTrip) {
// //       navigate('/itinerary', { state: { trip: generatedTrip } })
// //     }
// //   }

// //   const preferenceSuggestions = [
// //     'Adventure & Hiking', 'Food & Restaurants', 'Museums & Culture', 
// //     'Beaches & Relaxation', 'Nightlife & Entertainment', 'Shopping',
// //     'Photography & Sightseeing', 'Local Experiences', 'Nature & Wildlife'
// //   ]

// //   const budgetOptions = [
// //     { value: 'budget', label: 'Budget ($50-100/day)', icon: '💰' },
// //     { value: 'mid', label: 'Mid-range ($100-200/day)', icon: '💳' },
// //     { value: 'luxury', label: 'Luxury ($200+/day)', icon: '💎' }
// //   ]

// //   const groupOptions = [
// //     { value: 'solo', label: 'Solo Traveler', icon: '🧳' },
// //     { value: 'couple', label: 'Couple', icon: '💕' },
// //     { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
// //     { value: 'friends', label: 'Friends Group', icon: '👥' }
// //   ]

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
// //       {/* Header */}
// //       <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
// //         <div className="max-w-6xl mx-auto px-4 py-4">
// //           <div className="flex justify-between items-center">
// //             <button
// //               onClick={() => navigate('/')}
// //               className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
// //             >
// //               <ArrowLeft className="w-5 h-5 mr-2" />
// //               Back to Home
// //             </button>
            
// //             {/* User Status */}
// //             {user && (
// //               <div className="text-sm text-gray-600">
// //                 {user.isAnonymous ? (
// //                   <span>👤 Anonymous User</span>
// //                 ) : (
// //                   <span>👋 {user.displayName || user.email}</span>
// //                 )}
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </header>

// //       <div className="max-w-4xl mx-auto px-4 py-12">
// //         {/* Header Section */}
// //         <div className="text-center mb-12">
// //           <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-6 py-3 rounded-full border border-blue-200/50 mb-6">
// //             <Sparkles className="w-5 h-5 text-blue-500" />
// //             <span className="text-blue-700 font-medium">AI Trip Planner</span>
// //           </div>
          
// //           <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
// //             Plan Your Perfect Trip
// //           </h1>
// //           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
// //             Tell us about your dream destination and we'll create a personalized day-by-day itinerary just for you.
// //           </p>
// //         </div>

// //         {/* Main Form */}
// //         <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 md:p-12">
// //           <div className="space-y-8">
            
// //             {/* Destination Input */}
// //             <div className="space-y-3">
// //               <label className="flex items-center text-lg font-semibold text-gray-800">
// //                 <MapPin className="w-5 h-5 mr-2 text-blue-500" />
// //                 Where do you want to go?
// //               </label>
// //               <input
// //                 type="text"
// //                 placeholder="e.g., Paris, Tokyo, Bali, New York..."
// //                 value={tripForm.destination}
// //                 onChange={(e) => handleInputChange('destination', e.target.value)}
// //                 className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-200 text-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-0 ${
// //                   errors.destination 
// //                     ? 'border-red-300 focus:border-red-500' 
// //                     : 'border-gray-200 focus:border-blue-500'
// //                 }`}
// //               />
// //               {errors.destination && (
// //                 <p className="text-red-500 text-sm mt-1">{errors.destination}</p>
// //               )}
// //             </div>

// //             {/* Duration Input */}
// //             <div className="space-y-3">
// //               <label className="flex items-center text-lg font-semibold text-gray-800">
// //                 <Calendar className="w-5 h-5 mr-2 text-blue-500" />
// //                 How many days?
// //               </label>
// //               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
// //                 {[1, 2, 3, 4, 5, 7, 10, 14].map((days) => (
// //                   <button
// //                     key={days}
// //                     onClick={() => handleInputChange('duration', days)}
// //                     className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 font-medium ${
// //                       tripForm.duration === days
// //                         ? 'border-blue-500 bg-blue-50 text-blue-600'
// //                         : 'border-gray-200 hover:border-blue-300 bg-white/50'
// //                     }`}
// //                   >
// //                     {days} {days === 1 ? 'day' : 'days'}
// //                   </button>
// //                 ))}
// //               </div>
// //               <input
// //                 type="number"
// //                 placeholder="Or enter custom days..."
// //                 value={tripForm.duration > 14 ? tripForm.duration : ''}
// //                 onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || '')}
// //                 className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-0"
// //               />
// //               {errors.duration && (
// //                 <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
// //               )}
// //             </div>

// //             {/* Preferences */}
// //             <div className="space-y-3">
// //               <label className="flex items-center text-lg font-semibold text-gray-800">
// //                 <Heart className="w-5 h-5 mr-2 text-blue-500" />
// //                 What do you love doing?
// //               </label>
// //               <textarea
// //                 placeholder="e.g., exploring local food, visiting museums, hiking, photography, nightlife..."
// //                 value={tripForm.preferences}
// //                 onChange={(e) => handleInputChange('preferences', e.target.value)}
// //                 rows="3"
// //                 className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-200 text-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-0 resize-none ${
// //                   errors.preferences 
// //                     ? 'border-red-300 focus:border-red-500' 
// //                     : 'border-gray-200 focus:border-blue-500'
// //                 }`}
// //               />
              
// //               {/* Preference Suggestions */}
// //               <div className="flex flex-wrap gap-2 mt-3">
// //                 {preferenceSuggestions.map((suggestion) => (
// //                   <button
// //                     key={suggestion}
// //                     onClick={() => {
// //                       const current = tripForm.preferences
// //                       const newPrefs = current ? `${current}, ${suggestion}` : suggestion
// //                       handleInputChange('preferences', newPrefs)
// //                     }}
// //                     className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors text-sm"
// //                   >
// //                     + {suggestion}
// //                   </button>
// //                 ))}
// //               </div>
// //               {errors.preferences && (
// //                 <p className="text-red-500 text-sm mt-1">{errors.preferences}</p>
// //               )}
// //             </div>

// //             {/* Budget Selection */}
// //             <div className="space-y-3">
// //               <label className="flex items-center text-lg font-semibold text-gray-800">
// //                 <DollarSign className="w-5 h-5 mr-2 text-blue-500" />
// //                 What's your budget? (Optional)
// //               </label>
// //               <div className="grid md:grid-cols-3 gap-4">
// //                 {budgetOptions.map((option) => (
// //                   <button
// //                     key={option.value}
// //                     onClick={() => handleInputChange('budget', option.value)}
// //                     className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
// //                       tripForm.budget === option.value
// //                         ? 'border-blue-500 bg-blue-50'
// //                         : 'border-gray-200 hover:border-blue-300 bg-white/50'
// //                     }`}
// //                   >
// //                     <div className="text-2xl mb-2">{option.icon}</div>
// //                     <div className="font-medium text-gray-800">{option.label}</div>
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>

// //             {/* Group Type */}
// //             <div className="space-y-3">
// //               <label className="flex items-center text-lg font-semibold text-gray-800">
// //                 <Users className="w-5 h-5 mr-2 text-blue-500" />
// //                 Who's traveling?
// //               </label>
// //               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// //                 {groupOptions.map((option) => (
// //                   <button
// //                     key={option.value}
// //                     onClick={() => handleInputChange('groupType', option.value)}
// //                     className={`p-4 rounded-2xl border-2 transition-all duration-200 text-center ${
// //                       tripForm.groupType === option.value
// //                         ? 'border-blue-500 bg-blue-50'
// //                         : 'border-gray-200 hover:border-blue-300 bg-white/50'
// //                     }`}
// //                   >
// //                     <div className="text-2xl mb-2">{option.icon}</div>
// //                     <div className="font-medium text-gray-800 text-sm">{option.label}</div>
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>

// //             {/* Generate Button */}
// //             <div className="pt-6">
// //               <button
// //                 onClick={handleGenerateTrip}
// //                 disabled={isGenerating}
// //                 className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-6 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-purple-600 transform hover:scale-[1.02] transition-all duration-300 shadow-2xl shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
// //               >
// //                 {isGenerating ? (
// //                   <>
// //                     <Loader className="w-6 h-6 mr-3 animate-spin" />
// //                     Creating Your Perfect Trip...
// //                   </>
// //                 ) : (
// //                   <>
// //                     Generate My Trip
// //                     <ArrowRight className="w-6 h-6 ml-3" />
// //                   </>
// //                 )}
// //               </button>
              
// //               <p className="text-center text-gray-500 mt-4 text-sm">
// //                 ✨ This will take 10-15 seconds to create your personalized itinerary
// //               </p>
// //             </div>
// //           </div>

// //           {/* Form Preview */}
// //           {(tripForm.destination || tripForm.duration || tripForm.preferences) && (
// //             <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50">
// //               <h3 className="font-semibold text-gray-800 mb-3">Trip Preview:</h3>
// //               <div className="text-sm text-gray-700 space-y-1">
// //                 {tripForm.destination && <p>📍 <strong>Destination:</strong> {tripForm.destination}</p>}
// //                 {tripForm.duration && <p>📅 <strong>Duration:</strong> {tripForm.duration} days</p>}
// //                 {tripForm.preferences && <p>❤️ <strong>Interests:</strong> {tripForm.preferences}</p>}
// //                 {tripForm.budget && <p>💰 <strong>Budget:</strong> {budgetOptions.find(b => b.value === tripForm.budget)?.label}</p>}
// //                 {tripForm.groupType && <p>👥 <strong>Group:</strong> {groupOptions.find(g => g.value === tripForm.groupType)?.label}</p>}
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Login Modal */}
// //       <LoginModal
// //         isOpen={showLoginModal}
// //         onClose={() => setShowLoginModal(false)}
// //         onSuccess={handleLoginSuccess}
// //         message="Save this amazing trip?"
// //       />
// //     </div>
// //   )
// // }

// // export default TripPlanner

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import { useAuth } from '../context/AuthContext'

const TripPlanner = () => {
  const navigate = useNavigate()
  const { tripForm, updateTripForm, generateItinerary, loading } = useTrip()
  const { user, loginAnonymously } = useAuth()
  const [error, setError] = useState('')

  // Get minimum date (today) and maximum date (5 days from now for weather forecast)
  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 5)
  const maxDateString = maxDate.toISOString().split('T')[0]

  const handleInputChange = (field, value) => {
    updateTripForm(field, value)
    if (error) setError('')
  }

  const validateForm = () => {
    if (!tripForm.destination.trim()) {
      setError('Please enter a destination')
      return false
    }
    if (!tripForm.duration || tripForm.duration < 1 || tripForm.duration > 14) {
      setError('Duration must be between 1 and 14 days')
      return false
    }
    if (!tripForm.startDate) {
      setError('Please select a start date')
      return false
    }
    if (!tripForm.budget.trim()) {
      setError('Please enter your budget')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    // If user is not logged in, sign them in anonymously
    if (!user) {
      try {
        await loginAnonymously()
      } catch (error) {
        setError('Unable to create session. Please try again.')
        return
      }
    }

    try {
      await generateItinerary(tripForm)
      navigate('/itinerary')
    } catch (error) {
      setError('Failed to generate itinerary. Please try again.')
      console.error('Generation error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Plan Your Trip</h1>
          <p className="text-gray-600">Tell us about your dream destination and we'll create the perfect itinerary</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Destination */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Where do you want to go? *
              </label>
              <input
                type="text"
                value={tripForm.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                placeholder="e.g., Paris, Tokyo, New York"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Duration and Start Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  How many days? *
                </label>
                <select
                  value={tripForm.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select duration</option>
                  {[...Array(14)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} day{i + 1 > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={tripForm.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={today}
                  max={maxDateString}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Weather forecast available for next 5 days
                </p>
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What's your budget? *
              </label>
              <select
                value={tripForm.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select budget range</option>
                <option value="budget">Budget (Under $50/day)</option>
                <option value="mid-range">Mid-range ($50-150/day)</option>
                <option value="luxury">Luxury ($150+/day)</option>
              </select>
            </div>

            {/* Group Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Who's traveling?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'solo', label: 'Solo' },
                  { value: 'couple', label: 'Couple' },
                  { value: 'family', label: 'Family' },
                  { value: 'friends', label: 'Friends' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('groupType', option.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      tripForm.groupType === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What are you interested in?
              </label>
              <textarea
                value={tripForm.preferences}
                onChange={(e) => handleInputChange('preferences', e.target.value)}
                placeholder="e.g., museums, food tours, nightlife, nature, adventure sports, shopping..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Specific Places */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Any specific places you want to visit?
              </label>
              <textarea
                value={tripForm.specificPlaces}
                onChange={(e) => handleInputChange('specificPlaces', e.target.value)}
                placeholder="e.g., Eiffel Tower, Central Park, specific restaurants, museums, landmarks..."
                rows="2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: List specific attractions, restaurants, or places you don't want to miss
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02]'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Generating Your Perfect Itinerary...
                </div>
              ) : (
                'Generate My Itinerary'
              )}
            </button>

            {/* Info Text */}
            <div className="text-center text-sm text-gray-500">
              <p>🤖 Powered by AI • 🌤️ Real-time weather • ✨ Personalized for you</p>
            </div>
          </form>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default TripPlanner