# 🌍 Tripflow - Plan Your Perfect Adventure

A modern, full-stack trip planning application built with React and FastAPI. Create detailed itineraries, manage activities with drag-and-drop functionality, and track expenses across multiple currencies.

## ✨ Features

### 🎯 Core Functionality
- **Interactive Trip Planning**: Create and manage multi-day trips
- **Drag & Drop Activities**: Intuitive activity scheduling across days
- **Multi-Currency Support**: Support for USD ($), EUR (€), GBP (£), INR (₹), JPY (¥), CAD ($), AUD ($)
- **Real-time Cost Tracking**: Dynamic expense calculation per day and total
- **Activity Categories**: Organize activities by type (Food, Sightseeing, Transport, etc.)
- **Time Conflict Detection**: Visual warnings for overlapping activities

### 🔧 Technical Features
- **Responsive Design**: Works seamlessly across desktop and mobile
- **Modern UI/UX**: Built with Tailwind CSS and Radix UI components
- **RESTful API**: FastAPI backend with automatic API documentation
- **Real-time Updates**: Live synchronization between frontend and backend

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **@dnd-kit** - Drag and drop functionality
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database with Motor async driver
- **Pydantic** - Data validation and settings management
- **Uvicorn** - Lightning-fast ASGI server
- **Python 3.13** - Latest Python features

### Development Tools
- **CRACO** - Create React App Configuration Override
- **ESLint** - Code linting
- **Git** - Version control
- **PowerShell** - Automation scripts

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (3.8 or higher)
- **MongoDB** (local or cloud instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tripflow.git
   cd tripflow
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   ```

4. **Environment Configuration**
   
   Backend (`backend/.env`):
   ```
   MONGO_URL="mongodb://localhost:27017"
   DB_NAME="tripflow_dev"
   CORS_ORIGINS="*"
   ```
   
   Frontend (`frontend/.env`):
   ```
   REACT_APP_BACKEND_URL=http://localhost:8000
   WDS_SOCKET_PORT=0
   ```
   
## 🏗️ Project Structure

```
tripflow/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Backend configuration
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main React application
│   │   ├── components/   # Reusable UI components
│   │   └── hooks/        # Custom React hooks
│   ├── public/           # Static assets
│   ├── package.json      # Node.js dependencies
│   └── .env             # Frontend configuration
├── start-tripflow.ps1    # Startup script
└── README.md            # Project documentation
```

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
