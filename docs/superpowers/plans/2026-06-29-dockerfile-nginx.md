# Docker Containerization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a multi-stage Dockerfile and custom Nginx configuration to containerize and serve the React + TypeScript + Vite application.

**Architecture:** A multi-stage Docker build is used. Stage 1 compiles the application using the fast `oven/bun:1-alpine` image to leverage the existing lockfile. Stage 2 copies the compiled assets and a custom Nginx configuration with single-page application fallback routing into `nginx:alpine` for production-grade static serving.

**Tech Stack:** Docker, Bun, Nginx

## Global Constraints

* Multi-stage build using alpine images
* Serve via Nginx with custom SPA fallback config
* Exclude build/local assets using .dockerignore

---

### Task 1: Create Nginx Configuration

**Files:**
- Create: `nginx.conf`

**Interfaces:**
- Consumes: None
- Produces: `nginx.conf` used by Nginx image in the run stage.

- [ ] **Step 1: Write nginx.conf**

Create the file `nginx.conf` in the project root with the following content:
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

- [ ] **Step 2: Commit Nginx config**
Run:
```bash
git add nginx.conf
git commit -m "chore: add nginx.conf with SPA fallback routing"
```

### Task 2: Create Dockerignore File

**Files:**
- Create: `.dockerignore`

**Interfaces:**
- Consumes: None
- Produces: `.dockerignore` filter to limit build context size.

- [ ] **Step 1: Write .dockerignore**

Create the file `.dockerignore` in the project root:
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

- [ ] **Step 2: Commit .dockerignore**
Run:
```bash
git add .dockerignore
git commit -m "chore: add .dockerignore to optimize docker build context"
```

### Task 3: Create Dockerfile

**Files:**
- Create: `Dockerfile`

**Interfaces:**
- Consumes: `nginx.conf`, `.dockerignore`, `package.json`, `bun.lock`
- Produces: `Dockerfile` containing instructions for the image build.

- [ ] **Step 1: Write Dockerfile**

Create `Dockerfile` in the project root:
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

- [ ] **Step 2: Commit Dockerfile**
Run:
```bash
git add Dockerfile
git commit -m "feat: add multi-stage Dockerfile with Bun and Nginx"
```

### Task 4: Verify Docker Build and Container Run

**Files:**
- Modify: None (verification task)

**Interfaces:**
- Consumes: `Dockerfile`, `nginx.conf`, `.dockerignore`
- Produces: Running container at `http://localhost:8080`

- [ ] **Step 1: Build the Docker image**
Run:
```bash
docker build -t jdt-pokemon-app .
```
Expected: Succeeds without errors, creating image `jdt-pokemon-app`.

- [ ] **Step 2: Run the Docker container**
Run:
```bash
docker run -d -p 8080:80 --name jdt-pokemon-container jdt-pokemon-app
```
Expected: Output container ID.

- [ ] **Step 3: Test access and routing fallback**
Run:
```bash
curl -I http://localhost:8080/
```
Expected: HTTP 200 OK.
Run:
```bash
curl -I http://localhost:8080/non-existent-route
```
Expected: HTTP 200 OK (due to fallback routing serving index.html instead of 404).

- [ ] **Step 4: Clean up container**
Run:
```bash
docker rm -f jdt-pokemon-container
```
Expected: Container stopped and removed.
