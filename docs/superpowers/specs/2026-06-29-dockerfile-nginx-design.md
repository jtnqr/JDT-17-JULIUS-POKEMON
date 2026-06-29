# Design Document: Docker containerization with Bun and Nginx

This design document outlines the configuration and structure for containerizing the React + Vite frontend application.

## 1. Requirements & Goals

* **Fast Builds:** Utilize the existing `bun.lock` for ultra-fast dependency installation and build times.
* **Production-Ready Web Server:** Use Nginx to serve the compiled static files efficiently.
* **SPA Routing Support:** Configure Nginx to support client-side routing (React Router) by falling back to `index.html` on 404s.
* **Optimized Image Size:** Use lightweight Alpine base images (`oven/bun:1-alpine` and `nginx:alpine`).
* **Clean Context:** Exclude local files, build artifacts, and sensitive files from the Docker context using `.dockerignore`.

## 2. File Specifications

### 2.1. Nginx Configuration (`nginx.conf`)
Located at: `nginx.conf` (in the project root)

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Enable compression for faster page load
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 2.2. Dockerfile (`Dockerfile`)
Located at: `Dockerfile` (in the project root)

```dockerfile
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
```

### 2.3. Docker Ignore File (`.dockerignore`)
Located at: `.dockerignore` (in the project root)

```ignore
node_modules
dist
.git
.agents
.playwright-mcp
.superpowers
screenshots
README.md
```

## 3. Verification Plan

1. **Verify files creation:** Ensure `Dockerfile`, `nginx.conf`, and `.dockerignore` are written correctly.
2. **Build Docker Image:** Run `docker build -t jdt-pokemon-app .` to verify that the build succeeds without error.
3. **Run Container:** Run `docker run -d -p 8080:80 --name jdt-pokemon-container jdt-pokemon-app`.
4. **Test Routing:** Access `http://localhost:8080` in a browser or via `curl` to ensure it serves the app, and test any sub-routes to verify SPA routing fallback redirects to `index.html`.
