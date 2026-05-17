# Multi-stage Dockerfile
# Stage 1: Build Spring Boot backend with JDK 21
FROM maven:3.9-eclipse-temurin-21 AS backend-builder
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Build Node.js frontend with Node 24
FROM node:24-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/ .
RUN npm install
RUN npm run build

# Stage 3: Final runtime with JDK 21
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Copy Spring Boot JAR
COPY --from=backend-builder /app/backend/target/*.jar app.jar

# Copy frontend build files to be served by Spring Boot
COPY --from=frontend-builder /app/frontend/build ./src/main/resources/static

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]