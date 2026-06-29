# Stage 1: Build the React application
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy package metadata and lockfile
COPY package.json bun.lock ./

# Install dependencies (frozen-lockfile ensures package parity)
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build the app (outputs to /app/dist)
RUN bun run build

# Stage 2: Serve using Nginx
FROM nginx:1.25-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
