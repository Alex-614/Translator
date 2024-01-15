# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:latest as build

# Set the working directory
WORKDIR /usr/local/app

# Add the source code to app
COPY ./ /usr/local/app/

# Install all the dependencies
RUN npm install --force

# Generate the build of the application
RUN npm run build


# Stage 2: Serve app with nginx server

# Use official nginx image as the base image
FROM nginx:latest

# Copy the build output to replace the default nginx contents.
#RUN mkdir /usr/share/nginx/html/static
COPY --from=build /usr/local/app/dist/browser /usr/share/nginx/html
#RUN mv /usr/share/nginx/html/static/index.html /usr/share/nginx/html/