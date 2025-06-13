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
    groupType: 'solo',
    specificPlaces: ''
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

  // Fix: Updated updateTripForm function to work with (field, value) parameters
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
      groupType: 'solo',
      specificPlaces: ''
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