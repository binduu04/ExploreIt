// services/apiService.js - SIMPLIFIED VERSION

// Weather forecast with proper error handling
const getWeatherForecast = async (destination, startDate, duration) => {
  const WEATHER_API_KEY = "4b810b46936ff454cc536f53411b133c"
  console.log('🌤️ Fetching weather for:', destination, 'starting', startDate, 'for', duration, 'days')
  
  // Limit duration to 10 days max
  const limitedDuration = Math.min(duration, 10)
  
  try {
    // Get coordinates for the destination
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${WEATHER_API_KEY}`
    )
    
    if (!geoResponse.ok) {
      throw new Error(`Geocoding API failed: ${geoResponse.status} ${geoResponse.statusText}`)
    }
    
    const geoData = await geoResponse.json()
    
    if (!geoData.length) {
      throw new Error(`Location "${destination}" not found`)
    }
    
    const { lat, lon } = geoData[0]
    
    // Get 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    )
    
    if (!forecastResponse.ok) {
      throw new Error(`Weather API failed: ${forecastResponse.status} ${forecastResponse.statusText}`)
    }
    
    const forecastData = await forecastResponse.json()
    
    // Process weather data
    const startDateObj = new Date(startDate)
    const weatherDays = []
    
    // Process first 5 days with accurate forecast
    const forecastDays = forecastData.list.filter(item => {
      const itemDate = new Date(item.dt * 1000)
      const daysDiff = Math.floor((itemDate - startDateObj) / (1000 * 60 * 60 * 24))
      return daysDiff >= 0 && daysDiff < 5
    })
    
    // Group by day and get daily summary
    const dailyForecasts = {}
    forecastDays.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString()
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = []
      }
      dailyForecasts[date].push(item)
    })
    
    // Create accurate forecasts for first 5 days
    Object.keys(dailyForecasts).slice(0, 5).forEach((date, index) => {
      const dayForecasts = dailyForecasts[date]
      const avgTemp = Math.round(dayForecasts.reduce((sum, f) => sum + f.main.temp, 0) / dayForecasts.length)
      const mostCommonWeather = dayForecasts.reduce((prev, current) => 
        dayForecasts.filter(f => f.weather[0].main === current.weather[0].main).length >
        dayForecasts.filter(f => f.weather[0].main === prev.weather[0].main).length ? current : prev
      )
      
      weatherDays.push({
        date: new Date(startDateObj.getTime() + (index * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        temperature: avgTemp,
        condition: mostCommonWeather.weather[0].main,
        description: mostCommonWeather.weather[0].description
      })
    })
    
    // For days 6-10, use estimation based on first 5 days average
    if (limitedDuration > 5 && weatherDays.length > 0) {
      const avgTemp = Math.round(weatherDays.reduce((sum, day) => sum + day.temperature, 0) / weatherDays.length)
      const commonCondition = weatherDays[0].condition
      
      for (let i = 5; i < limitedDuration; i++) {
        const futureDate = new Date(startDateObj.getTime() + (i * 24 * 60 * 60 * 1000))
        weatherDays.push({
          date: futureDate.toISOString().split('T')[0],
          temperature: Math.round(avgTemp + (Math.random() * 4 - 2)), // ±2°C variation
          condition: commonCondition,
          description: `estimated ${commonCondition.toLowerCase()}`
        })
      }
    }
    
    return {
      location: geoData[0].name,
      country: geoData[0].country,
      forecast: weatherDays
    }
    
  } catch (error) {
    console.error('❌ Weather API error:', error.message)
    throw error // Let the caller handle the error
  }
}

// Create prompt for Gemini API
const createPrompt = (formData, weatherData) => {
  const weatherSummary = weatherData.forecast.map((day, index) => 
    `Day ${index + 1}: ${day.temperature}°C, ${day.description}`
  ).join(', ')

  return `Create a ${formData.duration}-day travel itinerary for ${formData.destination}.

REQUIREMENTS:
- Duration: ${formData.duration} days
- Start Date: ${formData.startDate}
- Budget: ${formData.budget}
- Group: ${formData.groupType}
- Interests: ${formData.preferences}
- Weather: ${weatherSummary}

RESPOND WITH ONLY VALID JSON (no markdown, no extra text):

{
  "summary": {
    "title": "Trip title",
    "description": "Brief description",
    "highlights": ["highlight1", "highlight2", "highlight3"]
  },
  "itinerary": [
    {
      "day": 1,
      "date": "2025-06-11",
      "temperature": 25,
      "condition": "Clear",
      "morning": {
        "activity": "Activity name",
        "location": "Location",
        "duration": "2 hours",
        "description": "Brief description",
        "cost": "Cost estimate"
      },
      "afternoon": {
        "activity": "Activity name",
        "location": "Location", 
        "duration": "3 hours",
        "description": "Brief description",
        "cost": "Cost estimate"
      },
      "evening": {
        "activity": "Activity name",
        "location": "Location",
        "duration": "2 hours", 
        "description": "Brief description",
        "cost": "Cost estimate"
      }
    }
  ],
  "tips": {
    "transportation": "Transportation advice",
    "budget": ["tip1", "tip2", "tip3"],
    "packing": ["item1", "item2", "item3"]
  }
}

IMPORTANT: Return ONLY the JSON object, no other text or formatting.`
}

// Generate itinerary with Gemini API
const generateItineraryWithGemini = async (formData, weatherData) => {
  const GEMINI_API_KEY = "AIzaSyBiGK7oFTTnpSLgOappWLKdGSYnndkk3o0"
  console.log('🤖 Generating itinerary with Gemini...')
  
  try {
    const prompt = createPrompt(formData, weatherData)
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 4000,
          }
        })
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`)
    }
    
    const data = await response.json()
    console.log('🎯 Gemini response received')
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API')
    }
    
    const generatedText = data.candidates[0].content.parts[0].text
    console.log('📄 Generated text length:', generatedText.length)
    
    // Parse JSON with simplified approach
    const parsedItinerary = parseGeminiJSON(generatedText, formData, weatherData)
    console.log('✅ Itinerary parsed successfully')
    
    return parsedItinerary
    
  } catch (error) {
    console.error('❌ Gemini API error:', error.message)
    throw error // Let the caller handle the error
  }
}

// Simplified JSON parsing - only two strategies
const parseGeminiJSON = (text, formData, weatherData) => {
  console.log('🔍 Parsing JSON response...')
  
  try {
    // Strategy 1: Direct JSON parse
    const parsed = JSON.parse(text.trim())
    console.log('✅ Direct JSON parse successful')
    return validateAndComplete(parsed, formData, weatherData)
  } catch (directError) {
    console.log('❌ Direct parse failed:', directError.message)
    
    // Strategy 2: Clean and parse
    try {
      let cleanText = text.trim()
      
      // Remove markdown code blocks
      cleanText = cleanText.replace(/```json\s*/g, '')
      cleanText = cleanText.replace(/```\s*/g, '')
      
      // Extract JSON content between first { and last }
      const firstBrace = cleanText.indexOf('{')
      const lastBrace = cleanText.lastIndexOf('}')
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No JSON braces found in response')
      }
      
      const jsonString = cleanText.substring(firstBrace, lastBrace + 1)
      
      // Fix trailing commas
      const fixedJson = jsonString.replace(/,(\s*[}\]])/g, '$1')
      
      const parsed = JSON.parse(fixedJson)
      console.log('✅ Cleaned JSON parse successful')
      return validateAndComplete(parsed, formData, weatherData)
      
    } catch (cleanError) {
      console.error('❌ Cleaned parse also failed:', cleanError.message)
      throw new Error(`Failed to parse Gemini response as JSON. Original text: ${text.substring(0, 200)}...`)
    }
  }
}

// Validate and complete the structure with minimal fallbacks
const validateAndComplete = (data, formData, weatherData) => {
  console.log('🔍 Validating structure...')
  
  // Ensure required structure exists
  if (!data.summary || !data.itinerary || !data.tips) {
    throw new Error('Invalid itinerary structure: missing required sections')
  }
  
  // Validate itinerary has correct number of days
  if (!Array.isArray(data.itinerary) || data.itinerary.length !== formData.duration) {
    throw new Error(`Invalid itinerary: expected ${formData.duration} days, got ${data.itinerary?.length || 0}`)
  }
  
  // Complete missing weather data in itinerary
  const startDate = new Date(formData.startDate)
  
  data.itinerary.forEach((day, index) => {
    const dayDate = new Date(startDate.getTime() + (index * 24 * 60 * 60 * 1000))
    const weather = weatherData.forecast[index] || weatherData.forecast[0]
    
    // Ensure date and weather are set correctly
    day.date = dayDate.toISOString().split('T')[0]
    day.temperature = weather.temperature
    day.condition = weather.condition
    day.day = index + 1
    
    // Validate day structure
    if (!day.morning || !day.afternoon || !day.evening) {
      throw new Error(`Day ${index + 1} missing required time periods`)
    }
  })
  
  console.log('✅ Structure validation complete')
  return data
}

// Main function with simplified error handling
const generateCompleteItinerary = async (formData) => {
  console.log('🚀 Starting itinerary generation:', formData)
  
  // Limit duration to 10 days max
  const limitedFormData = {
    ...formData,
    duration: Math.min(formData.duration, 10)
  }
  
  console.log('📅 Duration limited to:', limitedFormData.duration, 'days')
  
  try {
    // Step 1: Get weather data (will throw on error)
    console.log('🌤️ Fetching weather data...')
    const weatherData = await getWeatherForecast(
      limitedFormData.destination, 
      limitedFormData.startDate, 
      limitedFormData.duration
    )
    console.log('✅ Weather data received')
    
    // Step 2: Generate itinerary (will throw on error)  
    console.log('🤖 Generating itinerary...')
    const itineraryData = await generateItineraryWithGemini(limitedFormData, weatherData)
    console.log('✅ Itinerary generated')
    
    // Step 3: Combine everything
    const completeTrip = {
      id: Date.now(),
      destination: limitedFormData.destination,
      duration: limitedFormData.duration,
      startDate: limitedFormData.startDate,
      preferences: limitedFormData.preferences,
      budget: limitedFormData.budget,
      groupType: limitedFormData.groupType,
      generatedOn: new Date().toISOString(),
      weather: weatherData,
      ...itineraryData
    }
    
    console.log('✅ Complete trip generated successfully')
    return completeTrip
    
  } catch (error) {
    console.error('❌ Complete itinerary generation failed:', error.message)
    console.error('❌ Error details:', error)
    throw error // Re-throw for caller to handle
  }
}

// Export functions
export {
  generateCompleteItinerary,
  getWeatherForecast,
  generateItineraryWithGemini
}