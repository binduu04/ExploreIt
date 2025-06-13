// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Weather forecast endpoint
app.post('/api/weather', async (req, res) => {
  try {
    const { destination, startDate, duration } = req.body;

    // Validate input
    if (!destination || !startDate || !duration) {
      return res.status(400).json({
        error: 'Missing required fields: destination, startDate, and duration are required'
      });
    }

    const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!WEATHER_API_KEY) {
      return res.status(500).json({
        error: 'Weather API key not configured on server'
      });
    }

    console.log('🌤️ Fetching weather for:', destination, 'starting', startDate, 'for', duration, 'days');
    
    // Limit duration to 10 days max
    const limitedDuration = Math.min(duration, 10);
    
    // Get coordinates for the destination
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${WEATHER_API_KEY}`
    );
    
    if (!geoResponse.ok) {
      throw new Error(`Geocoding API failed: ${geoResponse.status} ${geoResponse.statusText}`);
    }
    
    const geoData = await geoResponse.json();
    
    if (!geoData.length) {
      return res.status(404).json({
        error: `Location "${destination}" not found`
      });
    }
    
    const { lat, lon } = geoData[0];
    
    // Get 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );
    
    if (!forecastResponse.ok) {
      throw new Error(`Weather API failed: ${forecastResponse.status} ${forecastResponse.statusText}`);
    }
    
    const forecastData = await forecastResponse.json();
    
    // Process weather data
    const startDateObj = new Date(startDate);
    const weatherDays = [];
    
    // Process first 5 days with accurate forecast
    const forecastDays = forecastData.list.filter(item => {
      const itemDate = new Date(item.dt * 1000);
      const daysDiff = Math.floor((itemDate - startDateObj) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff < 5;
    });
    
    // Group by day and get daily summary
    const dailyForecasts = {};
    forecastDays.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = [];
      }
      dailyForecasts[date].push(item);
    });
    
    // Create accurate forecasts for first 5 days
    Object.keys(dailyForecasts).slice(0, 5).forEach((date, index) => {
      const dayForecasts = dailyForecasts[date];
      const avgTemp = Math.round(dayForecasts.reduce((sum, f) => sum + f.main.temp, 0) / dayForecasts.length);
      const mostCommonWeather = dayForecasts.reduce((prev, current) => 
        dayForecasts.filter(f => f.weather[0].main === current.weather[0].main).length >
        dayForecasts.filter(f => f.weather[0].main === prev.weather[0].main).length ? current : prev
      );
      
      weatherDays.push({
        date: new Date(startDateObj.getTime() + (index * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        temperature: avgTemp,
        condition: mostCommonWeather.weather[0].main,
        description: mostCommonWeather.weather[0].description
      });
    });
    
    // For days 6-10, use estimation based on first 5 days average
    if (limitedDuration > 5 && weatherDays.length > 0) {
      const avgTemp = Math.round(weatherDays.reduce((sum, day) => sum + day.temperature, 0) / weatherDays.length);
      const commonCondition = weatherDays[0].condition;
      
      for (let i = 5; i < limitedDuration; i++) {
        const futureDate = new Date(startDateObj.getTime() + (i * 24 * 60 * 60 * 1000));
        weatherDays.push({
          date: futureDate.toISOString().split('T')[0],
          temperature: Math.round(avgTemp + (Math.random() * 4 - 2)), // ±2°C variation
          condition: commonCondition,
          description: `estimated ${commonCondition.toLowerCase()}`
        });
      }
    }
    
    const weatherResult = {
      location: geoData[0].name,
      country: geoData[0].country,
      forecast: weatherDays
    };

    console.log('✅ Weather data processed successfully');
    res.json(weatherResult);
    
  } catch (error) {
    console.error('❌ Weather API error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch weather data',
      details: error.message
    });
  }
});

// Gemini AI itinerary generation endpoint
app.post('/api/generate-itinerary', async (req, res) => {
  try {
    const { formData, weatherData } = req.body;

    // Validate input
    if (!formData || !weatherData) {
      return res.status(400).json({
        error: 'Missing required fields: formData and weatherData are required'
      });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key not configured on server'
      });
    }

    console.log('🤖 Generating itinerary with Gemini...');
    
    const prompt = createPrompt(formData, weatherData);
    
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
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('🎯 Gemini response received');
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API');
    }
    
    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('📄 Generated text length:', generatedText.length);
    
    // Parse JSON with simplified approach
    const parsedItinerary = parseGeminiJSON(generatedText, formData, weatherData);
    console.log('✅ Itinerary parsed successfully');
    
    res.json(parsedItinerary);
    
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    res.status(500).json({
      error: 'Failed to generate itinerary',
      details: error.message
    });
  }
});

// Complete itinerary generation endpoint (combines weather + itinerary)
app.post('/api/complete-itinerary', async (req, res) => {
  try {
    const formData = req.body;

    // Validate input
    if (!formData.destination || !formData.startDate || !formData.duration) {
      return res.status(400).json({
        error: 'Missing required fields: destination, startDate, and duration are required'
      });
    }

    console.log('🚀 Starting complete itinerary generation:', formData);
    
    // Limit duration to 10 days max
    const limitedFormData = {
      ...formData,
      duration: Math.min(formData.duration, 10)
    };
    
    console.log('📅 Duration limited to:', limitedFormData.duration, 'days');
    
    // Step 1: Get weather data
    console.log('🌤️ Fetching weather data...');
    const weatherResponse = await fetch(`${req.protocol}://${req.get('host')}/api/weather`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: limitedFormData.destination,
        startDate: limitedFormData.startDate,
        duration: limitedFormData.duration
      })
    });
    
    if (!weatherResponse.ok) {
      const weatherError = await weatherResponse.json();
      throw new Error(`Weather fetch failed: ${weatherError.error}`);
    }
    
    const weatherData = await weatherResponse.json();
    console.log('✅ Weather data received');
    
    // Step 2: Generate itinerary
    console.log('🤖 Generating itinerary...');
    const itineraryResponse = await fetch(`${req.protocol}://${req.get('host')}/api/generate-itinerary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formData: limitedFormData,
        weatherData: weatherData
      })
    });
    
    if (!itineraryResponse.ok) {
      const itineraryError = await itineraryResponse.json();
      throw new Error(`Itinerary generation failed: ${itineraryError.error}`);
    }
    
    const itineraryData = await itineraryResponse.json();
    console.log('✅ Itinerary generated');
    
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
    };
    
    console.log('✅ Complete trip generated successfully');
    res.json(completeTrip);
    
  } catch (error) {
    console.error('❌ Complete itinerary generation failed:', error.message);
    res.status(500).json({
      error: 'Failed to generate complete itinerary',
      details: error.message
    });
  }
});

// Helper functions (same as in your frontend code)
const createPrompt = (formData, weatherData) => {
  const weatherSummary = weatherData.forecast.map((day, index) => {
    const weatherAdvice = getWeatherAdvice(day.condition, day.temperature);
    return `Day ${index + 1} (${day.date}): ${day.temperature}°C, ${day.description} - ${weatherAdvice}`;
  }).join('\n');

  const budgetGuidelines = getBudgetGuidelines(formData.budget);
  const groupInstructions = getGroupInstructions(formData.groupType);

  return `You are an expert travel planner creating a ${formData.duration}-day itinerary for ${formData.destination}.

TRAVELER PROFILE:
- Destination: ${formData.destination}
- Duration: ${formData.duration} days
- Start Date: ${formData.startDate}
- Budget Level: ${formData.budget}
- Group Type: ${formData.groupType}
- Interests: ${formData.preferences}
- Must-see: ${formData.specificPlaces || 'Flexible based on weather and logistics'}

WEATHER FORECAST:
${weatherSummary}

SPECIFIC REQUIREMENTS:
${budgetGuidelines}
${groupInstructions}

ACTIVITY GUIDELINES:
- Morning (9:00-12:00): Focus on outdoor activities, sightseeing, or cultural experiences
- Afternoon (12:00-17:00): Main attractions, tours, or experiences (consider weather)
- Evening (17:00-21:00): Dining, entertainment, or relaxed activities

COST ESTIMATION RULES:
- Provide realistic cost estimates in local currency or USD
- Include approximate costs for activities, meals, and transportation
- Consider the specified budget level when suggesting activities
- Mention free/low-cost alternatives when possible

LOCATION SPECIFICITY:
- Use exact addresses or landmark names when possible
- Suggest specific restaurants, attractions, or venues
- Include practical details like opening hours considerations
- Mention transportation between locations

WEATHER ADAPTATION:
- Adjust activities based on daily weather conditions
- Suggest indoor alternatives for rainy/cold days
- Recommend appropriate clothing or gear
- Consider seasonal factors affecting attractions

OUTPUT FORMAT - Return ONLY valid JSON with this exact structure:

{
  "summary": {
    "title": "Compelling trip title reflecting destination and experience",
    "description": "2-3 sentence overview highlighting unique aspects and experiences",
    "highlights": ["Must-see attraction/experience", "Unique local activity", "Cultural/culinary highlight"]
  },
  "itinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "temperature": 25,
      "condition": "Weather condition",
      "morning": {
        "activity": "Specific activity name",
        "location": "Exact location/address",
        "duration": "X hours",
        "description": "Detailed description with what to expect",
        "cost": "Cost estimate with currency"
      },
      "afternoon": {
        "activity": "Specific activity name",
        "location": "Exact location/address",
        "duration": "X hours",
        "description": "Detailed description with what to expect",
        "cost": "Cost estimate with currency"
      },
      "evening": {
        "activity": "Specific activity name",
        "location": "Exact location/address",
        "duration": "X hours",
        "description": "Detailed description with what to expect",
        "cost": "Cost estimate with currency"
      }
    }
  ],
  "tips": {
    "transportation": "General transportation advice for getting around",
    "budget": ["Money-saving tip 1", "Money-saving tip 2", "Free activity suggestion", "Budget-friendly dining tip"],
    "packing": ["Essential item 1", "Weather-appropriate item", "Useful gadget/tool", "Local-specific item"],
    "cultural": ["Cultural custom to be aware of", "Useful local phrase", "Etiquette tip"],
    "safety": ["Safety tip 1", "Safety tip 2", "Emergency contact info"]
  }
}

CRITICAL INSTRUCTIONS:
1. Return ONLY the JSON object - no explanations, markdown, or additional text
2. Ensure all JSON syntax is valid (no trailing commas, proper quotes)
3. Make every recommendation specific and actionable
4. Adapt ALL activities to the weather forecast provided
5. Ensure costs align with the specified budget level
6. Include practical details like timing, booking requirements, etc.
7. Consider ${formData.groupType} group dynamics in all recommendations
8. Keep tips arrays simple and directly usable

Generate the itinerary now:`;
};

const getWeatherAdvice = (condition, temperature) => {
  const weatherTips = {
    'Clear': temperature > 25 ? 'Perfect for outdoor activities, bring sun protection' : 'Great weather for sightseeing',
    'Clouds': 'Good for walking tours, comfortable temperatures',
    'Rain': 'Plan indoor activities, bring waterproof gear',
    'Drizzle': 'Light rain gear recommended, still good for covered attractions',
    'Thunderstorm': 'Focus on indoor activities, museums, shopping',
    'Snow': 'Dress warmly, winter activities possible',
    'Mist': 'Visibility may be limited, good for cozy indoor experiences',
    'Fog': 'Limited visibility, perfect for museums and indoor attractions'
  };
  
  return weatherTips[condition] || 'Check weather conditions and dress appropriately';
};

const getBudgetGuidelines = (budget) => {
  const budgetMap = {
    'budget': `
BUDGET CONSTRAINTS (Budget Travel):
- Prioritize free and low-cost activities
- Suggest budget accommodations and local eateries
- Include free walking tours, public parks, and museums with free days
- Recommend public transportation over taxis
- Focus on authentic local experiences that don't require high spending`,
    
    'mid-range': `
BUDGET GUIDELINES (Mid-Range Travel):
- Balance between experiences and cost
- Include mix of free attractions and paid experiences
- Suggest good value restaurants and moderate activities
- Allow for some guided tours and cultural experiences
- Recommend efficient transportation options`,
    
    'luxury': `
BUDGET APPROACH (Luxury Travel):
- Focus on premium experiences and exclusive access
- Suggest high-end restaurants, private tours, and luxury services
- Include unique experiences and VIP access where available
- Recommend comfort and convenience in all suggestions
- Consider helicopter tours, private guides, and premium accommodations`
  };
  
  return budgetMap[budget.toLowerCase()] || budgetMap['mid-range'];
};

const getGroupInstructions = (groupType) => {
  const groupMap = {
    'solo': `
GROUP CONSIDERATIONS (Solo Traveler):
- Ensure activities are solo-friendly and safe
- Include opportunities to meet other travelers
- Suggest group tours or social activities
- Consider solo dining options and social spaces
- Focus on personal interests and flexibility`,
    
    'couple': `
GROUP CONSIDERATIONS (Couple):
- Include romantic experiences and intimate settings
- Suggest couple-friendly activities and restaurants
- Balance relaxation with adventure
- Consider photo opportunities and memorable moments
- Include both shared experiences and individual interests`,
    
    'family': `
GROUP CONSIDERATIONS (Family with Children):
- Ensure all activities are family-friendly and age-appropriate
- Include educational and interactive experiences
- Plan for shorter attention spans and rest breaks
- Suggest family restaurants and kid-friendly venues
- Consider safety and accessibility for children`,
    
    'friends': `
GROUP CONSIDERATIONS (Group of Friends):
- Focus on social and group activities
- Include nightlife and entertainment options
- Suggest group dining and shared experiences
- Consider group discounts and package deals
- Balance group activities with individual exploration time`
  };
  
  return groupMap[groupType.toLowerCase()] || groupMap['solo'];
};

const parseGeminiJSON = (text, formData, weatherData) => {
  console.log('🔍 Parsing JSON response...');
  
  try {
    // Strategy 1: Direct JSON parse
    const parsed = JSON.parse(text.trim());
    console.log('✅ Direct JSON parse successful');
    return validateAndComplete(parsed, formData, weatherData);
  } catch (directError) {
    console.log('❌ Direct parse failed:', directError.message);
    
    // Strategy 2: Clean and parse
    try {
      let cleanText = text.trim();
      
      // Remove markdown code blocks
      cleanText = cleanText.replace(/```json\s*/g, '');
      cleanText = cleanText.replace(/```\s*/g, '');
      
      // Extract JSON content between first { and last }
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('No JSON braces found in response');
      }
      
      const jsonString = cleanText.substring(firstBrace, lastBrace + 1);
      
      // Fix trailing commas
      const fixedJson = jsonString.replace(/,(\s*[}\]])/g, '$1');
      
      const parsed = JSON.parse(fixedJson);
      console.log('✅ Cleaned JSON parse successful');
      return validateAndComplete(parsed, formData, weatherData);
      
    } catch (cleanError) {
      console.error('❌ Cleaned parse also failed:', cleanError.message);
      throw new Error(`Failed to parse Gemini response as JSON. Original text: ${text.substring(0, 200)}...`);
    }
  }
};

const validateAndComplete = (data, formData, weatherData) => {
  console.log('🔍 Validating structure...');
  
  // Ensure required structure exists
  if (!data.summary || !data.itinerary || !data.tips) {
    throw new Error('Invalid itinerary structure: missing required sections');
  }
  
  // Validate itinerary has correct number of days
  if (!Array.isArray(data.itinerary) || data.itinerary.length !== formData.duration) {
    throw new Error(`Invalid itinerary: expected ${formData.duration} days, got ${data.itinerary?.length || 0}`);
  }
  
  // Complete missing weather data in itinerary
  const startDate = new Date(formData.startDate);
  
  data.itinerary.forEach((day, index) => {
    const dayDate = new Date(startDate.getTime() + (index * 24 * 60 * 60 * 1000));
    const weather = weatherData.forecast[index] || weatherData.forecast[0];
    
    // Ensure date and weather are set correctly
    day.date = dayDate.toISOString().split('T')[0];
    day.temperature = weather.temperature;
    day.condition = weather.condition;
    day.day = index + 1;
    
    // Validate day structure
    if (!day.morning || !day.afternoon || !day.evening) {
      throw new Error(`Day ${index + 1} missing required time periods`);
    }
  });
  
  console.log('✅ Structure validation complete');
  return data;
};

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    details: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.url} is not a valid endpoint`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌤️ Weather API: http://localhost:${PORT}/api/weather`);
  console.log(`🤖 Itinerary API: http://localhost:${PORT}/api/generate-itinerary`);
  console.log(`🎯 Complete API: http://localhost:${PORT}/api/complete-itinerary`);
});