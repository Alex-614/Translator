# Use an official Maven image as a base image
FROM maven:3.8.4-openjdk-17 AS builder

# Set the working directory
WORKDIR /app

# Copy only the necessary files for dependency resolution
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline

# Copy the entire project
COPY . .

# Build the application
RUN mvn package -DskipTests

# Create the final image
FROM openjdk:17-alpine

# Set the working directory
WORKDIR /app

# Copy the JAR file from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Run the application
CMD ["java", "-jar", "app.jar"]