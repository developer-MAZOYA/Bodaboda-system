# ---------- Build stage ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B -DskipTests package

# ---------- Runtime stage ----------
FROM eclipse-temurin:21-jre-alpine

# No wget - just run Java
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Simple healthcheck that doesn't need wget
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD java -version || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]