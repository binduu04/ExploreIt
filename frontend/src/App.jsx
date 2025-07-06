import { useState } from 'react'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TripProvider } from './context/TripContext'
import Landing from './pages/Landing'
import TripPlanner from './pages/TripPlanner'
import Itinerary from './pages/Itinerary'
import SavedTrips from './pages/SavedTrips'
import ViewTrip from './pages/ViewTrip'
import AuthCallback from './pages/AuthCallback'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/plan" element={<TripPlanner />} />
              <Route path="/itinerary" element={<Itinerary />} />
              <Route path="/my-trips" element={<SavedTrips />} />
              <Route path="/viewtrip" element={<ViewTrip />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </div>
        </Router>
      </TripProvider>
    </AuthProvider>
  )
}

export default App
