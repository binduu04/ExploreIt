// services/chatService.js
import fetch from 'node-fetch';

class ChatService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent';
  }

  async processMessage({message, tripId, userId, tripContext = {},chatHistory = []}) {
    try {
      if (!this.apiKey) {
        throw new Error('Gemini API key not configured');
      }

      //console.log('💬 Processing chat message for trip:', tripId);
      
      // Limit chat history to last 8 messages for context
      const recentHistory = chatHistory.slice(-8);
      
      const prompt = this.createChatPrompt(message, tripContext, recentHistory);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 4000,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      //console.log(data);
      console.log('🤖 Gemini response received');

      // Validate response structure
      if (!data.candidates || 
          data.candidates.length === 0 || 
          !data.candidates[0].content || 
          !data.candidates[0].content.parts || 
          data.candidates[0].content.parts.length === 0 ||
          !data.candidates[0].content.parts[0].text) {
        
        console.error('Invalid Gemini response structure:', data);
        throw new Error('Invalid response structure from Gemini API');
      }

      const aiResponse = data.candidates[0].content.parts[0].text;
     // console.log('🤖 AI response:', aiResponse);

      return {
        response: aiResponse,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Chat processing error:', error.message);
      throw error;
    }
  }

  createChatPrompt(message, tripContext, recentHistory) {
    return `You are a helpful travel assistant. You have access to the user's trip details and previous conversation history.

Trip Context: ${JSON.stringify(tripContext, null, 2)}

Previous Conversation: ${JSON.stringify(recentHistory, null, 2)}

User's New Message: "${message}"

Please respond as a knowledgeable travel assistant who:
1. Remembers our previous conversation
2. Provides specific, helpful advice about their trip
3. References their itinerary, preferences, and trip details when relevant
4. Offers practical suggestions and tips

Respond in a natural, conversational tone. Keep your response concise and specific to the question asked but helpful (preferably 5-lines).`;
  }
}

export default new ChatService();