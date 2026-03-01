# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Build the Vite application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets to Nginx html directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Optional: Add custom nginx.conf to handle React Router client side routing
# COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
