// services/weatherService.js - Enhanced Weather Forecast with Hybrid Real + Seasonal Data

// 🌤️ Enhanced Weather Forecast with Hybrid Real + Seasonal Data
export const getEnhancedWeatherForecast = async (destination, startDate, duration = 2) => {
  try {
    const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!WEATHER_API_KEY) {
      throw new Error('Weather API key not configured');
    }
    
    console.log('🌤️ Fetching enhanced weather for:', destination, 'on', startDate, 'for', duration, 'days');

    // Get location coordinates
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${WEATHER_API_KEY}`
    );
    const geoData = await geoRes.json();

    if (!geoData.length) throw new Error('Location not found');
    const { lat, lon, name, country } = geoData[0];

    // Fetch both current forecast and seasonal data
    const [forecastData, currentWeather] = await Promise.all([
      fetchCurrentForecast(lat, lon, WEATHER_API_KEY),
      fetchCurrentWeather(lat, lon, WEATHER_API_KEY)
    ]);

    return processHybridWeatherData(
      { name, country, lat, lon },
      forecastData,
      currentWeather,
      startDate,
      duration
    );

  } catch (error) {
    console.error('❌ Enhanced Weather API error:', error);
    return generateIntelligentFallback(destination, startDate, duration);
  }
};

// Fetch 5-day detailed forecast
const fetchCurrentForecast = async (lat, lon, apiKey) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );
  if (!response.ok) throw new Error('Forecast API failed');
  return response.json();
};

// Fetch current weather for baseline
const fetchCurrentWeather = async (lat, lon, apiKey) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error('Current weather API failed');
    return response.json();
  } catch (error) {
    console.warn('Current weather fetch failed:', error);
    return null;
  }
};

// Process hybrid weather data with accuracy indicators
const processHybridWeatherData = (location, forecastData, currentWeather, startDate, duration) => {
  const startDateObj = new Date(startDate);
  const forecast = [];
  const maxAccurateDays = 5; // OpenWeather 5-day limit

  for (let i = 0; i < duration; i++) {
    const currentDate = new Date(startDateObj);
    currentDate.setDate(startDateObj.getDate() + i);
    
    if (i < maxAccurateDays) {
      // Days 1-5: Use real forecast data (HIGH ACCURACY)
      forecast.push(processRealWeatherDay(forecastData, currentDate, 'high', i));
    } else {
      // Days 6-14: Use seasonal averages + current trends (MEDIUM ACCURACY)
      forecast.push(processSeasonalWeatherDay(currentWeather, currentDate, location, 'medium'));
    }
  }

  return {
    location: location.name,
    country: location.country,
    coordinates: { lat: location.lat, lon: location.lon },
    forecast,
    dataQuality: {
      accurateDays: Math.min(maxAccurateDays, duration),
      estimatedDays: Math.max(0, duration - maxAccurateDays),
      totalDays: duration,
      maxAccurateDays: maxAccurateDays
    }
  };
};

// Process real weather data (days 1-5) with enhanced daily aggregation
const processRealWeatherDay = (forecastData, targetDate, accuracy, dayIndex) => {
  const targetDateStr = targetDate.toDateString();
  
  // Find all 3-hour intervals for this specific date
  const dayIntervals = forecastData.list.filter(item => {
    const itemDate = new Date(item.dt * 1000);
    return itemDate.toDateString() === targetDateStr;
  });

  // If no exact match, get closest intervals (for edge cases)
  if (dayIntervals.length === 0) {
    const targetTime = targetDate.getTime();
    const closestIntervals = forecastData.list
      .filter(item => Math.abs(new Date(item.dt * 1000).getTime() - targetTime) < 24 * 60 * 60 * 1000)
      .slice(0, 3); // Take up to 3 closest intervals
    
    if (closestIntervals.length === 0) {
      return generateFallbackDay(targetDate, accuracy);
    }
    dayIntervals.push(...closestIntervals);
  }

  // Group intervals by time of day for better insights
  const timeGroups = {
    morning: dayIntervals.filter(item => {
      const hour = new Date(item.dt * 1000).getHours();
      return hour >= 6 && hour < 12;
    }),
    afternoon: dayIntervals.filter(item => {
      const hour = new Date(item.dt * 1000).getHours();
      return hour >= 12 && hour < 18;
    }),
    evening: dayIntervals.filter(item => {
      const hour = new Date(item.dt * 1000).getHours();
      return hour >= 18 || hour < 6;
    })
  };

  // Extract comprehensive data
  const allTemps = dayIntervals.map(d => d.main.temp);
  const allConditions = dayIntervals.map(d => d.weather[0].description);
  const allHumidity = dayIntervals.map(d => d.main.humidity);
  const allWindSpeeds = dayIntervals.map(d => d.wind.speed);
  const precipitationProbs = dayIntervals.map(d => d.pop || 0);

  const dayData = {
    date: targetDate.toLocaleDateString(),
    accuracy: accuracy,
    temperature: {
      min: Math.round(Math.min(...allTemps)),
      max: Math.round(Math.max(...allTemps)),
      average: Math.round(allTemps.reduce((a, b) => a + b, 0) / allTemps.length)
    },
    conditions: {
      overall: mostCommon(allConditions),
      morning: timeGroups.morning.length > 0 ? mostCommon(timeGroups.morning.map(d => d.weather[0].description)) : 'Variable',
      afternoon: timeGroups.afternoon.length > 0 ? mostCommon(timeGroups.afternoon.map(d => d.weather[0].description)) : 'Variable',
      evening: timeGroups.evening.length > 0 ? mostCommon(timeGroups.evening.map(d => d.weather[0].description)) : 'Variable'
    },
    humidity: Math.round(allHumidity.reduce((acc, h) => acc + h, 0) / allHumidity.length),
    windSpeed: Math.round(allWindSpeeds.reduce((acc, w) => acc + w, 0) / allWindSpeeds.length),
    precipitation: {
      probability: Math.round(Math.max(...precipitationProbs) * 100),
      expected: precipitationProbs.some(p => p > 0.3) // 30% threshold
    },
    comfort: calculateComfortIndex(allTemps, allHumidity),
    recommendations: generateWeatherRecommendations(allTemps, allConditions, allHumidity),
    isEstimated: false
  };

  return dayData;
};

// Process seasonal weather data (days 6-14)
const processSeasonalWeatherDay = (currentWeather, targetDate, location, accuracy) => {
  const seasonalPattern = getSeasonalPatterns(location.lat, location.lon, targetDate);
  
  // Adjust seasonal data based on current weather trends if available
  let adjustedPattern = { ...seasonalPattern };
  if (currentWeather) {
    const currentTemp = currentWeather.main.temp;
    const seasonalAvg = seasonalPattern.tempAvg;
    const tempDiff = currentTemp - seasonalAvg;
    
    // Adjust seasonal temperatures based on current conditions
    adjustedPattern.tempMin += Math.round(tempDiff * 0.3);
    adjustedPattern.tempMax += Math.round(tempDiff * 0.3);
    adjustedPattern.tempAvg += Math.round(tempDiff * 0.5);
  }

  return {
    date: targetDate.toLocaleDateString(),
    accuracy: accuracy,
    temperature: {
      min: adjustedPattern.tempMin,
      max: adjustedPattern.tempMax,
      average: adjustedPattern.tempAvg
    },
    conditions: {
      overall: adjustedPattern.conditions,
      morning: adjustedPattern.conditions,
      afternoon: adjustedPattern.conditions,
      evening: adjustedPattern.conditions
    },
    humidity: adjustedPattern.humidity,
    windSpeed: adjustedPattern.windSpeed,
    precipitation: {
      probability: adjustedPattern.precipitationChance,
      expected: adjustedPattern.precipitationChance > 50
    },
    comfort: adjustedPattern.comfortLevel,
    recommendations: [
      `Based on seasonal patterns for ${location.name}`,
      `Typical range: ${adjustedPattern.tempMin}-${adjustedPattern.tempMax}°C`,
      adjustedPattern.precipitationChance > 40 ? 'Pack rain gear as precaution' : 'Generally dry conditions expected',
      'Check updated forecast closer to travel date'
    ],
    isEstimated: true
  };
};

// Enhanced seasonal patterns
const getSeasonalPatterns = (lat, lon, date) => {
  const month = new Date(date).getMonth();
  const isNorthern = lat > 0;
  const isTropical = Math.abs(lat) < 23.5;
  
  // Tropical regions have less seasonal variation
  if (isTropical) {
    return {
      tempMin: 22, tempMax: 32, tempAvg: 27,
      conditions: 'partly cloudy', humidity: 75, windSpeed: 8,
      precipitationChance: 45, comfortLevel: 'warm'
    };
  }
  
  // Seasonal patterns for temperate regions
  const seasonalData = {
    northern: {
      winter: { tempMin: -2, tempMax: 8, tempAvg: 3, conditions: 'overcast', humidity: 75, windSpeed: 12, precipitationChance: 55, comfortLevel: 'cold' },
      spring: { tempMin: 8, tempMax: 18, tempAvg: 13, conditions: 'partly cloudy', humidity: 65, windSpeed: 10, precipitationChance: 40, comfortLevel: 'pleasant' },
      summer: { tempMin: 18, tempMax: 28, tempAvg: 23, conditions: 'mostly sunny', humidity: 60, windSpeed: 8, precipitationChance: 30, comfortLevel: 'warm' },
      autumn: { tempMin: 10, tempMax: 20, tempAvg: 15, conditions: 'variable', humidity: 70, windSpeed: 10, precipitationChance: 45, comfortLevel: 'mild' }
    },
    southern: {
      winter: { tempMin: 10, tempMax: 20, tempAvg: 15, conditions: 'variable', humidity: 70, windSpeed: 10, precipitationChance: 45, comfortLevel: 'mild' },
      spring: { tempMin: 18, tempMax: 28, tempAvg: 23, conditions: 'mostly sunny', humidity: 60, windSpeed: 8, precipitationChance: 30, comfortLevel: 'warm' },
      summer: { tempMin: -2, tempMax: 8, tempAvg: 3, conditions: 'overcast', humidity: 75, windSpeed: 12, precipitationChance: 55, comfortLevel: 'cold' },
      autumn: { tempMin: 8, tempMax: 18, tempAvg: 13, conditions: 'partly cloudy', humidity: 65, windSpeed: 10, precipitationChance: 40, comfortLevel: 'pleasant' }
    }
  };

  const hemisphere = isNorthern ? 'northern' : 'southern';
  let season;

  // Northern hemisphere seasons
  if (isNorthern) {
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'autumn';
    else season = 'winter';
  } else {
    // Southern hemisphere (opposite seasons)
    if (month >= 2 && month <= 4) season = 'autumn';
    else if (month >= 5 && month <= 7) season = 'winter';
    else if (month >= 8 && month <= 10) season = 'spring';
    else season = 'summer';
  }

  return seasonalData[hemisphere][season];
};

// Utility function to find most common element in array
const mostCommon = (arr) => {
  if (!arr || arr.length === 0) return 'Variable';
  
  const frequency = {};
  let maxCount = 0;
  let mostCommonItem = arr[0];
  
  arr.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1;
    if (frequency[item] > maxCount) {
      maxCount = frequency[item];
      mostCommonItem = item;
    }
  });
  
  return mostCommonItem;
};

// Calculate comfort index based on temperature and humidity
const calculateComfortIndex = (temperatures, humidityLevels) => {
  const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
  const avgHumidity = humidityLevels.reduce((a, b) => a + b, 0) / humidityLevels.length;
  
  // Simple comfort calculation
  if (avgTemp < 10 || avgTemp > 35) return 'uncomfortable';
  if (avgHumidity > 80) return 'humid';
  if (avgTemp >= 18 && avgTemp <= 25 && avgHumidity <= 70) return 'comfortable';
  if (avgTemp >= 15 && avgTemp <= 30) return 'pleasant';
  return 'variable';
};

// Generate weather-based recommendations
const generateWeatherRecommendations = (temperatures, conditions, humidityLevels) => {
  const recommendations = [];
  const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
  const avgHumidity = humidityLevels.reduce((a, b) => a + b, 0) / humidityLevels.length;
  const hasRain = conditions.some(c => c.toLowerCase().includes('rain'));
  const hasClouds = conditions.some(c => c.toLowerCase().includes('cloud'));
  
  // Temperature-based recommendations
  if (avgTemp < 10) {
    recommendations.push('Pack warm layers and waterproof jacket');
  } else if (avgTemp > 30) {
    recommendations.push('Stay hydrated and seek shade during peak hours');
  } else if (avgTemp >= 20 && avgTemp <= 25) {
    recommendations.push('Perfect weather for outdoor activities');
  }
  
  // Humidity recommendations
  if (avgHumidity > 80) {
    recommendations.push('High humidity - pack breathable fabrics');
  }
  
  // Condition-based recommendations
  if (hasRain) {
    recommendations.push('Carry umbrella and plan indoor alternatives');
  }
  
  if (hasClouds && !hasRain) {
    recommendations.push('Great weather for sightseeing without harsh sun');
  }
  
  // Default recommendation if none apply
  if (recommendations.length === 0) {
    recommendations.push('Check local weather updates before heading out');
  }
  
  return recommendations;
};

// Generate fallback day when no weather data is available
const generateFallbackDay = (targetDate, accuracy) => {
  return {
    date: targetDate.toLocaleDateString(),
    accuracy: accuracy,
    temperature: { min: 15, max: 25, average: 20 },
    conditions: { 
      overall: 'partly cloudy', 
      morning: 'clear', 
      afternoon: 'partly cloudy', 
      evening: 'clear' 
    },
    humidity: 60,
    windSpeed: 8,
    precipitation: { probability: 30, expected: false },
    comfort: 'pleasant',
    recommendations: ['Pack layers for temperature changes', 'General travel preparations'],
    isEstimated: true
  };
};

// Generate intelligent fallback when entire weather service fails
const generateIntelligentFallback = (destination, startDate, duration) => {
  console.log('🔄 Generating intelligent weather fallback');
  const startDateObj = new Date(startDate);
  const forecast = [];

  for (let i = 0; i < duration; i++) {
    const currentDate = new Date(startDateObj);
    currentDate.setDate(startDateObj.getDate() + i);
    
    forecast.push(generateFallbackDay(currentDate, 'fallback'));
  }

  return {
    location: destination,
    country: 'Unknown',
    coordinates: { lat: 0, lon: 0 },
    forecast,
    dataQuality: {
      accurateDays: 0,
      estimatedDays: duration,
      totalDays: duration,
      maxAccurateDays: 5
    }
  };
};