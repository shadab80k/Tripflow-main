# 🚀 Deployment Guide

This guide covers different deployment options for the Tripflow application.

## 📋 Prerequisites

- Domain name (optional but recommended)
- SSL certificate (for production)
- Database hosting (MongoDB Atlas or self-hosted)

## 🌐 Deployment Options

### Option 1: Vercel + Railway (Recommended)

#### Frontend (Vercel)
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set environment variables:
   ```
   REACT_APP_BACKEND_URL=https://your-backend.railway.app
   WDS_SOCKET_PORT=0
   ```
4. Deploy automatically on push

#### Backend (Railway)
1. Connect your GitHub repo to Railway
2. Set environment variables:
   ```
   MONGO_URL=mongodb://your-mongodb-connection-string
   DB_NAME=tripflow_prod
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
3. Deploy automatically

### Option 2: Heroku

#### Frontend
```bash
# Install Heroku CLI
npm install -g heroku

# Create Heroku app
heroku create your-app-frontend

# Set environment variables
heroku config:set REACT_APP_BACKEND_URL=https://your-backend-app.herokuapp.com

# Deploy
git push heroku main
```

#### Backend
```bash
# Create Heroku app
heroku create your-app-backend

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set CORS_ORIGINS=https://your-frontend-app.herokuapp.com

# Deploy
git push heroku main
```

### Option 3: DigitalOcean Droplet

#### Server Setup
```bash
# Create Ubuntu 20.04 droplet
# SSH into the server

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python
sudo apt install python3 python3-pip -y

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install pm2@latest -g
```

#### Application Deployment
```bash
# Clone repository
git clone https://github.com/yourusername/tripflow.git
cd tripflow

# Backend setup
cd backend
pip3 install -r requirements.txt
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8000" --name tripflow-backend

# Frontend setup
cd ../frontend
npm install --legacy-peer-deps
npm run build
```

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/tripflow
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/tripflow/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tripflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 4: Docker Deployment

#### Create Dockerfiles

**Backend Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - MONGO_URL=mongodb://root:password@mongodb:27017
      - DB_NAME=tripflow_prod
      - CORS_ORIGINS=http://localhost:3000
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8000
    depends_on:
      - backend

volumes:
  mongodb_data:
```

## 🔧 Environment Variables

### Production Backend (.env)
```
MONGO_URL=mongodb://your-production-mongo-url
DB_NAME=tripflow_prod
CORS_ORIGINS=https://your-frontend-domain.com
```

### Production Frontend (.env)
```
REACT_APP_BACKEND_URL=https://your-backend-domain.com
WDS_SOCKET_PORT=0
```

## 🔒 Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up proper firewall rules
- [ ] Regular security updates
- [ ] Monitor application logs
- [ ] Set up backup strategies

## 📊 Monitoring

### Health Check Endpoints
- Backend: `GET /api/` should return `{"message": "Tripflow API is running!"}`
- Frontend: Check if homepage loads correctly

### Logging
```bash
# PM2 logs
pm2 logs tripflow-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: echo "Deploy backend"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: echo "Deploy frontend"
```

## 🆘 Troubleshooting

### Common Issues
1. **CORS Errors**: Check CORS_ORIGINS environment variable
2. **Database Connection**: Verify MongoDB connection string
3. **Build Failures**: Check Node.js version compatibility
4. **Port Conflicts**: Ensure ports 3000 and 8000 are available

### Useful Commands
```bash
# Check server status
pm2 status

# Restart services
pm2 restart tripflow-backend

# Check logs
pm2 logs --lines 100

# Monitor resources
pm2 monit
```

---

Need help? Check the main README.md or create an issue on GitHub!
