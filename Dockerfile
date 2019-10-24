# Install node v10
FROM node:10-alpine 

# Set the workdir /var/www/myapp
WORKDIR /var/www/myapp

# Copy the package.json to workdir
COPY app/package.json ./

# Run npm install - install the npm dependencies
RUN npm install

# Copy application source
COPY /app .

# COPY ecosystem.config.js .

# Expose application ports 3000
EXPOSE 3000

# Generate build 

# Start the application
# CMD [ "pm2", "start", "ecosystem.config.js", "--env", "production", "--no-daemon" ]
CMD [ "npm","start"]

