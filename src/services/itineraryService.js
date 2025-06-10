// services/itineraryService.js - AI-Powered Travel Planning with Weather Integration

import { getEnhancedWeatherForecast } from './weatherService.js';

// 🧠 Create Enhanced Realistic Itinerary Prompt
const createRealisticItineraryPrompt = (formData, weatherData) => {
  // Validate duration limit
  const maxDuration = 14;
  if (formData.duration > maxDuration) {
    console.warn(`Duration ${formData.duration} exceeds maximum ${maxDuration} days. Limiting to ${maxDuration}.`);
    formData.duration = maxDuration;
  }

  // Enhanced weather analysis with accuracy indicators
  const weatherInsights = weatherData.forecast.map((day, index) => {
    const dayNum = index + 1;
    const temp = day.temperature.average;
    const conditions = day.conditions.overall.toLowerCase();
    const isAccurate = day.accuracy === 'high';
    
    // Weather-based recommendations
    let recommendations = [];
    if (temp < 10) recommendations.push("Pack warm layers, consider indoor activities");
    if (temp > 30) recommendations.push("Stay hydrated, seek shade during midday");
    if (day.precipitation.expected) recommendations.push("Indoor backup plans needed, carry umbrella");
    if (conditions.includes('clear') || conditions.includes('sunny')) recommendations.push("Perfect for outdoor sightseeing");
    if (day.windSpeed > 15) recommendations.push("Windy conditions, secure loose items");
    
    return {
      dayNum,
      ...day,
      clothingAdvice: temp < 15 ? "Warm layers, jacket" : temp > 25 ? "Light, breathable clothing" : "Comfortable casual wear",
      activitySuitability: day.precipitation.expected ? "Indoor-focused" : "Outdoor-friendly",
      recommendations: recommendations.join('; '),
      dataNote: isAccurate ? "Real-time forecast" : "Seasonal estimate"
    };
  });

  const accurateDays = weatherData.dataQuality.accurateDays;
  const estimatedDays = weatherData.dataQuality.estimatedDays;

  return `You are an expert local travel guide creating a realistic, actionable ${formData.duration}-day itinerary for ${formData.destination}.

TRAVELER PROFILE:
- Group: ${formData.groupType} (adjust pace and activities accordingly)
- Budget: ${formData.budget} (provide specific cost estimates in local currency)
- Interests: ${formData.preferences}
- Must-see: ${formData.specificPlaces || 'Flexible based on weather and logistics'}
- Travel dates: Starting ${formData.startDate} (consider seasonal factors)

WEATHER INTELLIGENCE & PLANNING STRATEGY:
📊 **Data Quality Overview**: 
- Days 1-${accurateDays}: High accuracy real-time forecasts ✅
${estimatedDays > 0 ? `- Days ${accurateDays + 1}-${formData.duration}: Seasonal estimates based on historical patterns 📊` : ''}

🌤️ **Detailed Weather-Based Planning**:
${weatherInsights.map(day => 
  `DAY ${day.dayNum} (${day.date}) - ${day.dataNote}:
  🌡️ Temperature: ${day.temperature.min}°C - ${day.temperature.max}°C (avg: ${day.temperature.average}°C)
  🌥️ Conditions: ${day.conditions.overall} | Rain: ${day.precipitation.probability}%
  👕 Recommended clothing: ${day.clothingAdvice}
  🎯 Best suited for: ${day.activitySuitability} activities
  💡 Weather tips: ${day.recommendations || 'Standard precautions'}
  ⭐ Comfort level: ${day.comfort} conditions`
).join('\n\n')}

⚠️ **Weather Strategy Notes**:
${estimatedDays > 0 ? 
  `- Days ${accurateDays + 1}-${formData.duration} use seasonal averages - plan flexible indoor/outdoor alternatives
  - Check weather updates 2-3 days before for estimated weather days
  - Pack versatile clothing suitable for ${Math.min(...weatherInsights.map(d => d.temperature.min))}°C - ${Math.max(...weatherInsights.map(d => d.temperature.max))}°C range` 
  : '- All days have accurate weather forecasts - plan activities with confidence'}

CRITICAL REQUIREMENTS FOR REALISTIC PLANNING:

1. **WEATHER-FIRST PLANNING**: 
   - Prioritize indoor activities on high-rain days (>60% chance)
   - Schedule outdoor sightseeing on clear/sunny days
   - Provide weather-appropriate backup plans
   - Consider temperature comfort for walking tours

2. **TIMING REALISM**: 
   - Account for actual travel time between locations (use realistic estimates: walking 5km/h, driving in city traffic)
   - Include meal breaks (1-1.5 hours) and rest periods
   - Consider opening hours, seasonal schedules, and local customs (siesta, prayer times)
   - Factor in potential weather delays for estimated days

3. **BUDGET TRANSPARENCY**:
   - Provide estimated costs in local currency for each major activity/meal
   - Suggest budget/mid-range/luxury alternatives
   - Include often-forgotten costs (parking, tips, entrance fees, transport between sites)
   - Mention free alternatives and money-saving tips

4. **LOCAL EXPERTISE**:
   - Include local customs, appropriate meal times, and cultural norms
   - Suggest appropriate dress codes for religious/cultural sites
   - Provide basic language tips or essential phrases
   - Warn about tourist traps, overpriced areas, or common scams
   - Recommend authentic local experiences over tourist-focused ones

5. **PRACTICAL LOGISTICS**:
   - Specify transportation methods with realistic costs and duration
   - Suggest where to buy necessities (groceries, pharmacy, SIM cards)
   - Include WiFi availability at major spots and charging stations
   - Provide emergency contact information and nearest hospitals
   - Mention local apps or services that are essential

FORMAT YOUR RESPONSE AS:

**DAY [X] - [Weather Summary & Strategy]**
*🌤️ Weather: [Temperature range], [conditions], [rain probability]% rain chance*
*📋 Day Strategy: [How weather influences today's plans] | Data: [Real-time/Seasonal estimate]*

**MORNING ADVENTURE (9:00-12:00)**
🎯 **Main Activity**: [Specific activity with exact name/location]
📍 **Location**: [Exact address or landmark + neighborhood]
💰 **Cost**: [Specific price range in local currency, including extras]
🚗 **Getting There**: [Transport method, duration, cost, booking tips]
👕 **Dress Code**: [Weather + cultural requirements]
🌧️ **Weather Backup**: [Alternative if conditions change]
💡 **Insider Tip**: [Local knowledge that enhances the experience]
⏰ **Time Management**: [Realistic duration + buffer for weather/crowds]

**LUNCH BREAK (12:00-14:00)**
🍽️ **Recommended Spot**: [Specific restaurant/area with price range and specialties]
🌦️ **Weather Consideration**: [Indoor seating/covered areas if needed]
💳 **Payment**: [Cash/card acceptance, tipping customs]

**AFTERNOON EXPLORATION (14:00-17:00)**
[Same detailed format as morning]

**EVENING EXPERIENCE (17:00-20:00)**
[Same detailed format, consider sunset times and evening weather]

**DAILY WRAP-UP**:
💸 **Total Day Budget**: [Realistic range: budget/mid-range/luxury]
🏠 **Accommodation Suggestion**: [Recommended area with transport connections]
📱 **Tonight's Prep**: [What to check/book for tomorrow, weather updates needed]
🎒 **Tomorrow's Packing**: [Weather-specific items based on forecast]

${estimatedDays > 0 && formData.duration > 7 ? `
**IMPORTANT NOTES FOR DAYS ${accurateDays + 1}+**:
⚠️ Weather for these days is based on seasonal patterns. Plan flexible activities that can adapt to actual conditions.
📱 Check updated weather forecasts 2-3 days before these dates for more accurate planning.
🎒 Pack versatile clothing and have indoor backup options ready.
` : ''}

MAKE THIS ITINERARY FEEL LIKE GUIDANCE FROM A KNOWLEDGEABLE LOCAL FRIEND WHO PRIORITIZES THE TRAVELER'S COMFORT, SAFETY, AND AUTHENTIC EXPERIENCES WHILE BEING COMPLETELY HONEST ABOUT WEATHER UNCERTAINTIES.`;
};

// ✨ Generate Enhanced Itinerary using Gemini API
export const generateItineraryWithGemini = async (formData, weatherData) => {
  try {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    // Limit duration to maximum 14 days
    const maxDuration = 14;
    if (formData.duration > maxDuration) {
      formData.duration = maxDuration;
      console.warn(`Duration limited to ${maxDuration} days`);
    }

    console.log('✨ Generating enhanced itinerary for:', formData.destination, `(${formData.duration} days)`);

    const prompt = createRealisticItineraryPrompt(formData, weatherData);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Invalid Gemini response structure');

    return parseEnhancedGeminiResponse(text, formData.duration, weatherData);

  } catch (error) {
    console.error('❌ Gemini API error:', error);
    return generateEnhancedFallbackItinerary(formData, weatherData);
  }
};

// 🧩 Parse Enhanced Gemini Response
const parseEnhancedGeminiResponse = (text, duration, weatherData) => {
  const days = [];
  const dayPattern = /\*\*DAY (\d+)[\s\S]*?(?=\*\*DAY \d+|$)/g;
  let match;

  while ((match = dayPattern.exec(text)) !== null) {
    const dayNumber = parseInt(match[1]);
    const dayContent = match[0];
    
    const day = {
      day: dayNumber,
      weather: extractDayWeather(dayContent, weatherData, dayNumber - 1),
      morning: parseEnhancedTimeSlot(dayContent, 'MORNING'),
      afternoon: parseEnhancedTimeSlot(dayContent, 'AFTERNOON'),
      evening: parseEnhancedTimeSlot(dayContent, 'EVENING'),
      dailyBudget: extractBudgetInfo(dayContent),
      preparations: extractPreparationInfo(dayContent),
      rawContent: dayContent // Keep for debugging
    };
    days.push(day);
  }

  // Ensure we have the right number of days
  while (days.length < duration) {
    days.push(generateEnhancedFallbackDay(days.length + 1, weatherData));
  }

  return days.slice(0, duration);
};

// 🔍 Parse Enhanced Time Slot
const parseEnhancedTimeSlot = (dayContent, timeSlot) => {
  const pattern = new RegExp(`\\*\\*${timeSlot}[^*]*\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]|\\*\\*DAILY|$)`, 'i');
  const match = dayContent.match(pattern);
  
  if (!match) return [generateEnhancedFallbackActivity(timeSlot)];

  const content = match[1];
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  
  const activity = {
    activity: extractField(lines, '🎯', 'Main Activity') || `${timeSlot} Activity`,
    location: extractField(lines, '📍', 'Location') || 'Location TBD',
    cost: extractField(lines, '💰', 'Cost') || 'Cost varies',
    transport: extractField(lines, '🚗', 'Getting There') || 'Transport details',
    dressCode: extractField(lines, '👕', 'Dress Code') || 'Comfortable attire',
    weatherBackup: extractField(lines, '🌧️', 'Weather Backup') || 'Indoor alternative available',
    insiderTip: extractField(lines, '💡', 'Insider Tip') || 'Local recommendation',
    timeManagement: extractField(lines, '⏰', 'Time Management') || '2-3 hours recommended',
    notes: extractAdditionalNotes(content)
  };

  return [activity];
};

// 🔧 Helper Functions for Parsing
const extractField = (lines, emoji, keyword) => {
  const line = lines.find(l => l.includes(emoji) && l.toLowerCase().includes(keyword.toLowerCase()));
  if (!line) return null;
  
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return line.replace(emoji, '').trim();
  
  return line.substring(colonIndex + 1).trim();
};

const extractDayWeather = (dayContent, weatherData, dayIndex) => {
  if (!weatherData || !weatherData.forecast || dayIndex >= weatherData.forecast.length) {
    return {
      temperature: { min: 20, max: 25, average: 22 },
      conditions: { overall: 'Pleasant' },
      precipitation: { probability: 20, expected: false },
      comfort: 'Comfortable',
      accuracy: 'estimated'
    };
  }
  
  return weatherData.forecast[dayIndex];
};

const extractBudgetInfo = (dayContent) => {
  const budgetMatch = dayContent.match(/💸\s*\*\*Total Day Budget\*\*:\s*([^\n]+)/i);
  return budgetMatch ? budgetMatch[1].trim() : 'Budget varies by choices';
};

const extractPreparationInfo = (dayContent) => {
  const prepLines = [];
  const tonightMatch = dayContent.match(/📱\s*\*\*Tonight's Prep\*\*:\s*([^\n]+)/i);
  const packingMatch = dayContent.match(/🎒\s*\*\*Tomorrow's Packing\*\*:\s*([^\n]+)/i);
  
  if (tonightMatch) prepLines.push(`Tonight: ${tonightMatch[1].trim()}`);
  if (packingMatch) prepLines.push(`Packing: ${packingMatch[1].trim()}`);
  
  return prepLines.length > 0 ? prepLines.join(' | ') : 'Standard travel preparations';
};

const extractAdditionalNotes = (content) => {
  const notes = [];
  const lunchMatch = content.match(/🍽️\s*\*\*Recommended Spot\*\*:\s*([^\n]+)/i);
  if (lunchMatch) notes.push(`Lunch: ${lunchMatch[1].trim()}`);
  
  return notes.join(' | ');
};

// 🛠️ Fallback Generation Functions
const generateEnhancedFallbackItinerary = (formData, weatherData) => {
  console.log('🔄 Generating enhanced fallback itinerary');
  
  const days = [];
  for (let i = 1; i <= formData.duration; i++) {
    days.push(generateEnhancedFallbackDay(i, weatherData, formData));
  }
  
  return days;
};

const generateEnhancedFallbackDay = (dayNumber, weatherData, formData = null) => {
  const weather = weatherData?.forecast?.[dayNumber - 1] || {
    temperature: { min: 18, max: 26, average: 22 },
    conditions: { overall: 'Pleasant' },
    precipitation: { probability: 30, expected: false },
    comfort: 'Comfortable',
    accuracy: 'estimated'
  };

  const isRainyDay = weather.precipitation.probability > 60;
  const destination = formData?.destination || 'your destination';

  return {
    day: dayNumber,
    weather,
    morning: [generateEnhancedFallbackActivity('MORNING', isRainyDay, destination)],
    afternoon: [generateEnhancedFallbackActivity('AFTERNOON', isRainyDay, destination)],
    evening: [generateEnhancedFallbackActivity('EVENING', isRainyDay, destination)],
    dailyBudget: formData?.budget === 'budget' ? '$50-80' : formData?.budget === 'luxury' ? '$200-400' : '$100-200',
    preparations: `Plan for ${weather.conditions.overall.toLowerCase()} weather conditions`,
    rawContent: `Fallback itinerary for day ${dayNumber}`
  };
};

const generateEnhancedFallbackActivity = (timeSlot, isRainyDay = false, destination = 'destination') => {
  const morningActivities = {
    outdoor: {
      activity: `Explore ${destination} Historic District`,
      location: 'City center historic area',
      cost: 'Free walking tour, optional museum entries $10-20',
      weatherBackup: 'Visit covered markets or museums'
    },
    indoor: {
      activity: `Visit ${destination} Main Museum`,
      location: 'Central museum district',
      cost: 'Entry fees $15-25',
      weatherBackup: 'Extended museum visit with cafe break'
    }
  };

  const afternoonActivities = {
    outdoor: {
      activity: `Scenic ${destination} Walking Tour`,
      location: 'Popular neighborhoods',
      cost: 'Free to moderate shopping/dining',
      weatherBackup: 'Shopping districts and covered areas'
    },
    indoor: {
      activity: `${destination} Cultural Experience`,
      location: 'Cultural center or indoor attraction',
      cost: 'Activity fees $20-40',
      weatherBackup: 'Additional indoor cultural sites'
    }
  };

  const eveningActivities = {
    outdoor: {
      activity: `${destination} Sunset Viewpoint`,
      location: 'Popular viewpoint or waterfront',
      cost: 'Free viewing, optional dining nearby',
      weatherBackup: 'Rooftop restaurant or indoor scenic dining'
    },
    indoor: {
      activity: `${destination} Evening Entertainment`,
      location: 'Entertainment district',
      cost: 'Show tickets or dining $30-60',
      weatherBackup: 'Additional indoor entertainment options'
    }
  };

  const activities = {
    MORNING: morningActivities,
    AFTERNOON: afternoonActivities,
    EVENING: eveningActivities
  };

  const selectedActivity = activities[timeSlot]?.[isRainyDay ? 'indoor' : 'outdoor'] || 
                          activities[timeSlot]?.outdoor || 
                          { activity: `${timeSlot} Activity`, location: 'TBD', cost: 'Varies', weatherBackup: 'Indoor alternative' };

  return {
    ...selectedActivity,
    transport: 'Walking or local transport',
    dressCode: isRainyDay ? 'Layers with rain protection' : 'Comfortable walking attire',
    insiderTip: 'Ask locals for current recommendations',
    timeManagement: '2-3 hours with flexibility for weather',
    notes: `Weather-adapted ${timeSlot.toLowerCase()} activity`
  };
};

// 🎯 Main Enhanced Itinerary Generation Function
export const generateEnhancedItinerary = async (formData) => {
  try {
    console.log('🌟 Starting enhanced itinerary generation for:', formData.destination);
    
    // Step 1: Get weather data
    const weatherData = await getEnhancedWeatherForecast(
      formData.destination, 
      formData.duration, 
      formData.startDate
    );
    
    console.log('🌤️ Weather data obtained:', weatherData.dataQuality);
    
    // Step 2: Generate itinerary with weather integration
    const itinerary = await generateItineraryWithGemini(formData, weatherData);
    
    console.log('✅ Enhanced itinerary generated successfully');
    
    return {
      success: true,
      itinerary,
      weatherData,
      metadata: {
        destination: formData.destination,
        duration: formData.duration,
        generatedAt: new Date().toISOString(),
        weatherAccuracy: weatherData.dataQuality,
        totalDays: itinerary.length
      }
    };
    
  } catch (error) {
    console.error('❌ Enhanced itinerary generation failed:', error);
    
    // Return fallback with basic weather estimates
    const fallbackWeather = {
      forecast: Array.from({ length: formData.duration }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        temperature: { min: 18, max: 26, average: 22 },
        conditions: { overall: 'Pleasant' },
        precipitation: { probability: 30, expected: false },
        comfort: 'Comfortable',
        accuracy: 'estimated'
      })),
      dataQuality: { accurateDays: 0, estimatedDays: formData.duration }
    };
    
    return {
      success: false,
      error: error.message,
      itinerary: generateEnhancedFallbackItinerary(formData, fallbackWeather),
      weatherData: fallbackWeather,
      metadata: {
        destination: formData.destination,
        duration: formData.duration,
        generatedAt: new Date().toISOString(),
        fallbackUsed: true,
        totalDays: formData.duration
      }
    };
  }
};

// 📊 Export utility functions for testing
export const utils = {
  createRealisticItineraryPrompt,
  parseEnhancedGeminiResponse,
  generateEnhancedFallbackItinerary,
  extractField,
  extractDayWeather
};