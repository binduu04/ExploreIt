// services/emailService.js
import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });
  }

  async sendTripEmail(tripData, recipientEmail, senderName) {
    try {
      const htmlContent = this.createTripEmailTemplate(tripData, senderName);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: `🌟 Trip Plan: ${tripData.destination || 'Your Adventure'}`,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${recipientEmail}`);
      
      return { success: true, message: 'Trip details sent successfully!' };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new Error('Failed to send email. Please try again.');
    }
  }

  createTripEmailTemplate(tripData, senderName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .trip-detail { background: white; margin: 15px 0; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
        .trip-title { color: #667eea; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        .detail-row { margin: 10px 0; display: flex; align-items: center; }
        .icon { margin-right: 10px; color: #667eea; }
        .itinerary { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .day { margin: 15px 0; padding: 15px; background: #f1f3f4; border-radius: 5px; }
        .day-header { color: #667eea; font-weight: bold; margin-bottom: 10px; }
        .activity { margin: 5px 0; padding: 8px 12px; background: white; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✈️ Your Trip Plan</h1>
          <p>Shared by ${senderName || 'ExploreIt User'}</p>
        </div>
        
        <div class="content">
          <div class="trip-detail">
            <div class="trip-title">${tripData.destination || 'Adventure Destination'}</div>
            
            <div class="detail-row">
              <span class="icon">📅</span>
              <strong>Duration:</strong> ${tripData.duration || 'Not specified'} ${tripData.duration === 1 ? 'day' : 'days'}
            </div>
            
            <div class="detail-row">
              <span class="icon">💰</span>
              <strong>Budget:</strong> ${tripData.budget ? tripData.budget.charAt(0).toUpperCase() + tripData.budget.slice(1) : 'Not specified'}
            </div>
            
            <div class="detail-row">
              <span class="icon">❤️</span>
              <strong>Preferences:</strong> ${tripData.preferences || 'Open to all experiences'}
            </div>
            
            ${tripData.startDate ? `
            <div class="detail-row">
              <span class="icon">🗓️</span>
              <strong>Start Date:</strong> ${new Date(tripData.startDate).toLocaleDateString()}
            </div>
            ` : ''}
          </div>

          ${tripData.summary ? `
          <div class="trip-detail">
            <h3 style="color: #667eea; margin-bottom: 15px;">🌟 Trip Summary</h3>
            <p><strong>${tripData.summary.title || ''}</strong></p>
            <p>${tripData.summary.description || ''}</p>
            ${tripData.summary.highlights ? `
              <div style="margin-top: 15px;">
                <strong>Highlights:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  ${tripData.summary.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
          ` : ''}

          ${tripData.itinerary && Array.isArray(tripData.itinerary) ? `
          <div class="itinerary">
            <h3 style="color: #667eea; margin-bottom: 20px;">📍 Detailed Itinerary</h3>
            ${tripData.itinerary.map((day, index) => `
              <div class="day">
                <div class="day-header">Day ${day.day || index + 1} - ${day.date || ''} (${day.temperature || ''}°C, ${day.condition || ''})</div>
                
                ${day.morning ? `
                <div class="activity">
                  <strong>🌅 Morning:</strong> ${day.morning.activity || ''}
                  <br><small>📍 ${day.morning.location || ''} | ⏱️ ${day.morning.duration || ''} | 💰 ${day.morning.cost || ''}</small>
                  <br><em>${day.morning.description || ''}</em>
                </div>
                ` : ''}
                
                ${day.afternoon ? `
                <div class="activity">
                  <strong>☀️ Afternoon:</strong> ${day.afternoon.activity || ''}
                  <br><small>📍 ${day.afternoon.location || ''} | ⏱️ ${day.afternoon.duration || ''} | 💰 ${day.afternoon.cost || ''}</small>
                  <br><em>${day.afternoon.description || ''}</em>
                </div>
                ` : ''}
                
                ${day.evening ? `
                <div class="activity">
                  <strong>🌙 Evening:</strong> ${day.evening.activity || ''}
                  <br><small>📍 ${day.evening.location || ''} | ⏱️ ${day.evening.duration || ''} | 💰 ${day.evening.cost || ''}</small>
                  <br><em>${day.evening.description || ''}</em>
                </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
          ` : tripData.itinerary ? `
          <div class="itinerary">
            <h3 style="color: #667eea; margin-bottom: 20px;">📍 Itinerary</h3>
            <div style="white-space: pre-line; background: white; padding: 15px; border-radius: 5px;">
              ${tripData.itinerary}
            </div>
          </div>
          ` : ''}

          ${tripData.tips ? `
          <div class="trip-detail">
            <h3 style="color: #667eea; margin-bottom: 15px;">💡 Helpful Tips</h3>
            
            ${tripData.tips.transportation ? `
            <div style="margin-bottom: 15px;">
              <strong>🚌 Transportation:</strong>
              <p>${tripData.tips.transportation}</p>
            </div>
            ` : ''}
            
            ${tripData.tips.budget && Array.isArray(tripData.tips.budget) ? `
            <div style="margin-bottom: 15px;">
              <strong>💰 Budget Tips:</strong>
              <ul style="margin: 5px 0; padding-left: 20px;">
                ${tripData.tips.budget.map(tip => `<li>${tip}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            ${tripData.tips.packing && Array.isArray(tripData.tips.packing) ? `
            <div style="margin-bottom: 15px;">
              <strong>🎒 Packing Essentials:</strong>
              <ul style="margin: 5px 0; padding-left: 20px;">
                ${tripData.tips.packing.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            ${tripData.tips.cultural && Array.isArray(tripData.tips.cultural) ? `
            <div style="margin-bottom: 15px;">
              <strong>🏛️ Cultural Tips:</strong>
              <ul style="margin: 5px 0; padding-left: 20px;">
                ${tripData.tips.cultural.map(tip => `<li>${tip}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            ${tripData.tips.safety && Array.isArray(tripData.tips.safety) ? `
            <div style="margin-bottom: 15px;">
              <strong>🛡️ Safety Tips:</strong>
              <ul style="margin: 5px 0; padding-left: 20px;">
                ${tripData.tips.safety.map(tip => `<li>${tip}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
          </div>
          ` : ''}

          <div class="footer">
            <p>Generated by ExploreIt - Your AI Travel Planner</p>
            <p>Plan your next adventure at <a href="https://yourapp.com" style="color: #667eea;">ExploreIt</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}

export default new EmailService();