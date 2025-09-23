# 🌍 Tripflow - AI-Powered Trip Planning Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-success?style=for-the-badge)](https://your-vercel-url.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Live%20Backend-blue?style=for-the-badge)](https://tripflow-backend.onrender.com/api/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/shadab80k/Tripflow-main?style=for-the-badge)](https://github.com/shadab80k/Tripflow-main/stargazers)

> **A modern, full-stack trip planning application that revolutionizes how you plan and manage your adventures. Built with cutting-edge technologies for seamless travel experiences.**

## 🎯 Why Tripflow?

- **🎨 Beautiful UI/UX** - Modern design with Tailwind CSS and Radix UI
- **⚡ Lightning Fast** - Optimized performance with React 19 and FastAPI
- **🌍 Multi-Currency** - Support for 7+ global currencies
- **📱 Responsive** - Perfect experience across all devices
- **🔄 Real-time Sync** - Live updates between frontend and backend
- **🎯 Drag & Drop** - Intuitive activity management

## ✨ Key Features

### 🎯 Trip Management
- **Interactive Trip Planning** - Create and manage multi-day adventures
- **Smart Activity Scheduling** - Drag & drop activities across days
- **Time Conflict Detection** - Visual warnings for overlapping activities
- **Category Organization** - Organize by Food, Sightseeing, Transport, etc.

### 💰 Expense Tracking
- **Multi-Currency Support** - USD, EUR, GBP, INR, JPY, CAD, AUD
- **Real-time Cost Tracking** - Dynamic expense calculation
- **Daily Budget Overview** - Per-day and total expense insights
- **Smart Cost Allocation** - Automatic cost distribution

### 🔧 Technical Excellence
- **Modern Architecture** - Clean separation of concerns
- **RESTful API** - Well-documented FastAPI backend
- **Database Integration** - MongoDB with async operations
- **Production Ready** - Deployed on Render & Vercel

## 🛠️ Tech Stack

### 🎨 Frontend
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)
![Radix UI](https://img.shields.io/badge/Radix%20UI-Latest-161618?style=flat-square)

- **React 19** - Modern UI framework with latest features
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **@dnd-kit** - Modern drag and drop toolkit
- **React Router** - Declarative routing
- **Axios** - Promise-based HTTP client
- **Lucide React** - Beautiful & consistent icons
- **CRACO** - Create React App Configuration Override

### ⚡ Backend
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-009688?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Pydantic](https://img.shields.io/badge/Pydantic-2.6-E92063?style=flat-square)

- **FastAPI** - High-performance, modern Python web framework
- **MongoDB** - NoSQL database with Motor async driver
- **Pydantic** - Data validation using Python type hints
- **Uvicorn** - Lightning-fast ASGI server
- **Motor** - Async MongoDB driver
- **Python-JOSE** - JWT token handling

### 🚀 Deployment & DevOps
![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=flat-square&logo=vercel)
![Render](https://img.shields.io/badge/Render-Backend-46E3B7?style=flat-square&logo=render)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![GitHub Actions](https://img.shields.io/badge/GitHub-Actions-2088FF?style=flat-square&logo=github-actions)

- **Vercel** - Frontend deployment and hosting
- **Render** - Backend API deployment
- **MongoDB Atlas** - Cloud database hosting
- **GitHub** - Version control and CI/CD

## 🏗️ System Architecture

```
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Frontend    │    │   Backend     │    │   Database    │
│   (Vercel)    │────│   (Render)    │────│ (MongoDB)    │
│               │    │               │    │              │
│ React 19      │    │ FastAPI       │    │ Atlas Cloud  │
│ Tailwind CSS  │    │ Python 3.11   │    │ Motor Driver │
│ Radix UI      │    │ Uvicorn       │    │ Async Ops    │
│ @dnd-kit      │    │ Pydantic      │    │ Collections  │
└───────────────┘    └───────────────┘    └───────────────┘
       │                     │                     │
       │                     │                     │
       v                     v                     v
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ User Browser  │    │ API Endpoints │    │   Data Store  │
│ Interactions  │────│ RESTful APIs  │────│ Trips & Acts  │
└───────────────┘    └───────────────┘    └───────────────┘
```

## 🚀 Quick Start

### 📍 Live Demo
- **Frontend**: [Your Vercel URL](https://your-vercel-url.vercel.app)
- **Backend API**: [Render Backend](https://tripflow-backend.onrender.com/api/)
- **API Docs**: [Interactive Documentation](https://tripflow-backend.onrender.com/docs)

### 📛 Prerequisites
- **Node.js** v18+ (LTS recommended)
- **Python** 3.11+ 
- **MongoDB Atlas** account (or local MongoDB)
- **Git** for version control

### 🚀 Local Development Setup

1. **Clone & Navigate**
   ```bash
   git clone https://github.com/shadab80k/Tripflow-main.git
   cd Tripflow-main
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Install dependencies
   pip install -r requirements-prod.txt
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   
   # Start backend server
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Frontend Setup** (New Terminal)
   ```bash
   cd frontend
   
   # Install dependencies
   npm install --legacy-peer-deps
   
   # Create environment file
   cp .env.example .env
   # Edit .env with backend URL
   
   # Start development server
   npm start
   ```

### 🔐 Environment Variables

**Backend** (`backend/.env`):
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/tripflow_dev
DB_NAME=tripflow_dev
CORS_ORIGINS=http://localhost:3000
PYTHON_VERSION=3.11.11
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_BACKEND_URL=http://localhost:8000
WDS_SOCKET_PORT=0
```
   
## 📋 API Documentation

### 🔗 Base URLs
- **Local Development**: `http://localhost:8000/api`
- **Production**: `https://tripflow-backend.onrender.com/api`
- **Interactive Docs**: `https://tripflow-backend.onrender.com/docs`

### 🏠 Core Endpoints

#### Trip Management
```http
GET    /api/trips              # Get all trips
POST   /api/trips              # Create new trip
GET    /api/trips/{trip_id}    # Get trip with details
DELETE /api/trips/{trip_id}    # Delete trip
```

#### Activity Management
```http
POST   /api/trips/{trip_id}/days/{day_id}/activities  # Create activity
PUT    /api/activities/{activity_id}                   # Update activity
DELETE /api/activities/{activity_id}                  # Delete activity
POST   /api/activities/reorder                        # Reorder activities
```

#### System Health
```http
GET    /api/              # API status
GET    /api/health        # Health check
```

### 📝 Request/Response Examples

**Create Trip:**
```json
POST /api/trips
{
  "title": "Tokyo Adventure",
  "date_start": "2024-03-15",
  "date_end": "2024-03-22",
  "currency": "JPY",
  "theme": "blue"
}
```

**Create Activity:**
```json
POST /api/trips/{trip_id}/days/{day_id}/activities
{
  "title": "Visit Tokyo Tower",
  "start_time": "09:00",
  "end_time": "11:00",
  "location_text": "Minato City, Tokyo",
  "category": "sightseeing",
  "cost": 1200.00,
  "notes": "Buy tickets online for discount"
}
```

## 🏢 Project Structure

```
Tripflow-main/
├── 📦 backend/                 # FastAPI Backend
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Development dependencies
│   ├── requirements-prod.txt  # Production dependencies
│   ├── start.sh              # Render start script
│   ├── build.sh              # Render build script
│   └── .env                  # Backend environment variables
│
├── 🎨 frontend/               # React Frontend
│   ├── src/
│   │   ├── App.js            # Main React application
│   │   ├── components/       # Reusable UI components
│   │   │   └── ui/           # Radix UI components
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utility functions
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── craco.config.js       # CRACO configuration
│   └── .env                  # Frontend environment variables
│
├── 🏠 .emergent/              # Emergent deployment config
├── 🧪 tests/                 # Test files
├── 📝 README.md              # Project documentation
├── 📋 DEPLOYMENT.md         # Deployment guide
├── 🤝 CONTRIBUTING.md       # Contributing guidelines
└── 📄 LICENSE               # MIT License
```

## 🚀 Deployment

### 🌐 Production Deployment

**Frontend (Vercel):**
- Automatic deployments from `main` branch
- Environment variables configured
- Custom domain support

**Backend (Render):**
- Auto-deploy from GitHub
- Production MongoDB Atlas
- Health monitoring enabled

### 🔄 Environment-specific URLs

| Environment | Frontend | Backend |
|------------|----------|----------|
| **Production** | [Vercel App](https://your-vercel-url.vercel.app) | [Render API](https://tripflow-backend.onrender.com/api/) |
| **Development** | `http://localhost:3000` | `http://localhost:8000` |

## 👥 Contributing

We welcome contributions! Here's how to get started:

### 🕰️ Quick Contribution Guide

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes
5. **Test** thoroughly
6. **Commit** with descriptive messages: `git commit -m 'Add amazing feature'`
7. **Push** to your fork: `git push origin feature/amazing-feature`
8. **Submit** a Pull Request

### 📝 Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 🐛 Issue Reporting

 Found a bug or have a feature request?

1. **Check** existing issues first
2. **Create** detailed issue with:
   - Clear description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots/videos if helpful
   - Environment details

## 📋 Roadmap

### 🎨 Upcoming Features
- 🔐 **User Authentication** - User accounts and profiles
- 🗺️ **Map Integration** - Interactive maps with locations
- 🌤️ **Weather Integration** - Real-time weather data
- 📱 **Mobile App** - Native iOS/Android applications
- 🤝 **Collaboration** - Share trips with friends
- 📊 **Analytics** - Trip insights and statistics

### 🔧 Technical Improvements
- **Real-time collaboration** with WebSocket support
- **Offline functionality** with PWA capabilities
- **Advanced caching** for improved performance
- **Comprehensive testing** suite expansion

## 📎 Support

- 📚 **Documentation**: Check our [docs](https://github.com/shadab80k/Tripflow-main/wiki)
- 🐛 **Issues**: [GitHub Issues](https://github.com/shadab80k/Tripflow-main/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/shadab80k/Tripflow-main/discussions)
- 📧 **Contact**: [LinkedIn](https://www.linkedin.com/in/shadab80k/)

## 🏆 Acknowledgments

- **React Team** - For the amazing React 19 framework
- **FastAPI** - For the high-performance Python web framework
- **Radix UI** - For accessible, unstyled UI components
- **Tailwind CSS** - For the utility-first CSS framework
- **MongoDB** - For flexible document-based database
- **Vercel & Render** - For excellent deployment platforms

---

<div align="center">

### ⭐ **Star this repo if you found it helpful!** ⭐

**Made with ❤️ by [Mohd Shadab](https://github.com/shadab80k)**

[![GitHub followers](https://img.shields.io/github/followers/shadab80k?style=social)](https://github.com/shadab80k)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=social&logo=linkedin)](https://www.linkedin.com/in/shadab80k/)

</div>

## 📊 API Endpoints

### Trips
- `GET /api/trips` - List all trips
- `POST /api/trips` - Create a new trip
- `GET /api/trips/{trip_id}` - Get trip with details
- `DELETE /api/trips/{trip_id}` - Delete a trip

### Activities
- `POST /api/trips/{trip_id}/days/{day_id}/activities` - Create activity
- `PUT /api/activities/{activity_id}` - Update activity
- `DELETE /api/activities/{activity_id}` - Delete activity
- `POST /api/activities/reorder` - Reorder activities

### Days
- `POST /api/trips/{trip_id}/days` - Create a day

## 🚧 Future Enhancements

- [ ] User authentication and profiles
- [ ] Social sharing of trip itineraries
- [ ] Integration with mapping services
- [ ] Weather information integration
- [ ] Collaboration features for group trips
- [ ] Mobile app development
- [ ] Advanced analytics and insights

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Mohd Shadab**
- GitHub: https://github.com/shadab80k
- LinkedIn: https://www.linkedin.com/in/shadab80k/

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for better trip planning tools
- Thanks to the open-source community for amazing libraries

---

⭐ **Star this repo if you found it helpful!**
