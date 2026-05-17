# Multi-stage Dockerfile
FROM maven:3.9-eclipse-temurin-21 AS backend-builder
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn clean package -DskipTests

FROM node:24-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/ .
RUN npm install
RUN npm run build

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Copy Spring Boot JAR
COPY --from=backend-builder /app/backend/target/*.jar app.jar

# Copy the entire frontend output (whatever it's called)
COPY --from=frontend-builder /app/frontend ./frontend-build

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]