# Use an official Node runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container 
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the rest of the frontend directory contents into the container
COPY . .

# Make port 5173 available to the world outside this container
EXPOSE 5173

# Run npm start command when the container launches
CMD ["npm", "run", "dev", "--", "--host"]