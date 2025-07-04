import express from 'express';
import ItineraryService from '../services/itineraryService.js';
import WeatherService from '../services/weatherService.js';

const router = express.Router();

// POST /api/generate-itinerary
router.post('/generate-itinerary', async (req, res) => {
  try {
    const { formData, weatherData } = req.body;

    if (!formData || !weatherData) {
      return res.status(400).json({ error: 'formData and weatherData are required' });
    }

    const result = await ItineraryService.generateItinerary(formData, weatherData);
    res.json(result);
  } catch (error) {
    console.error('🌀 generate-itinerary error:', error.message);
    res.status(500).json({
      error: 'Failed to generate itinerary',
      details: error.message,
    });
  }
});

// POST /api/complete-itinerary
router.post('/complete-itinerary', async (req, res) => {
  try {
    const formData = req.body;

    if (!formData.destination || !formData.startDate || !formData.duration) {
      return res.status(400).json({
        error: 'destination, startDate, and duration are required',
      });
    }

    console.log('🧳 Starting complete itinerary generation:', formData);

    const completeTrip = await ItineraryService.generateCompleteItinerary(formData, WeatherService);

    res.json(completeTrip);
  } catch (error) {
    console.error('🧭 complete-itinerary error:', error.message);
    res.status(500).json({
      error: 'Failed to generate complete itinerary',
      details: error.message,
    });
  }
});

export default router;
