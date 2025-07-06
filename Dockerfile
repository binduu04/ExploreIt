# Step 1: Build React App
FROM node:18-alpine as build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Step 2: Setup Backend
FROM node:18-alpine
WORKDIR /app

# Copy backend files
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend and built frontend
COPY backend ./backend
COPY --from=build-frontend /app/frontend/dist ./frontend/dist

# Set working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 5000

# Start the backend (which serves frontend too)
CMD ["node", "server.js"]
