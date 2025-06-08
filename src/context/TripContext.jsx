import React, { createContext, useContext, useState } from 'react'

const TripContext = createContext()

export const useTrip = () => {
  const context = useContext(TripContext)
  if (!context) {
    throw new Error('useTrip must be used within TripProvider')
  }
  return context
}

export const TripProvider = ({ children }) => {
  const [currentTrip, setCurrentTrip] = useState(null)
  const [savedTrips, setSavedTrips] = useState([])
  const [tripForm, setTripForm] = useState({
    destination: '',
    duration: '',
    preferences: '',
    budget: '',
    groupType: 'solo'
  })

  const updateTripForm = (field, value) => {
    setTripForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveTrip = (trip) => {
    setSavedTrips(prev => [...prev, { ...trip, id: Date.now() }])
  }

  const value = {
    currentTrip,
    setCurrentTrip,
    savedTrips,
    setSavedTrips,
    tripForm,
    setTripForm,
    updateTripForm,
    saveTrip
  }

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  )
}