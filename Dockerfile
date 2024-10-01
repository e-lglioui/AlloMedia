# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port your app runs on (3000)
EXPOSE 3000

# Define environment variable for production
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "app.js"]




