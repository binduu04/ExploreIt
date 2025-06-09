// services/apiTestService.js

// Get weather forecast from OpenWeather API
const getWeatherForecast = async (destination, startDate) => {
  try {
    const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
    console.log(WEATHER_API_KEY)
    
    console.log('🌤️ Fetching weather for:', destination, 'on', startDate)
    
    // First get coordinates for the destination
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${WEATHER_API_KEY}`
    )
    const geoData = await geoResponse.json()
    
    console.log('📍 Geo data:', geoData)
    
    if (!geoData.length) {
      throw new Error('Location not found')
    }
    
    const { lat, lon } = geoData[0]
    
    // Get weather forecast
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    )
    const weatherData = await weatherResponse.json()
    
    console.log('🌦️ Raw weather data:', weatherData)
    
    // Process weather data for the trip dates
    const startDateObj = new Date(startDate)
    const forecastDays = weatherData.list.filter(item => {
      const itemDate = new Date(item.dt * 1000)
      return itemDate >= startDateObj
    }).slice(0, 8) // Get up to 8 forecasts (roughly 2 days)
    
    const processedWeather = {
      location: geoData[0].name,
      country: geoData[0].country,
      forecast: forecastDays.map(item => ({
        date: new Date(item.dt * 1000).toLocaleDateString(),
        temperature: Math.round(item.main.temp),
        description: item.weather[0].description,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed
      }))
    }
    
    console.log('✅ Processed weather:', processedWeather)
    return processedWeather
    
  } catch (error) {
    console.error('❌ Weather API error:', error)
    // Return fallback weather data
    return {
      location: destination,
      country: 'Unknown',
      forecast: [{
        date: new Date().toLocaleDateString(),
        temperature: 25,
        description: 'partly cloudy',
        humidity: 60,
        windSpeed: 5
      }]
    }
  }
}

// Create prompt for Gemini API
const createItineraryPrompt = (formData, weatherData) => {
  return `Create a detailed ${formData.duration}-day travel itinerary for ${formData.destination}.

Trip Details:
- Duration: ${formData.duration} days
- Start Date: ${formData.startDate}
- Budget: ${formData.budget}
- Group Type: ${formData.groupType}
- Preferences: ${formData.preferences}
- Specific Places to Visit: ${formData.specificPlaces || 'None specified'}

Weather Forecast:
${weatherData.forecast.map(day => 
  `${day.date}: ${day.temperature}°C, ${day.description}`
).join('\n')}

Please provide a structured itinerary with the following format for each day:
DAY X:
MORNING (9:00 AM - 12:00 PM):
- Activity: [Activity name]
- Location: [Specific location]
- Duration: [Time needed]
- Tip: [Helpful tip]

AFTERNOON (1:00 PM - 5:00 PM):
- Activity: [Activity name]
- Location: [Specific location]
- Duration: [Time needed]
- Tip: [Helpful tip]

EVENING (6:00 PM - 9:00 PM):
- Activity: [Activity name]
- Location: [Specific location]
- Duration: [Time needed]
- Tip: [Helpful tip]

Consider the weather conditions, budget constraints, group type, and any specific places mentioned. Include practical tips and realistic timing.`
}

// Generate itinerary using Gemini API
const generateItineraryWithGemini = async (formData, weatherData) => {
  try {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
    console.log(GEMINI_API_KEY)
    
    console.log('🤖 Generating itinerary with Gemini...')
    
    const prompt = createItineraryPrompt(formData, weatherData)
    console.log('📝 Prompt:', prompt)
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    )
    
    const data = await response.json()
    console.log('🎯 Gemini raw response:', data)
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('Invalid response from Gemini API')
    }
    
    const generatedText = data.candidates[0].content.parts[0].text
    console.log('📄 Generated text:', generatedText)
    
    // Parse the response into structured itinerary
    const parsedItinerary = parseGeminiResponse(generatedText, formData.duration)
    console.log('✅ Parsed itinerary:', parsedItinerary)
    
    return parsedItinerary
  } catch (error) {
    console.error('❌ Gemini API error:', error)
    // Return fallback itinerary
    return generateFallbackItinerary(formData)
  }
}

// Parse Gemini response into structured format
const parseGeminiResponse = (text, duration) => {
  const days = []
  const dayPattern = /DAY (\d+):(.*?)(?=DAY \d+:|$)/gs
  let match
  
  while ((match = dayPattern.exec(text)) !== null) {
    const dayNumber = parseInt(match[1])
    const dayContent = match[2]
    
    const day = {
      day: dayNumber,
      morning: parseTimeSlot(dayContent, 'MORNING'),
      afternoon: parseTimeSlot(dayContent, 'AFTERNOON'),
      evening: parseTimeSlot(dayContent, 'EVENING')
    }
    
    days.push(day)
  }
  
  // Ensure we have the right number of days
  while (days.length < duration) {
    days.push(generateFallbackDay(days.length + 1))
  }
  
  return days.slice(0, duration)
}

// Parse time slot from Gemini response
const parseTimeSlot = (dayContent, timeSlot) => {
  const pattern = new RegExp(`${timeSlot}[^:]*:(.*?)(?=(?:MORNING|AFTERNOON|EVENING)|$)`, 's')
  const match = dayContent.match(pattern)
  
  if (!match) return [generateFallbackActivity(timeSlot)]
  
  const content = match[1]
  const activities = []
  
  const lines = content.split('\n').filter(line => line.trim())
  let currentActivity = {}
  
  lines.forEach(line => {
    line = line.trim()
    if (line.startsWith('- Activity:')) {
      if (currentActivity.activity) activities.push({...currentActivity})
      currentActivity = { activity: line.replace('- Activity:', '').trim() }
    } else if (line.startsWith('- Location:')) {
      currentActivity.location = line.replace('- Location:', '').trim()
    } else if (line.startsWith('- Duration:')) {
      currentActivity.duration = line.replace('- Duration:', '').trim()
    } else if (line.startsWith('- Tip:')) {
      currentActivity.tip = line.replace('- Tip:', '').trim()
    }
  })
  
  if (currentActivity.activity) activities.push(currentActivity)
  
  return activities.length > 0 ? activities : [generateFallbackActivity(timeSlot)]
}

// Generate fallback activity
const generateFallbackActivity = (timeSlot) => {
  const activities = {
    MORNING: { activity: 'Morning Exploration', time: '9:00 AM' },
    AFTERNOON: { activity: 'Afternoon Adventure', time: '2:00 PM' },
    EVENING: { activity: 'Evening Dining', time: '7:00 PM' }
  }
  
  return {
    time: activities[timeSlot].time,
    ...activities[timeSlot],
    location: 'Local Area',
    duration: '2-3 hours',
    tip: 'Enjoy the local atmosphere'
  }
}

// Generate fallback day
const generateFallbackDay = (dayNumber) => {
  return {
    day: dayNumber,
    morning: [generateFallbackActivity('MORNING')],
    afternoon: [generateFallbackActivity('AFTERNOON')],
    evening: [generateFallbackActivity('EVENING')]
  }
}

// Generate fallback itinerary if APIs fail
const generateFallbackItinerary = (formData) => {
  return Array.from({ length: formData.duration }, (_, index) => 
    generateFallbackDay(index + 1)
  )
}

// Main test function - combines both APIs
const testAPIIntegration = async (testData = {}) => {
  // Default test data
  const defaultTestData = {
    destination: 'Paris, France',
    duration: 3,
    startDate: '2025-07-15',
    preferences: 'Museums, cafes, romantic spots',
    budget: 'Medium',
    groupType: 'couple',
    specificPlaces: 'Eiffel Tower, Louvre Museum'
  }
  
  const formData = { ...defaultTestData, ...testData }
  
  console.log('🚀 Starting API integration test with data:', formData)
  
  try {
    // Step 1: Get weather data
    console.log('\n=== STEP 1: WEATHER API ===')
    const weatherData = await getWeatherForecast(formData.destination, formData.startDate)
    
    // Step 2: Generate itinerary with weather data
    console.log('\n=== STEP 2: GEMINI API ===')
    const itineraryData = await generateItineraryWithGemini(formData, weatherData)
    
    // Step 3: Combine results
    const completeResult = {
      id: Date.now(),
      ...formData,
      generatedOn: new Date().toISOString(),
      weather: weatherData,
      itinerary: itineraryData
    }
    
    console.log('\n=== FINAL RESULT ===')
    console.log('Complete trip data:', completeResult)
    
    return completeResult
    
  } catch (error) {
    console.error('❌ API Integration test failed:', error)
    throw error
  }
}

// Quick test function with custom parameters
const quickTest = async (destination = 'Tokyo, Japan', duration = 2, startDate = '2025-08-01') => {
  return await testAPIIntegration({
    destination,
    duration,
    startDate,
    preferences: 'Traditional culture, modern attractions, food',
    budget: 'High',
    groupType: 'family',
    specificPlaces: 'Senso-ji Temple, Tokyo Skytree'
  })
}

// Export functions for use in components or testing
export {
  getWeatherForecast,
  generateItineraryWithGemini,
  testAPIIntegration,
  quickTest
}