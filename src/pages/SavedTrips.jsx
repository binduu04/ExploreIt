// pages/SavedTrips.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Trash2, Eye, Users, DollarSign } from 'lucide-react';

const SavedTrips = () => {
  const navigate = useNavigate();
  const [savedTrips, setSavedTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load saved trips from localStorage
    const loadSavedTrips = () => {
      try {
        const trips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
        setSavedTrips(trips);
      } catch (error) {
        console.error('Error loading saved trips:', error);
        setSavedTrips([]);
      } finally {
        setLoading(false);
      }
    };

    loadSavedTrips();
  }, []);

  const deleteTrip = (tripId) => {
    const updatedTrips = savedTrips.filter(trip => trip.id !== tripId);
    setSavedTrips(updatedTrips);
    localStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
  };

  const viewTrip = (trip) => {
    navigate('/itinerary', { 
      state: { 
        tripData: trip,
        isViewingExisting: true
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your saved trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              📚 Your Saved Trips
            </h1>
            <p className="text-xl text-gray-600">
              Revisit your amazing travel plans
            </p>
          </div>
        </div>

        {/* Trips Grid */}
        {savedTrips.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🗺️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No saved trips yet</h2>
            <p className="text-gray-600 mb-8">Start planning your first trip to see it here!</p>
            <button
              onClick={() => navigate('/planner')}
              className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Plan a New Trip
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                
                {/* Trip Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                  <h3 className="text-xl font-bold mb-2">{trip.destination}</h3>
                  <p className="text-purple-100 text-sm">
                    Created {new Date(trip.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Trip Details */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {trip.duration} day{trip.duration > 1 ? 's' : ''}
                    </div>
                    
                    {trip.groupSize && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="capitalize">{trip.groupSize}</span>
                      </div>
                    )}
                    
                    {trip.budget && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span className="capitalize">{trip.budget}</span>
                      </div>
                    )}
                  </div>

                  {/* Preferences Preview */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      <span className="font-medium">Interests:</span> {trip.preferences}
                    </p>
                  </div>

                  {/* Activities Count */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <span>{trip.summary?.totalActivities || (trip.duration * 3)} activities planned</span>
                    <span>{trip.summary?.estimatedBudget || 'Budget varies'}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => viewTrip(trip)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Trip
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this trip?')) {
                          deleteTrip(trip.id);
                        }
                      }}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Trip Button */}
        {savedTrips.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/planner')}
              className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              + Plan Another Trip
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedTrips;