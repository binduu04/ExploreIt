// pages/Itinerary.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, DollarSign, Star, Clock, Lightbulb, ArrowLeft, RotateCcw, Download, Bookmark } from 'lucide-react';
// import { generateMockItinerary } from '../utils/mockData';

const Itinerary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Get trip data from navigation state
    const tripData = location.state?.tripData;
    
    if (!tripData) {
      navigate('/plan');
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      const generatedItinerary = generateMockItinerary(tripData);
      setItinerary(generatedItinerary);
      setLoading(false);
    }, 2000);
  }, [location.state, navigate]);

  const handleRegenerate = () => {
    setLoading(true);
    setTimeout(() => {
      const newItinerary = generateMockItinerary(location.state.tripData);
      setItinerary(newItinerary);
      setLoading(false);
    }, 1500);
  };

  const handleSaveTrip = () => {
    setSaving(true);
    // Simulate save to localStorage for now
    setTimeout(() => {
      const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
      savedTrips.push(itinerary);
      localStorage.setItem('savedTrips', JSON.stringify(savedTrips));
      setSaving(false);
      alert('Trip saved successfully!');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">✨ Crafting Your Perfect Trip</h2>
          <p className="text-gray-600">Finding the best places and creating your personalized itinerary...</p>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
          <button 
            onClick={() => navigate('/plan')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/plan')}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Planner
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  🎯 Your {itinerary.destination} Adventure
                </h1>
                <p className="text-gray-600">
                  {itinerary.duration} day{itinerary.duration > 1 ? 's' : ''} of amazing experiences
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRegenerate}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Regenerate
                </button>
                <button
                  onClick={handleSaveTrip}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Trip'}
                </button>
              </div>
            </div>

            {/* Trip Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm text-gray-600">{itinerary.summary.totalDays} Days</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm text-gray-600">{itinerary.summary.totalActivities} Activities</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm text-gray-600">{itinerary.summary.estimatedBudget}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm text-gray-600 capitalize">{itinerary.groupSize}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Day Cards */}
        <div className="space-y-6">
          {itinerary.days.map((day, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              
              {/* Day Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Day {day.dayNumber}</h2>
                    <p className="text-purple-100">{day.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl mb-1">{day.weather.icon}</div>
                    <div className="text-sm">
                      {day.weather.temp}°C • {day.weather.condition}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activities */}
              <div className="p-6">
                <div className="grid gap-6">
                  
                  {/* Morning */}
                  <div className="border-l-4 border-yellow-400 pl-4">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                      <h3 className="font-semibold text-gray-800">Morning</h3>
                      <span className="text-sm text-gray-500 ml-2">{day.activities.morning.time}</span>
                    </div>
                    <div className="ml-6">
                      <div className="flex items-center mb-2">
                        <h4 className="font-medium text-gray-800 mr-3">{day.activities.morning.activity.name}</h4>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                          {day.activities.morning.activity.rating}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 ml-3">
                          <Clock className="w-4 h-4 mr-1" />
                          {day.activities.morning.activity.duration}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{day.activities.morning.description}</p>
                    </div>
                  </div>

                  {/* Afternoon */}
                  <div className="border-l-4 border-orange-400 pl-4">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-orange-400 rounded-full mr-3"></div>
                      <h3 className="font-semibold text-gray-800">Afternoon</h3>
                      <span className="text-sm text-gray-500 ml-2">{day.activities.afternoon.time}</span>
                    </div>
                    <div className="ml-6">
                      <div className="flex items-center mb-2">
                        <h4 className="font-medium text-gray-800 mr-3">{day.activities.afternoon.activity.name}</h4>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                          {day.activities.afternoon.activity.rating}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 ml-3">
                          <Clock className="w-4 h-4 mr-1" />
                          {day.activities.afternoon.activity.duration}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{day.activities.afternoon.description}</p>
                    </div>
                  </div>

                  {/* Evening */}
                  <div className="border-l-4 border-purple-400 pl-4">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
                      <h3 className="font-semibold text-gray-800">Evening</h3>
                      <span className="text-sm text-gray-500 ml-2">{day.activities.evening.time}</span>
                    </div>
                    <div className="ml-6">
                      <div className="flex items-center mb-2">
                        <h4 className="font-medium text-gray-800 mr-3">{day.activities.evening.activity.name}</h4>
                        <div className="flex items-center text-sm text-gray-500">
                          <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                          {day.activities.evening.activity.rating}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 ml-3">
                          <Clock className="w-4 h-4 mr-1" />
                          {day.activities.evening.activity.duration}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{day.activities.evening.description}</p>
                    </div>
                  </div>
                </div>

                {/* Day Tips */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-medium text-blue-800">Pro Tips for Day {day.dayNumber}</h4>
                  </div>
                  <ul className="space-y-1">
                    {day.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-sm text-blue-700">• {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Tips */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-800">Overall Trip Tips</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {itinerary.overallTips.map((tip, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-gray-600 text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handleRegenerate}
            className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Generate New Itinerary
          </button>
          <button
            onClick={handleSaveTrip}
            disabled={saving}
            className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Bookmark className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save This Trip'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;