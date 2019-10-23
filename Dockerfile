# Install node v10
FROM node:10

# Set the workdir /var/www/myapp
WORKDIR /var/www/myapp

# Copy the package.json to workdir
COPY app/package.json ./

# Run npm install - install the npm dependencies
RUN npm install

# Copy application source
COPY /app .

# Expose application ports - (4300 - for API and 4301 - for front end)
EXPOSE 3000

# Generate build
RUN npm install 

# Start the application
CMD ["npm", "run","start"]
