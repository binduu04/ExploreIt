import { google } from 'googleapis';
import { db } from '../config/firebase.js';
import admin from '../config/firebase.js';
import { createEvents } from 'ics';
import fs from 'fs';
import path from 'path';
import os from 'os';

class CalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/callback'
    );
    
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  // Token management methods
  async storeUserTokens(userId, tokens) {
    try {
      await db.collection('user_tokens').doc(userId).set({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        token_type: tokens.token_type,
        scope: tokens.scope,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
     // console.log('Tokens stored for user:', userId);
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  async getUserTokens(userId) {
    try {
      const doc = await db.collection('user_tokens').doc(userId).get();
      if (!doc.exists) return null;
      
      const data = doc.data();
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expiry_date: data.expiry_date,
        token_type: data.token_type,
        scope: data.scope
      };
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      throw error;
    }
  }

  async deleteUserTokens(userId) {
    try {
      await db.collection('user_tokens').doc(userId).delete();
      console.log('Tokens deleted for user:', userId);
    } catch (error) {
      console.error('Error deleting tokens:', error);
      throw error;
    }
  }

  async updateUserTokens(userId, tokens) {
    try {
      await db.collection('user_tokens').doc(userId).update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        token_type: tokens.token_type,
        scope: tokens.scope,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Tokens updated for user:', userId);
    } catch (error) {
      console.error('Error updating tokens:', error);
      throw error;
    }
  }

  // Calendar methods
  generateAuthUrl(userId) {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      state: userId,
      prompt: 'consent'
    });
  }

  async handleCallback(userId, code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      await this.storeUserTokens(userId, tokens);
      return { success: true, message: 'Calendar access granted' };
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw error;
    }
  }

  async checkPermissions(userId) {
    const tokens = await this.getUserTokens(userId);
    return tokens !== null;
  }

  async ensureValidTokens(userId) {
    const tokens = await this.getUserTokens(userId);
    if (!tokens) {
      throw new Error('No tokens found for user');
    }

    this.oauth2Client.setCredentials(tokens);

    const now = Date.now();
    const expiryTime = tokens.expiry_date;
    const fiveMinutes = 5 * 60 * 1000;

    if (expiryTime && (now >= expiryTime - fiveMinutes)) {
      console.log('Token expired, refreshing...');
      try {
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        await this.updateUserTokens(userId, credentials);
        this.oauth2Client.setCredentials(credentials);
        return credentials;
      } catch (error) {
        await this.deleteUserTokens(userId);
        throw new Error('Token refresh failed, please re-authenticate');
      }
    }

    return tokens;
  }

  async addTripToCalendar(userId, tripData) {
    try {
      await this.ensureValidTokens(userId);
      
      const events = [];
      let totalEventsCreated = 0;

      for (let dayIndex = 0; dayIndex < tripData.itinerary.length; dayIndex++) {
        const day = tripData.itinerary[dayIndex];
        const dayDate = new Date(day.date);
        
        if (isNaN(dayDate.getTime())) {
          console.error('Invalid date:', day.date);
          continue;
        }
        
        // Create events for each time period
        const timeSlots = [
          { period: day.morning, emoji: '🌅', startHour: 9, duration: 3, colorId: '2' },
          { period: day.afternoon, emoji: '☀️', startHour: 13, duration: 4, colorId: '9' },
          { period: day.evening, emoji: '🌆', startHour: 18, duration: 3, colorId: '4' }
        ];

        for (const slot of timeSlots) {
          if (slot.period && slot.period.activity) {
            try {
              const startTime = new Date(dayDate);
              startTime.setHours(slot.startHour, 0, 0, 0);
              const endTime = new Date(startTime.getTime() + slot.duration * 60 * 60 * 1000);

              const event = {
                summary: `${slot.emoji} ${slot.period.activity}`,
                description: `${slot.period.description || ''}\n\n📍 Location: ${slot.period.location || 'TBD'}\n💰 Cost: ${slot.period.cost || 'TBD'}\n⏱️ Duration: ${slot.period.duration || 'TBD'}`,
                location: slot.period.location || '',
                start: {
                  dateTime: startTime.toISOString(),
                  timeZone: 'Asia/Kolkata',
                },
                end: {
                  dateTime: endTime.toISOString(),
                  timeZone: 'Asia/Kolkata',
                },
                colorId: slot.colorId,
              };

              const response = await this.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
              });
              
              events.push(response.data);
              totalEventsCreated++;
            } catch (error) {
              console.error(`Error creating ${slot.period} event:`, error);
            }
          }
        }
      }

      if (totalEventsCreated === 0) {
        throw new Error('No events were created. Please check your trip data.');
      }

      return {
        success: true,
        message: `Successfully added ${totalEventsCreated} events to your calendar!`,
        events: totalEventsCreated
      };

    } catch (error) {
      console.error('Error adding trip to calendar:', error);
      throw error;
    }
  }

  async revokeAccess(userId) {
    try {
      const tokens = await this.getUserTokens(userId);
      if (tokens && tokens.access_token) {
        try {
          this.oauth2Client.setCredentials(tokens);
          await this.oauth2Client.revokeToken(tokens.access_token);
        } catch (revokeError) {
          console.error('Error revoking token with Google:', revokeError);
        }
      }
      await this.deleteUserTokens(userId);
      return { success: true, message: 'Calendar access revoked' };
    } catch (error) {
      console.error('Error revoking calendar access:', error);
      throw error;
    }
  }

  generateICSFile(tripData) {
    const events = [];

    tripData.itinerary.forEach((day) => {
      if (!day.date) return;

      const [year, month, date] = day.date.split('-').map(Number);

      const getStartHour = (label) => ({
        morning: 9,
        afternoon: 13,
        evening: 18
      })[label.toLowerCase()] || 10;

      const formatEvent = (slot, label) => {
        let durationHours = 2;
        if (typeof slot.duration === 'string') {
          const match = slot.duration.match(/\d+/);
          if (match) durationHours = parseInt(match[0], 10);
        }

        return {
          title: `${label}: ${slot.activity || 'Untitled Activity'}`,
          start: [year, month, date, getStartHour(label)],
          duration: { hours: durationHours },
          location: slot.location || 'Not specified',
          description: slot.description || ''
        };
      };

      ['morning', 'afternoon', 'evening'].forEach((period) => {
        if (day[period] && day[period].activity) {
          try {
            events.push(formatEvent(day[period], period));
          } catch (e) {
            console.error(`Error formatting ${period} slot on ${day.date}:`, e);
          }
        }
      });
    });

    return new Promise((resolve, reject) => {
      createEvents(events, (error, value) => {
        if (error) {
          reject(error);
        } else {
          const fileName = `trip-${Date.now()}.ics`;
          const tempDir = os.tmpdir();
          const filePath = path.join(tempDir, fileName);
          fs.writeFileSync(filePath, value);
          resolve({ filePath, fileName });
        }
      });
    });
  }
}

export default new CalendarService();