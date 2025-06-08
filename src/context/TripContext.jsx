// import React, { createContext, useContext, useState } from 'react'

// const TripContext = createContext()

// export const useTrip = () => {
//   const context = useContext(TripContext)
//   if (!context) {
//     throw new Error('useTrip must be used within TripProvider')
//   }
//   return context
// }

// export const TripProvider = ({ children }) => {
//   const [currentTrip, setCurrentTrip] = useState(null)
//   const [savedTrips, setSavedTrips] = useState([])
//   const [tripForm, setTripForm] = useState({
//     destination: '',
//     duration: '',
//     preferences: '',
//     budget: '',
//     groupType: 'solo'
//   })

//   const updateTripForm = (field, value) => {
//     setTripForm(prev => ({
//       ...prev,
//       [field]: value
//     }))
//   }

//   const saveTrip = (trip) => {
//     setSavedTrips(prev => [...prev, { ...trip, id: Date.now() }])
//   }

//   const value = {
//     currentTrip,
//     setCurrentTrip,
//     savedTrips,
//     setSavedTrips,
//     tripForm,
//     setTripForm,
//     updateTripForm,
//     saveTrip
//   }

//   return (
//     <TripContext.Provider value={value}>
//       {children}
//     </TripContext.Provider>
//   )
// }

import React, { createContext, useContext, useState, useEffect } from 'react'
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from './AuthContext'

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
  
  const [tripForm, setTripForm] = useState({
    destination: '',
    duration: '',
    preferences: '',
    budget: '',
    groupType: 'solo'
  })

  // Generate mock itinerary (replace with real API later)
  const generateItinerary = async (formData) => {
    setLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockItinerary = {
      id: Date.now(),
      destination: formData.destination,
      duration: formData.duration,
      preferences: formData.preferences,
      budget: formData.budget,
      groupType: formData.groupType,
      generatedOn: new Date().toISOString(),
      weather: {
        temperature: "24°C",
        condition: "Partly Cloudy",
        humidity: "65%"
      },
      itinerary: Array.from({ length: formData.duration }, (_, index) => ({
        day: index + 1,
        morning: [
          {
            time: "9:00 AM",
            activity: `Morning Activity ${index + 1}`,
            location: `Popular Spot in ${formData.destination}`,
            duration: "2 hours",
            tip: "Start early to avoid crowds"
          }
        ],
        afternoon: [
          {
            time: "2:00 PM",
            activity: `Afternoon Experience ${index + 1}`,
            location: `Cultural Site in ${formData.destination}`,
            duration: "3 hours",
            tip: "Perfect for photos"
          }
        ],
        evening: [
          {
            time: "7:00 PM",
            activity: `Evening Activity ${index + 1}`,
            location: `Local Restaurant in ${formData.destination}`,
            duration: "2 hours",
            tip: "Try the local specialty"
          }
        ]
      }))
    }
    
    setCurrentTrip(mockItinerary)
    setLoading(false)
    return mockItinerary
  }

  // Save trip to Firebase
  const saveTrip = async (trip) => {
    if (!user) return false
    
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
      preferences: '',
      budget: '',
      groupType: 'solo'
    })
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
    loading
  }

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  )
}