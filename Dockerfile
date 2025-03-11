# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /srv/www/ewancroft.uk

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]