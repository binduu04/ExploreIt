// export const createPrompt = (formData, weatherData) => {
//   const weatherSummary = weatherData.forecast.map((day, index) => {
//     const weatherAdvice = getWeatherAdvice(day.condition, day.temperature);
//     return `Day ${index + 1} (${day.date}): ${day.temperature}°C, ${day.description} - ${weatherAdvice}`;
//   }).join('\n');

//   const budgetGuidelines = getBudgetGuidelines(formData.budget);
//   const groupInstructions = getGroupInstructions(formData.groupType);

//   return `
// You are an expert travel planner creating a ${formData.duration}-day itinerary for ${formData.destination}.

// TRAVELER PROFILE:
// - Destination: ${formData.destination}
// - Duration: ${formData.duration} days
// - Start Date: ${formData.startDate}
// - Budget Level: ${formData.budget}
// - Group Type: ${formData.groupType}
// - Interests: ${formData.preferences}
// - Must-see: ${formData.specificPlaces || 'Flexible based on weather and logistics'}

// WEATHER FORECAST:
// ${weatherSummary}

// SPECIFIC REQUIREMENTS:
// ${budgetGuidelines}
// ${groupInstructions}

// ACTIVITY GUIDELINES:
// - Morning (9:00–12:00): Outdoor, sightseeing, cultural
// - Afternoon (12:00–17:00): Main attractions, tours
// - Evening (17:00–21:00): Dining, entertainment, relaxed activities

// COST ESTIMATION:
// - Estimate costs in local currency or USD
// - Mention free/low-cost alternatives
// - Adapt to budget level

// LOCATION SPECIFICITY:
// - Use real names of places, addresses
// - Include timings, transport info

// WEATHER ADAPTATION:
// - Adjust plans based on forecast
// - Recommend gear/clothing
// - Suggest indoor plans if needed

// OUTPUT FORMAT: Return ONLY valid JSON like:
// {
//   "summary": {
//     "title": "Exciting trip title",
//     "description": "2-3 sentence overview",
//     "highlights": ["Highlight 1", "Highlight 2"]
//   },
//   "itinerary": [ ... ],
//   "tips": { ... }
// }`;
// };

// export const getWeatherAdvice = (condition, temperature) => {
//   const map = {
//     'Clear': temperature > 25 ? 'Perfect for outdoor activities, bring sun protection' : 'Great weather for sightseeing',
//     'Clouds': 'Good for walking tours, comfortable temperatures',
//     'Rain': 'Plan indoor activities, bring waterproof gear',
//     'Drizzle': 'Light rain gear recommended, still okay for covered spots',
//     'Thunderstorm': 'Stick to indoor activities like museums or malls',
//     'Snow': 'Dress warmly, enjoy winter-specific activities',
//     'Mist': 'Reduced visibility, focus on cozy indoor places',
//     'Fog': 'Limited visibility, great for museums and cafes'
//   };
//   return map[condition] || 'Check local forecast and plan accordingly';
// };

// export const getBudgetGuidelines = (budget) => {
//   const map = {
//     'budget': `
// BUDGET TRAVEL:
// - Focus on free/low-cost activities
// - Use public transport
// - Stay in hostels or budget hotels
// - Recommend street food/local eateries`,
//     'mid-range': `
// MID-RANGE TRAVEL:
// - Balanced mix of paid/free experiences
// - Good value restaurants
// - Comfortable transport options`,
//     'luxury': `
// LUXURY TRAVEL:
// - High-end restaurants, private tours
// - Premium stays, VIP access
// - Focus on comfort and exclusivity`
//   };
//   return map[budget?.toLowerCase()] || map['mid-range'];
// };

// export const getGroupInstructions = (groupType) => {
//   const groupMap = {
//     'solo': `
// SOLO TRAVEL:
// - Solo-friendly, safe activities
// - Opportunities to socialize
// - Hostels, co-working cafes`,
//     'couple': `
// COUPLES:
// - Romantic and scenic experiences
// - Couple-friendly dining
// - Shared memories and photo spots`,
//     'family': `
// FAMILY:
// - Child-friendly, educational options
// - Frequent breaks
// - Family restaurants`,
//     'friends': `
// FRIENDS:
// - Social group experiences
// - Nightlife, shared activities
// - Split costs options`
//   };
//   return groupMap[groupType?.toLowerCase()] || groupMap['solo'];
// };

// export const parseGeminiJSON = (text, formData, weatherData) => {
//   console.log('🔍 Parsing Gemini response...');
//   try {
//     const parsed = JSON.parse(text.trim());
//     console.log('✅ Direct JSON parse successful');
//     return validateAndComplete(parsed, formData, weatherData);
//   } catch (e1) {
//     console.warn('⚠️ Direct parse failed:', e1.message);

//     try {
//       let cleaned = text.trim();
//       cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
//       const first = cleaned.indexOf('{');
//       const last = cleaned.lastIndexOf('}');
//       if (first === -1 || last === -1) throw new Error('Missing JSON braces');
//       const jsonString = cleaned.substring(first, last + 1);
//       const fixed = jsonString.replace(/,(\s*[}\]])/g, '$1');
//       const parsed = JSON.parse(fixed);
//       console.log('✅ Cleaned JSON parse successful');
//       return validateAndComplete(parsed, formData, weatherData);
//     } catch (e2) {
//       console.error('❌ Failed to parse cleaned JSON:', e2.message);
//       throw new Error(`Failed to parse Gemini response as JSON: ${text.slice(0, 200)}...`);
//     }
//   }
// };

// export const validateAndComplete = (data, formData, weatherData) => {
//   console.log('🔍 Validating and completing parsed data...');
//   if (!data.summary || !data.itinerary || !data.tips) {
//     throw new Error('Missing required itinerary structure (summary, itinerary, tips)');
//   }

//   if (!Array.isArray(data.itinerary) || data.itinerary.length !== formData.duration) {
//     throw new Error(`Expected ${formData.duration} itinerary days, got ${data.itinerary.length}`);
//   }

//   const startDate = new Date(formData.startDate);
//   data.itinerary.forEach((day, index) => {
//     const date = new Date(startDate);
//     date.setDate(date.getDate() + index);
//     const weather = weatherData.forecast[index] || weatherData.forecast[0];
//     day.date = date.toISOString().split('T')[0];
//     day.temperature = weather.temperature;
//     day.condition = weather.condition;
//     day.day = index + 1;

//     if (!day.morning || !day.afternoon || !day.evening) {
//       throw new Error(`Day ${index + 1} is missing morning, afternoon, or evening slots`);
//     }
//   });

//   console.log('✅ Structure validated successfully');
//   return data;
// };

export const createPrompt = (formData, weatherData) => {
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

export const parseGeminiJSON = (text, formData, weatherData) => {
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


