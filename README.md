# ExploreIt🧭

ExploreIt is a full-stack travel planning application that helps users organize trips, manage itineraries, chat with an AI assistant, and access essential travel services like calendar integration and email notifications.

## Features

- **User Authentication**: Secure login and registration system.
- **Trip Planning**: Create, view, and manage detailed itineraries for your trips.
- **AI Chat**: Interact with an AI assistant for travel planning and suggestions.
- **Calendar Integration**: Sync trip events with your calendar.
- **Email Notifications**: Receive important trip updates via email.
- **Smart Itinerary Generation**: Weather data is used to optimize and personalize your travel plans.

## Tech Stack

### Frontend
- React
- Vite
- CSS
- Firebase Authentication

### Backend
- Node.js
- Express
- AI Integration (Gemini API)
- Email Service (Nodemailer)
- Calendar Integration (Google Calendar API)
- Weather Data (OpenWeatherMap API, used for itinerary generation)
- Docker, Docker Compose

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Docker (optional, for containerized deployment)

### Backend Setup
1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables (e.g., Firebase, email, weather API keys).
4. Start the backend server:
   ```sh
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Open your web browser and navigate to `http://localhost:5173` to access the application
