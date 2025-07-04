import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();


class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    if (!this.apiKey) {
      throw new Error('OpenWeather API key not configured');
    }
  }

  async getWeatherForecast(destination, startDate, duration) {
    try {
      console.log('🌤️ Fetching weather for:', destination, 'starting', startDate, 'for', duration, 'days');
      
      const limitedDuration = Math.min(duration, 10);
      
      // Get coordinates
      const coordinates = await this.getCoordinates(destination);
      
      // Get forecast
      const forecast = await this.getForecast(coordinates.lat, coordinates.lon);
      
      // Process weather data
      const weatherDays = this.processWeatherData(forecast, startDate, limitedDuration);
      
      return {
        location: coordinates.name,
        country: coordinates.country,
        forecast: weatherDays
      };
    } catch (error) {
      console.error('❌ Weather service error:', error.message);
      throw error;
    }
  }

  async getCoordinates(destination) {
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${destination.replace(/\s+/g, ',')}&limit=1&appid=${this.apiKey}`
    );
    
    if (!geoResponse.ok) {
      throw new Error(`Geocoding API failed: ${geoResponse.status} ${geoResponse.statusText}`);
    }
    
    const geoData = await geoResponse.json();
    
    if (!geoData.length) {
      throw new Error(`Location "${destination}" not found`);
    }
    
    return {
      lat: geoData[0].lat,
      lon: geoData[0].lon,
      name: geoData[0].name,
      country: geoData[0].country
    };
  }

  async getForecast(lat, lon) {
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
    );
    
    if (!forecastResponse.ok) {
      throw new Error(`Weather API failed: ${forecastResponse.status} ${forecastResponse.statusText}`);
    }
    
    return await forecastResponse.json();
  }

  processWeatherData(forecastData, startDate, duration) {
    const startDateObj = new Date(startDate);
    const weatherDays = [];
    
    // Process first 5 days with accurate forecast
    const forecastDays = forecastData.list.filter(item => {
      const itemDate = new Date(item.dt * 1000);
      const daysDiff = Math.floor((itemDate - startDateObj) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff < 5;
    });
    
    // Group by day
    const dailyForecasts = {};
    forecastDays.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = [];
      }
      dailyForecasts[date].push(item);
    });
    
    // Create forecasts for first 5 days
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
    
    // Estimate for days 6-10
    if (duration > 5 && weatherDays.length > 0) {
      const avgTemp = Math.round(weatherDays.reduce((sum, day) => sum + day.temperature, 0) / weatherDays.length);
      const commonCondition = weatherDays[0].condition;
      
      for (let i = 5; i < duration; i++) {
        const futureDate = new Date(startDateObj.getTime() + (i * 24 * 60 * 60 * 1000));
        weatherDays.push({
          date: futureDate.toISOString().split('T')[0],
          temperature: Math.round(avgTemp + (Math.random() * 4 - 2)),
          condition: commonCondition,
          description: `estimated ${commonCondition.toLowerCase()}`
        });
      }
    }
    
    return weatherDays;
  }
}

export default new WeatherService();