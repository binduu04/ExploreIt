// // // import React, { createContext, useContext, useState } from 'react'

// // // const TripContext = createContext()

// // // export const useTrip = () => {
// // //   const context = useContext(TripContext)
// // //   if (!context) {
// // //     throw new Error('useTrip must be used within TripProvider')
// // //   }
// // //   return context
// // // }

// // // export const TripProvider = ({ children }) => {
// // //   const [currentTrip, setCurrentTrip] = useState(null)
// // //   const [savedTrips, setSavedTrips] = useState([])
// // //   const [tripForm, setTripForm] = useState({
// // //     destination: '',
// // //     duration: '',
// // //     preferences: '',
// // //     budget: '',
// // //     groupType: 'solo'
// // //   })

// // //   const updateTripForm = (field, value) => {
// // //     setTripForm(prev => ({
// // //       ...prev,
// // //       [field]: value
// // //     }))
// // //   }

// // //   const saveTrip = (trip) => {
// // //     setSavedTrips(prev => [...prev, { ...trip, id: Date.now() }])
// // //   }

// // //   const value = {
// // //     currentTrip,
// // //     setCurrentTrip,
// // //     savedTrips,
// // //     setSavedTrips,
// // //     tripForm,
// // //     setTripForm,
// // //     updateTripForm,
// // //     saveTrip
// // //   }

// // //   return (
// // //     <TripContext.Provider value={value}>
// // //       {children}
// // //     </TripContext.Provider>
// // //   )
// // // }

// import React, { createContext, useContext, useState, useEffect } from 'react'
// import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore'
// import { db } from '../services/firebase'
// import { useAuth } from './AuthContext'

// const TripContext = createContext()

// export const useTrip = () => {
//   const context = useContext(TripContext)
//   if (!context) {
//     throw new Error('useTrip must be used within TripProvider')
//   }
//   return context
// }

// export const TripProvider = ({ children }) => {
//   const { user } = useAuth()
//   const [currentTrip, setCurrentTrip] = useState(null)
//   const [savedTrips, setSavedTrips] = useState([])
//   const [loading, setLoading] = useState(false)
  
//   const [tripForm, setTripForm] = useState({
//     destination: '',
//     duration: '',
//     preferences: '',
//     budget: '',
//     groupType: 'solo'
//   })

//   // Generate mock itinerary (replace with real API later)
//   const generateItinerary = async (formData) => {
//     setLoading(true)
    
//     // Simulate API call delay
//     await new Promise(resolve => setTimeout(resolve, 2000))
    
//     const mockItinerary = {
//       id: Date.now(),
//       destination: formData.destination,
//       duration: formData.duration,
//       preferences: formData.preferences,
//       budget: formData.budget,
//       groupType: formData.groupType,
//       generatedOn: new Date().toISOString(),
//       weather: {
//         temperature: "24°C",
//         condition: "Partly Cloudy",
//         humidity: "65%"
//       },
//       itinerary: Array.from({ length: formData.duration }, (_, index) => ({
//         day: index + 1,
//         morning: [
//           {
//             time: "9:00 AM",
//             activity: `Morning Activity ${index + 1}`,
//             location: `Popular Spot in ${formData.destination}`,
//             duration: "2 hours",
//             tip: "Start early to avoid crowds"
//           }
//         ],
//         afternoon: [
//           {
//             time: "2:00 PM",
//             activity: `Afternoon Experience ${index + 1}`,
//             location: `Cultural Site in ${formData.destination}`,
//             duration: "3 hours",
//             tip: "Perfect for photos"
//           }
//         ],
//         evening: [
//           {
//             time: "7:00 PM",
//             activity: `Evening Activity ${index + 1}`,
//             location: `Local Restaurant in ${formData.destination}`,
//             duration: "2 hours",
//             tip: "Try the local specialty"
//           }
//         ]
//       }))
//     }
    
//     setCurrentTrip(mockItinerary)
//     setLoading(false)
//     return mockItinerary
//   }

//   // Save trip to Firebase
//   const saveTrip = async (trip) => {
//     if (!user) return false
    
//     try {
//       const tripData = {
//         ...trip,
//         userId: user.uid,
//         savedOn: new Date().toISOString()
//       }
      
//       const docRef = await addDoc(collection(db, 'trips'), tripData)
      
//       const savedTrip = { ...tripData, firestoreId: docRef.id }
//       setSavedTrips(prev => [...prev, savedTrip])
      
//       return true
//     } catch (error) {
//       console.error('Error saving trip:', error)
//       return false
//     }
//   }

//   // Load user's saved trips
//   const loadSavedTrips = async () => {
//     if (!user) return
    
//     try {
//       const q = query(collection(db, 'trips'), where('userId', '==', user.uid))
//       const querySnapshot = await getDocs(q)
      
//       const trips = []
//       querySnapshot.forEach((doc) => {
//         trips.push({ ...doc.data(), firestoreId: doc.id })
//       })
      
//       setSavedTrips(trips)
//     } catch (error) {
//       console.error('Error loading trips:', error)
//     }
//   }

//   // Delete trip
//   const deleteTrip = async (tripId) => {
//     try {
//       await deleteDoc(doc(db, 'trips', tripId))
//       setSavedTrips(prev => prev.filter(trip => trip.firestoreId !== tripId))
//       return true
//     } catch (error) {
//       console.error('Error deleting trip:', error)
//       return false
//     }
//   }

//   // Load trips when user changes
//   useEffect(() => {
//     if (user) {
//       loadSavedTrips()
//     } else {
//       setSavedTrips([])
//     }
//   }, [user])

//   const updateTripForm = (field, value) => {
//     setTripForm(prev => ({
//       ...prev,
//       [field]: value
//     }))
//   }

//   const clearTripForm = () => {
//     setTripForm({
//       destination: '',
//       duration: '',
//       preferences: '',
//       budget: '',
//       groupType: 'solo'
//     })
//   }

//   const value = {
//     currentTrip,
//     setCurrentTrip,
//     savedTrips,
//     setSavedTrips,
//     tripForm,
//     setTripForm,
//     updateTripForm,
//     clearTripForm,
//     saveTrip,
//     deleteTrip,
//     generateItinerary,
//     loading
//   }

//   return (
//     <TripContext.Provider value={value}>
//       {children}
//     </TripContext.Provider>
//   )
// }


// // import React, { createContext, useContext, useState, useEffect } from 'react'
// // import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore'
// // import { db } from '../services/firebase'
// // import { useAuth } from './AuthContext'
// // import { generateEnhancedItinerary } from '../services/itineraryService'

// // const TripContext = createContext()

// // export const useTrip = () => {
// //   const context = useContext(TripContext)
// //   if (!context) {
// //     throw new Error('useTrip must be used within TripProvider')
// //   }
// //   return context
// // }

// // export const TripProvider = ({ children }) => {
// //   const { user } = useAuth()
// //   const [currentTrip, setCurrentTrip] = useState(null)
// //   const [savedTrips, setSavedTrips] = useState([])
// //   const [loading, setLoading] = useState(false)
// //   const [error, setError] = useState(null)
  
// //   const [tripForm, setTripForm] = useState({
// //     destination: '',
// //     duration: '',
// //     preferences: '',
// //     budget: '',
// //     groupType: 'solo',
// //     startDate: new Date().toISOString().split('T')[0], // Today's date as default
// //     specificPlaces: ''
// //   })

// //   // Generate AI-powered itinerary with weather integration
// //   const generateItinerary = async (formData) => {
// //     setLoading(true)
// //     setError(null)
    
// //     try {
// //       console.log('🚀 Generating enhanced itinerary with:', formData)
      
// //       // Validate required fields
// //       if (!formData.destination || !formData.duration || !formData.preferences) {
// //         throw new Error('Please fill in all required fields')
// //       }

// //       // Ensure duration is a number and within limits
// //       const duration = parseInt(formData.duration)
// //       if (isNaN(duration) || duration < 1 || duration > 14) {
// //         throw new Error('Trip duration must be between 1 and 14 days')
// //       }

// //       // Prepare form data for the service
// //       const enhancedFormData = {
// //         ...formData,
// //         duration,
// //         startDate: formData.startDate || new Date().toISOString().split('T')[0]
// //       }

// //       // Generate itinerary using the enhanced service
// //       const result = await generateEnhancedItinerary(enhancedFormData)
      
// //       if (!result.success && result.error) {
// //         console.warn('⚠️ Itinerary generation had issues:', result.error)
// //         // Still proceed with fallback itinerary
// //       }

// //       // Structure the trip data
// //       const tripData = {
// //         id: Date.now(),
// //         destination: formData.destination,
// //         duration: duration,
// //         preferences: formData.preferences,
// //         budget: formData.budget,
// //         groupType: formData.groupType,
// //         startDate: formData.startDate,
// //         specificPlaces: formData.specificPlaces,
// //         generatedOn: new Date().toISOString(),
// //         weatherData: result.weatherData,
// //         itinerary: result.itinerary,
// //         metadata: result.metadata,
// //         success: result.success
// //       }
      
// //       setCurrentTrip(tripData)
// //       console.log('✅ Enhanced itinerary generated successfully')
      
// //       return tripData
      
// //     } catch (error) {
// //       console.error('❌ Error generating itinerary:', error)
// //       setError(error.message)
      
// //       // Return basic error state
// //       const fallbackTrip = {
// //         id: Date.now(),
// //         destination: formData.destination,
// //         duration: parseInt(formData.duration) || 1,
// //         preferences: formData.preferences,
// //         budget: formData.budget,
// //         groupType: formData.groupType,
// //         generatedOn: new Date().toISOString(),
// //         error: error.message,
// //         itinerary: []
// //       }
      
// //       setCurrentTrip(fallbackTrip)
// //       return fallbackTrip
      
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   // Save trip to Firebase
// //   const saveTrip = async (trip) => {
// //     if (!user) {
// //       setError('Please log in to save trips')
// //       return false
// //     }
    
// //     try {
// //       setLoading(true)
      
// //       const tripData = {
// //         ...trip,
// //         userId: user.uid,
// //         savedOn: new Date().toISOString(),
// //         // Don't save the full weather data to reduce storage size
// //         weatherSummary: trip.weatherData ? {
// //           accurateDays: trip.weatherData.dataQuality?.accurateDays || 0,
// //           estimatedDays: trip.weatherData.dataQuality?.estimatedDays || 0,
// //           generated: true
// //         } : null
// //       }
      
// //       // Remove large weather data before saving
// //       const { weatherData, ...saveData } = tripData
      
// //       const docRef = await addDoc(collection(db, 'trips'), saveData)
      
// //       const savedTrip = { ...saveData, firestoreId: docRef.id }
// //       setSavedTrips(prev => [...prev, savedTrip])
      
// //       console.log('✅ Trip saved successfully')
// //       return true
      
// //     } catch (error) {
// //       console.error('❌ Error saving trip:', error)
// //       setError('Failed to save trip. Please try again.')
// //       return false
      
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   // Load user's saved trips
// //   const loadSavedTrips = async () => {
// //     if (!user) return
    
// //     try {
// //       setLoading(true)
      
// //       const q = query(collection(db, 'trips'), where('userId', '==', user.uid))
// //       const querySnapshot = await getDocs(q)
      
// //       const trips = []
// //       querySnapshot.forEach((doc) => {
// //         trips.push({ ...doc.data(), firestoreId: doc.id })
// //       })
      
// //       // Sort by most recent first
// //       trips.sort((a, b) => new Date(b.savedOn) - new Date(a.savedOn))
      
// //       setSavedTrips(trips)
// //       console.log(`📚 Loaded ${trips.length} saved trips`)
      
// //     } catch (error) {
// //       console.error('❌ Error loading trips:', error)
// //       setError('Failed to load saved trips')
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   // Delete trip
// //   const deleteTrip = async (tripId) => {
// //     if (!user) return false
    
// //     try {
// //       setLoading(true)
      
// //       await deleteDoc(doc(db, 'trips', tripId))
// //       setSavedTrips(prev => prev.filter(trip => trip.firestoreId !== tripId))
      
// //       console.log('🗑️ Trip deleted successfully')
// //       return true
      
// //     } catch (error) {
// //       console.error('❌ Error deleting trip:', error)
// //       setError('Failed to delete trip')
// //       return false
      
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   // Regenerate itinerary for existing trip
// //   const regenerateItinerary = async (existingTrip) => {
// //     const formData = {
// //       destination: existingTrip.destination,
// //       duration: existingTrip.duration,
// //       preferences: existingTrip.preferences,
// //       budget: existingTrip.budget,
// //       groupType: existingTrip.groupType,
// //       startDate: existingTrip.startDate,
// //       specificPlaces: existingTrip.specificPlaces
// //     }
    
// //     return await generateItinerary(formData)
// //   }

// //   // Load trips when user changes
// //   useEffect(() => {
// //     if (user) {
// //       loadSavedTrips()
// //     } else {
// //       setSavedTrips([])
// //       setCurrentTrip(null)
// //     }
// //   }, [user])

// //   // Helper functions
// //   const updateTripForm = (field, value) => {
// //     setTripForm(prev => ({
// //       ...prev,
// //       [field]: value
// //     }))
    
// //     // Clear error when user updates form
// //     if (error) setError(null)
// //   }

// //   const clearTripForm = () => {
// //     setTripForm({
// //       destination: '',
// //       duration: '',
// //       preferences: '',
// //       budget: '',
// //       groupType: 'solo',
// //       startDate: new Date().toISOString().split('T')[0],
// //       specificPlaces: ''
// //     })
// //     setError(null)
// //   }

// //   const clearError = () => setError(null)

// //   // Get trip statistics
// //   const getTripStats = () => {
// //     return {
// //       totalSavedTrips: savedTrips.length,
// //       totalDestinations: new Set(savedTrips.map(trip => trip.destination)).size,
// //       totalDays: savedTrips.reduce((sum, trip) => sum + (trip.duration || 0), 0),
// //       recentTrips: savedTrips.slice(0, 3)
// //     }
// //   }

// //   const value = {
// //     // Trip data
// //     currentTrip,
// //     setCurrentTrip,
// //     savedTrips,
// //     setSavedTrips,
    
// //     // Form management
// //     tripForm,
// //     setTripForm,
// //     updateTripForm,
// //     clearTripForm,
    
// //     // Trip operations
// //     generateItinerary,
// //     regenerateItinerary,
// //     saveTrip,
// //     deleteTrip,
// //     loadSavedTrips,
    
// //     // State management
// //     loading,
// //     error,
// //     clearError,
    
// //     // Utilities
// //     getTripStats
// //   }

// //   return (
// //     <TripContext.Provider value={value}>
// //       {children}
// //     </TripContext.Provider>
// //   )
// // }


import React, { createContext, useContext, useState, useEffect } from 'react'
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from './AuthContext'
import { generateCompleteItinerary } from '../services/apiService.js'

const TripContext = createContext()

export const useTrip = () => {
  const context = useContext(TripContext)
  if (!context) {
    throw new Error('useTrip must be used within TripProvider')
  }
  return context
}

export const TripProvider = ({ children }) => {
  const { user } = useAuth()
  const [currentTrip, setCurrentTrip] = useState(null)
  const [savedTrips, setSavedTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [tripForm, setTripForm] = useState({
    destination: '',
    duration: '',
    startDate: '',
    preferences: '',
    budget: '',
    groupType: 'solo'
  })

  // Generate real itinerary using API service
  const generateItinerary = async (formData) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🚀 Generating itinerary with form data:', formData)
      
      // Validate form data
      if (!formData.destination || !formData.duration || !formData.startDate) {
        throw new Error('Destination, duration, and start date are required')
      }

      // Convert duration to number
      const processedFormData = {
        ...formData,
        duration: parseInt(formData.duration),
        startDate: formData.startDate || new Date().toISOString().split('T')[0]
      }

      // Call the actual API service
      const itineraryData = await generateCompleteItinerary(processedFormData)
      
      console.log('✅ Itinerary generated successfully:', itineraryData)
      setCurrentTrip(itineraryData)
      setLoading(false)
      return itineraryData
      
    } catch (error) {
      console.error('❌ Error generating itinerary:', error)
      setError(error.message || 'Failed to generate itinerary')
      setLoading(false)
      throw error
    }
  }

  // Save trip to Firebase
  const saveTrip = async (trip) => {
    if (!user) {
      setError('You must be logged in to save trips')
      return false
    }
    
    try {
      const tripData = {
        ...trip,
        userId: user.uid,
        savedOn: new Date().toISOString()
      }
      
      const docRef = await addDoc(collection(db, 'trips'), tripData)
      
      const savedTrip = { ...tripData, firestoreId: docRef.id }
      setSavedTrips(prev => [...prev, savedTrip])
      
      return true
    } catch (error) {
      console.error('Error saving trip:', error)
      setError('Failed to save trip')
      return false
    }
  }

  // Load user's saved trips
  const loadSavedTrips = async () => {
    if (!user) return
    
    try {
      const q = query(collection(db, 'trips'), where('userId', '==', user.uid))
      const querySnapshot = await getDocs(q)
      
      const trips = []
      querySnapshot.forEach((doc) => {
        trips.push({ ...doc.data(), firestoreId: doc.id })
      })
      
      setSavedTrips(trips)
    } catch (error) {
      console.error('Error loading trips:', error)
      setError('Failed to load saved trips')
    }
  }

  // Delete trip
  const deleteTrip = async (tripId) => {
    try {
      await deleteDoc(doc(db, 'trips', tripId))
      setSavedTrips(prev => prev.filter(trip => trip.firestoreId !== tripId))
      return true
    } catch (error) {
      console.error('Error deleting trip:', error)
      setError('Failed to delete trip')
      return false
    }
  }

  // Load trips when user changes
  useEffect(() => {
    if (user) {
      loadSavedTrips()
    } else {
      setSavedTrips([])
    }
  }, [user])

  const updateTripForm = (field, value) => {
    setTripForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const clearTripForm = () => {
    setTripForm({
      destination: '',
      duration: '',
      startDate: '',
      preferences: '',
      budget: '',
      groupType: 'solo'
    })
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    currentTrip,
    setCurrentTrip,
    savedTrips,
    setSavedTrips,
    tripForm,
    setTripForm,
    updateTripForm,
    clearTripForm,
    saveTrip,
    deleteTrip,
    generateItinerary,
    loading,
    error,
    clearError
  }

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  )
}