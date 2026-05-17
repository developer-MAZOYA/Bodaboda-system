# Dockerfile at project root
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY backend/package.json ./backend/

# Copy frontend
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Install serve for frontend
RUN npm install -g serve

EXPOSE 8080

CMD ["node", "backend/dist/server.js"]  # Adjust to your entry point