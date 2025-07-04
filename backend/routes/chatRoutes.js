import express from 'express';
import ChatService from '../services/chatService.js';

const router = express.Router();

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message, tripId, userId,tripContext = {},chatHistory = []} = req.body;

    if (!message || !tripId || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: message, tripId, userId',
      });
    }

    const aiResponse = await ChatService.processMessage({
      message,
      tripId,
      userId,
      tripContext,
      chatHistory
    });

    res.json(aiResponse);
    //console.log(aiResponse);
  } catch (error) {
    console.error('🤖 Chat route error:', error.message);
    res.status(500).json({
      error: 'Failed to process chat message',
      details: error.message,
    });
  }
});

export default router;
