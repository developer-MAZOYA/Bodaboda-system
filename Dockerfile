# Multi-stage Dockerfile
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/ .
RUN npm install
RUN npm run build

FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/ .
RUN npm install
RUN npm run build

FROM node:20-alpine
WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules

# Copy frontend
COPY --from=frontend-builder /app/frontend/build ./frontend/build

EXPOSE 8080

CMD ["node", "backend/dist/server.js"]