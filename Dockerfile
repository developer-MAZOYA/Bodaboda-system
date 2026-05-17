# Single stage build
FROM node:20-alpine

WORKDIR /app

# Copy backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci
COPY backend/ ./backend/
RUN cd backend && npm run build

# Copy frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Install serve for frontend (if not served by backend)
RUN npm install -g serve

EXPOSE 8080

# If backend serves frontend
CMD ["node", "backend/dist/server.js"]

# If running separately:
# CMD ["sh", "-c", "node backend/dist/server.js & serve -s frontend/build -l 3000"]