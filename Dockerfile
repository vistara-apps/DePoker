FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose ports
EXPOSE 3000 3001 3002

# Default command (can be overridden)
CMD ["npm", "run", "dealer"]
