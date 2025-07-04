import express from 'express';
import EmailService from '../services/emailService.js';

const router = express.Router();

// POST /api/email/send
router.post('/', async (req, res) => {
  try {
    const { tripData, recipientEmail, senderName } = req.body;

    if (!tripData || !recipientEmail) {
      return res.status(400).json({
        error: 'Missing required fields: tripData and recipientEmail',
      });
    }

    const result = await EmailService.sendTripEmail(tripData, recipientEmail, senderName);
    res.json(result);
  } catch (error) {
    console.error('📧 Email route error:', error);
    res.status(500).json({
      error: 'Failed to send trip email',
      details: error.message,
    });
  }
});

export default router;
