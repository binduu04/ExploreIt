import express from 'express';

import WeatherService from '../services/weatherService.js';

const router = express.Router();

// POST /api/weather
router.post('/', async (req, res) => {
  try {
    const { destination, startDate, duration } = req.body;

    if (!destination || !startDate || !duration) {
      return res.status(400).json({
        error: 'Missing required fields: destination, startDate, duration',
      });
    }

    const result = await WeatherService.getWeatherForecast(destination, startDate, duration);
    res.json(result);
  } catch (error) {
    console.error('🌧️ Weather route error:', error.message);
    res.status(500).json({
      error: 'Failed to get weather forecast',
      details: error.message,
    });
  }
});

export default router;
