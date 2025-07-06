// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
// Weather forecast with backend API
const getWeatherForecast = async (destination, startDate, duration) => {
  console.log('🌤️ Fetching weather for:', destination, 'starting', startDate, 'for', duration, 'days');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/weather`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination,
        startDate,
        duration
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Weather API failed: ${response.status} ${response.statusText}`);
    }

    const weatherData = await response.json();
    console.log('✅ Weather data received from backend');
    return weatherData;

  } catch (error) {
    console.error('❌ Weather API error:', error.message);
    throw error; // Let the caller handle the error
  }
};

// Generate itinerary with backend API
const generateItineraryWithGemini = async (formData, weatherData) => {
  console.log('🤖 Generating itinerary with backend API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-itinerary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formData,
        weatherData
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Itinerary API failed: ${response.status} ${response.statusText}`);
    }

    const itineraryData = await response.json();
    console.log('✅ Itinerary generated via backend');
    return itineraryData;

  } catch (error) {
    console.error('❌ Itinerary generation error:', error.message);
    throw error; // Let the caller handle the error
  }
};

// Main function using backend API
const generateCompleteItinerary = async (formData) => {
  console.log('🚀 Starting itinerary generation via backend:', formData);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/complete-itinerary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Complete itinerary API failed: ${response.status} ${response.statusText}`);
    }

    const completeTrip = await response.json();
    console.log('✅ Complete trip generated successfully via backend');
    return completeTrip;

  } catch (error) {
    console.error('❌ Complete itinerary generation failed:', error.message);
    throw error; // Re-throw for caller to handle
  }
};

//chat API Service
const sendChatMessage = async (message, tripId, userId, tripContext, chatHistory) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        tripId,
        userId,
        tripContext,
        chatHistory
      })
    });

    // Check if response is ok first
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (jsonError) {
        // If we can't parse JSON, use status text
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      throw new Error('Invalid response format from server');
    }

    return data;
    
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
};

const exportICSFile = async (tripData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calendar/download-ics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tripData })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate ICS file');
    }

    const blob = await response.blob();
    return blob;

  } catch (error) {
    console.error('❌ ICS export failed:', error.message);
    throw error;
  }
};


// Health check function to verify backend connectivity
const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }

    const healthData = await response.json();
    console.log('✅ Backend is healthy:', healthData);
    return healthData;

  } catch (error) {
    console.error('❌ Backend health check error:', error.message);
    throw error; // Let caller handle the error
  }
};
export {
  getWeatherForecast,
  generateItineraryWithGemini,
  generateCompleteItinerary,
  checkBackendHealth,
  sendChatMessage,
  exportICSFile
};

