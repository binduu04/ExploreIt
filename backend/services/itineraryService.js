import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

import { 
  createPrompt, 
  parseGeminiJSON
} from '../utils/helpers.js';

class ItineraryService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }
  }

  async generateItinerary(formData, weatherData) {
    try {
      console.log('🤖 Generating itinerary with Gemini...');
      
      const prompt = createPrompt(formData, weatherData);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${this.apiKey}`,
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
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response structure from Gemini API');
      }
      
      const generatedText = data.candidates[0].content.parts[0].text;
      const parsedItinerary = parseGeminiJSON(generatedText, formData, weatherData);
      
      console.log('✅ Itinerary generated successfully');
      return parsedItinerary;
      
    } catch (error) {
      console.error('❌ Itinerary generation failed:', error.message);
      throw error;
    }
  }

  async generateCompleteItinerary(formData, weatherService) {
    try {
      console.log('🚀 Starting complete itinerary generation');
      
      const limitedFormData = {
        ...formData,
        duration: Math.min(formData.duration, 10)
      };
      
      // Get weather data
      const weatherData = await weatherService.getWeatherForecast(
        limitedFormData.destination,
        limitedFormData.startDate,
        limitedFormData.duration
      );
      
      // Generate itinerary
      const itineraryData = await this.generateItinerary(limitedFormData, weatherData);
      
      // Combine everything
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
      return completeTrip;
      
    } catch (error) {
      console.error('❌ Complete itinerary generation failed:', error.message);
      throw error;
    }
  }
}

export default new ItineraryService();