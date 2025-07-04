import express from 'express';
import CalendarService from '../services/calendarService.js';
import { verifyFirebaseToken } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
const router = express.Router();

// GET /api/calendar/permissions
router.get('/permissions', verifyFirebaseToken, async (req, res) => {
  try {
    const hasPermissions = await CalendarService.checkPermissions(req.user.uid);
    res.json({ hasPermissions });
  } catch (error) {
    console.error('🔐 Permission check failed:', error);
    res.status(500).json({ error: 'Failed to check calendar permissions' });
  }
});

// POST /api/calendar/auth-url
router.post('/auth-url', verifyFirebaseToken, (req, res) => {
  try {
    const url = CalendarService.generateAuthUrl(req.user.uid);
    res.json({ authUrl: url });
  } catch (error) {
    console.error('🔐 Auth URL generation failed:', error);
    res.status(500).json({ error: 'Failed to generate calendar auth URL' });
  }
});

// POST /api/calendar/callback
router.post('/callback', verifyFirebaseToken, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const result = await CalendarService.handleCallback(req.user.uid, code);
    res.json(result);
  } catch (error) {
    console.error('🔁 OAuth callback error:', error);
    res.status(500).json({ error: 'OAuth callback handling failed' });
  }
});

// POST /api/calendar/add-trip
router.post('/add-trip', verifyFirebaseToken, async (req, res) => {
  try {
    const { tripData } = req.body;
    if (!tripData || !tripData.itinerary) {
      return res.status(400).json({ error: 'Missing or invalid trip data' });
    }

    const result = await CalendarService.addTripToCalendar(req.user.uid, tripData);
    res.json(result);
  } catch (error) {
    console.error('📅 Failed to add trip to calendar:', error);
    if (error.message.includes('Token refresh failed')) {
      return res.status(401).json({ error: 'Token expired', requiresReauth: true });
    }

    res.status(500).json({ error: 'Failed to add trip to calendar', details: error.message });
  }
});

// POST /api/calendar/revoke
router.post('/revoke', verifyFirebaseToken, async (req, res) => {
  try {
    const result = await CalendarService.revokeAccess(req.user.uid);
    res.json(result);
  } catch (error) {
    console.error('🔓 Calendar revoke failed:', error);
    res.status(500).json({ error: 'Failed to revoke calendar access' });
  }
});

router.post('/download-ics', async (req, res) => {
  try {
    const { tripData } = req.body;

    if (!tripData || !tripData.itinerary) {
      return res.status(400).json({ error: 'Missing tripData or itinerary' });
    }

    const { filePath, fileName } = await CalendarService.generateICSFile(tripData);

    res.download(filePath, fileName, () => {
      fs.unlinkSync(filePath); // Clean up after sending
    });
  } catch (error) {
    console.error('🛑 ICS download error:', error);
    res.status(500).json({ error: 'Failed to generate ICS file', details: error.message });
  }
});




export default router;
