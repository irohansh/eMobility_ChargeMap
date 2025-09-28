# <div align="center">eMobility ChargeMap</div>

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7+-green.svg)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)](https://github.com/your-org/chargemap)

### What Makes Us Different

- **Intelligence First**: AI-powered recommendations that learn from your driving patterns
- **Zero Friction**: Book, charge, and go—all in under 30 seconds
- **Always Available**: Real-time updates ensure you never arrive at a full station
- **Built for Scale**: Enterprise-grade architecture that grows with your needs

---

## Core Features

### Smart Station Management
- **Live Status Updates**: Real-time monitoring of all charging stations
- **Multi-Connector Support**: Type 2, CCS, and CHAdeMO compatibility
- **Geographic Intelligence**: Google Maps integration with precise location data
- **Dynamic Power Management**: Intelligent load balancing and allocation

### Seamless User Experience
- **One-Click Booking**: Advanced slot management with zero conflicts
- **Smart Recommendations**: AI-powered suggestions based on location and range
- **Instant Authentication**: JWT security with persistent sessions
- **Mobile-First Design**: Beautiful, responsive interface for every device

### Advanced Analytics
- **Real-Time Insights**: Live occupancy and usage pattern tracking
- **Performance Metrics**: Energy consumption and efficiency analysis
- **Predictive Maintenance**: Automated alerts for optimal station health

---

## Technology Stack

### Backend Excellence
- **Runtime**: Node.js 18+ with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security**: JWT with bcrypt password hashing
- **Communication**: Nodemailer with beautiful HTML templates
- **Maps**: Google Maps API for geolocation services

### Frontend Innovation
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for lightning-fast development
- **UI Library**: Shadcn/ui with Tailwind CSS
- **State Management**: React Context API with localStorage persistence
- **Navigation**: React Router DOM with protected routes

### Infrastructure Ready
- **Database**: MongoDB with geospatial indexing for location queries
- **Security**: CORS protection, input validation, and rate limiting

---

## Quick Start

### Prerequisites
- Node.js 18 or higher
- MongoDB 5.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/chargemap.git
   cd chargemap
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   npm install
   
   # Frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   npm start
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```


---

## API Reference

### Authentication
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User authentication
```

### Stations
```
GET  /api/stations                    # List all stations
GET  /api/stations/:id               # Get station details
GET  /api/stations/:id/route         # Get directions to station
POST /api/stations/recommendations   # Get smart recommendations
GET  /api/stations/:id/slots         # Check availability
```

### Bookings
```
POST   /api/bookings              # Create new booking
DELETE /api/bookings/:id          # Cancel booking
POST   /api/bookings/:id/complete # Mark as completed
```

### User Management
```
GET /api/users/me/bookings  # Get user's bookings
PUT /api/users/me/profile   # Update user profile
```

### Reviews
```
POST /api/reviews  # Submit station review
```

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/chargemap

# Security
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=5h

# Email Service
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Database Setup

The application automatically creates the necessary collections and indexes on first run. For production, ensure MongoDB is properly configured with authentication and SSL.

---

## Development

### Project Structure
```
chargemap/
├── src/                    # Backend source code
│   ├── controllers/        # Route handlers
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   ├── middleware/        # Custom middleware
│   └── config/            # Configuration files
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API client
│   │   └── hooks/         # Custom hooks
│   └── public/            # Static assets
└── docs/                  # Documentation
```

### Available Scripts

**Backend:**
```bash
npm start          # Start development server
npm run build      # Build for production
```

**Frontend:**
```bash
npm run dev        # Start development server
npm run build      # Build for production
```

---

## Roadmap

### Phase 2 - Advanced Analytics
- **Machine Learning Integration**: Predictive analytics for demand forecasting
- **Advanced Reporting**: Custom dashboard with real-time charts
- **API Rate Limiting**: Enhanced security with request throttling
- **WebSocket Support**: Real-time updates for station status

### Phase 3 - Enterprise Features
- **Multi-tenant Architecture**: Support for multiple charging networks
- **Payment Integration**: Stripe/PayPal integration for booking payments

### Phase 4 - Scalability
- **Microservices Architecture**: Service decomposition for better scalability
- **Redis Caching**: High-performance caching layer
- **CDN Integration**: Global content delivery optimization
- **Kubernetes Deployment**: Container orchestration for production
- **Docker Deployment**: Docker-ready with environment-based configuration

---

## Security

- **Authentication**: JWT tokens with configurable expiration
- **Password Security**: bcrypt hashing with salt rounds
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin resource sharing
- **Rate Limiting**: API endpoint protection against abuse
- **Environment Security**: Secure handling of sensitive configuration

---

## Performance

- **Database Optimization**: Indexed queries for fast data retrieval
- **Frontend Optimization**: Code splitting and lazy loading
- **Caching Strategy**: Intelligent caching for frequently accessed data
- **Image Optimization**: Compressed assets for faster loading
- **Bundle Analysis**: Optimized JavaScript bundles

---

## Contributing

We welcome contributions from the community. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR

---
