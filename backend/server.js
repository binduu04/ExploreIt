import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import weatherRoutes from './routes/weatherRoutes.js';
import itineraryRoutes from './routes/itineraryRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// API routes
app.use('/api/weather', weatherRoutes);
app.use('/api', itineraryRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/send-trip-email', emailRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      gemini: !!process.env.GEMINI_API_KEY,
      weather: !!process.env.OPENWEATHER_API_KEY,
      email: !!process.env.EMAIL_USER,
      firebase: !!process.env.FIREBASE_PROJECT_ID
    }
  });
});

// ✅ Serve frontend static files
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// ✅ Catch-all for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 fallback (only for unmatched API routes)
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.url} is not a valid endpoint`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';

// // Load environment variables
// dotenv.config();

// // Import routes
// import weatherRoutes from './routes/weatherRoutes.js';
// import itineraryRoutes from './routes/itineraryRoutes.js';
// import calendarRoutes from './routes/calendarRoutes.js';
// import emailRoutes from './routes/emailRoutes.js';
// import chatRoutes from './routes/chatRoutes.js';

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true
// }));
// app.use(express.json());

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({
//     status: 'healthy',
//     timestamp: new Date().toISOString(),
//     version: '1.0.0',
//     services: {
//       gemini: !!process.env.GEMINI_API_KEY,
//       weather: !!process.env.OPENWEATHER_API_KEY,
//       email: !!process.env.EMAIL_USER,
//       firebase: !!process.env.FIREBASE_PROJECT_ID
//     }
//   });
// });

// // Routes
// app.use('/api/weather', weatherRoutes);
// app.use('/api', itineraryRoutes);
// app.use('/api/calendar', calendarRoutes);
// app.use('/api/send-trip-email', emailRoutes);
// app.use('/api/chat', chatRoutes);

// // Error handling middleware
// app.use((error, req, res, next) => {
//   console.error('❌ Unhandled error:', error);
//   res.status(500).json({
//     error: 'Internal server error',
//     details: process.env.NODE_ENV === 'development' ? error.message : undefined
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     error: 'Endpoint not found',
//     message: `${req.method} ${req.url} is not a valid endpoint`
//   });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });




// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Load environment variables
// dotenv.config();

// // Import routes
// import weatherRoutes from './routes/weatherRoutes.js';
// import itineraryRoutes from './routes/itineraryRoutes.js';
// import calendarRoutes from './routes/calendarRoutes.js';
// import emailRoutes from './routes/emailRoutes.js';
// import chatRoutes from './routes/chatRoutes.js';

// const app = express();
// const PORT = process.env.PORT || 5000;

// // For __dirname in ES Module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true
// }));
// app.use(express.json());

// // Health check
// app.get('/health', (req, res) => {
//   res.json({
//     status: 'healthy',
//     timestamp: new Date().toISOString(),
//     version: '1.0.0',
//     services: {
//       gemini: !!process.env.GEMINI_API_KEY,
//       weather: !!process.env.OPENWEATHER_API_KEY,
//       email: !!process.env.EMAIL_USER,
//       firebase: !!process.env.FIREBASE_PROJECT_ID
//     }
//   });
// });

// // Routes
// app.use('/api/weather', weatherRoutes);
// app.use('/api', itineraryRoutes);
// app.use('/api/calendar', calendarRoutes);
// app.use('/api/send-trip-email', emailRoutes);
// app.use('/api/chat', chatRoutes);

// // Serve frontend static files (for production)
// const frontendPath = path.resolve(__dirname, '../frontend/dist');
// app.use(express.static(frontendPath));

// // SPA fallback
// app.get('*', (req, res) => {
//   res.sendFile(path.join(frontendPath, 'index.html'));
// });

// // Error handler
// app.use((error, req, res, next) => {
//   console.error('❌ Unhandled error:', error);
//   res.status(500).json({
//     error: 'Internal server error',
//     details: process.env.NODE_ENV === 'development' ? error.message : undefined
//   });
// });

// // 404
// app.use((req, res) => {
//   res.status(404).json({
//     error: 'Endpoint not found',
//     message: `${req.method} ${req.url} is not a valid endpoint`
//   });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

