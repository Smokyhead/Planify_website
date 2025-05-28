# Planify Backend - Delivery Planning System

A modular, scalable backend API for the Planify delivery planning and optimization system.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14.0.0
- MySQL 5.7+ or 8.0+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start the server
npm start

# For development (same as start for now)
npm run dev

# Run legacy version (old monolithic structure)
npm run legacy
```

### Health Check
```bash
# Check if server is running
curl http://localhost:3001/health

# Or use npm script
npm run check-health
```

## 📁 Project Structure

```
backend/
├── config/                 # Configuration files
│   ├── database.js         # Database connection setup
│   └── app.js              # Application configuration
├── controllers/            # Route controllers (request/response handling)
│   ├── authController.js
│   ├── warehouseController.js
│   ├── storeController.js
│   ├── contractController.js
│   ├── optimizationController.js
│   ├── dashboardController.js
│   └── exportController.js
├── middleware/             # Custom middleware
│   ├── auth.js             # JWT authentication
│   ├── errorHandler.js     # Error handling
│   └── validation.js       # Request validation
├── routes/                 # Route definitions
│   ├── auth.js
│   ├── warehouses.js
│   ├── stores.js
│   ├── contracts.js
│   ├── optimization.js
│   ├── dashboard.js
│   └── export.js
├── services/               # Business logic layer
│   ├── authService.js
│   ├── optimizationService.js
│   ├── exportService.js
│   └── dashboardService.js
├── utils/                  # Utility functions
│   ├── logger.js           # Logging utility
│   └── helpers.js          # Common helper functions
├── app.js                  # Express app setup
├── server.js               # Server entry point
├── index.js                # Legacy monolithic file (backup)
└── package.json
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=planify
DB_CONNECTION_LIMIT=10
DB_ACQUIRE_TIMEOUT=60000
DB_TIMEOUT=60000

# JWT Configuration
JWT_SECRET=planify_secret_key_2025
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=*

# Optimization Configuration
MAX_DAILY_DISTANCE=600
DEFAULT_UNLOADING_TIME=30
DEFAULT_OPENING_HOURS=08:00:00
DEFAULT_CLOSING_HOURS=21:00:00

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=combined
```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:3001/api`
- Health Check: `http://localhost:3001/health`

### Authentication
All API endpoints (except login and health check) require JWT authentication:
```
Authorization: Bearer <your-jwt-token>
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

#### Warehouses
- `GET /api/warehouses` - Get all warehouses
- `GET /api/warehouses/:id` - Get warehouse by ID
- `POST /api/warehouses` - Create warehouse
- `PUT /api/warehouses/:id` - Update warehouse
- `DELETE /api/warehouses/:id` - Delete warehouse (soft delete)

#### Stores
- `GET /api/stores` - Get all stores
- `GET /api/stores/:id` - Get store by ID
- `POST /api/stores` - Create store
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store (soft delete)

#### Contracts
- `GET /api/contracts` - Get all contracts
- `GET /api/contracts/:id` - Get contract by ID
- `POST /api/contracts` - Create contract
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract (soft delete)

#### Optimization
- `POST /api/optimization/calculate-distances` - Calculate distances
- `POST /api/optimization/generate-schedule` - Generate delivery schedule
- `GET /api/optimization/runs` - Get optimization history
- `GET /api/optimization/schedules/:week/:year` - Get schedules for week
- `GET /api/optimization/test-schedule` - Test endpoint

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/warehouse/:id/metrics` - Get warehouse metrics
- `GET /api/dashboard/delivery-trends` - Get delivery trends
- `GET /api/dashboard/health` - Get system health

#### Export
- `POST /api/export/schedule` - Export schedule data
- `GET /api/export/optimization-runs` - Export optimization runs
- `GET /api/export/dashboard-stats` - Export dashboard stats
- `GET /api/export/formats` - Get available export formats

### Legacy API Compatibility
The new modular structure maintains backward compatibility with the original API endpoints:
- All original endpoints (e.g., `/api/login`, `/api/get-warehouses`) still work
- Legacy routes are automatically mapped to new modular routes
- No changes required in existing frontend code

## 🏗️ Architecture

### Design Principles
1. **Separation of Concerns** - Each layer has a specific responsibility
2. **Modularity** - Features are organized in separate modules
3. **Scalability** - Easy to add new features and scale
4. **Maintainability** - Clean, readable, and well-documented code
5. **Error Handling** - Comprehensive error handling and logging
6. **Security** - JWT authentication and input validation

### Layer Responsibilities
- **Routes** - Define API endpoints and HTTP methods
- **Controllers** - Handle HTTP requests/responses and validation
- **Services** - Contain business logic and data processing
- **Models** - Database interactions (using raw SQL for now)
- **Middleware** - Cross-cutting concerns (auth, validation, logging)
- **Utils** - Shared utility functions and helpers

## 🔍 Logging

The application uses a custom logging utility that:
- Logs to console in development
- Structured JSON logging in production
- Includes request tracking and user context
- Supports different log levels (info, warn, error, debug)

## 🛡️ Security Features

- JWT token authentication
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Error message sanitization
- Request rate limiting (can be added)

## 🚀 Deployment

### Production Checklist
1. Set `NODE_ENV=production`
2. Configure proper database credentials
3. Set strong JWT secret
4. Configure CORS for your domain
5. Set up proper logging
6. Configure reverse proxy (nginx)
7. Set up SSL/TLS certificates
8. Configure monitoring and health checks

### Docker Support (Future)
```dockerfile
# Dockerfile example for future use
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🧪 Testing

Currently, testing is not implemented but can be added:
```bash
# Future testing commands
npm test              # Run all tests
npm run test:unit     # Run unit tests
npm run test:integration  # Run integration tests
npm run test:coverage     # Run with coverage
```

## 📈 Performance

### Optimization Features
- Connection pooling for database
- Efficient SQL queries
- Haversine formula for distance calculations
- Optimized delivery scheduling algorithm
- Graceful shutdown handling

### Monitoring
- Health check endpoint
- System metrics in dashboard
- Request logging
- Error tracking

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include logging for important operations
4. Validate all inputs
5. Update documentation
6. Test your changes

## 📝 Migration from Legacy

The refactoring maintains full backward compatibility:
1. Original `index.js` is preserved as backup
2. All existing API endpoints continue to work
3. New modular structure provides better maintainability
4. Legacy routes automatically redirect to new handlers
5. No frontend changes required

To switch between versions:
```bash
# Use new modular structure (recommended)
npm start

# Use legacy monolithic structure
npm run legacy
```
