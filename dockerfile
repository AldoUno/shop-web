# Set the base image to use for the container
FROM node:18.14.2-alpine

# Set the working directory inside the container
WORKDIR /devoluciones-ui

# Copy the rest of the application code to the container
COPY . .

#Install dependencies
RUN npm install

# Expose port 3000, which is the port that Next.js uses by default
EXPOSE 3000
