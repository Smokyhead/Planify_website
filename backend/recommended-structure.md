backend/
├── config/                 # Configuration files
│   ├── database.js         # Database configuration
│   └── app.js              # App configuration
├── controllers/            # Route controllers
│   ├── authController.js
│   ├── warehouseController.js
│   ├── storeController.js
│   └── contractController.js
├── middleware/             # Custom middleware
│   ├── auth.js             # Authentication middleware
│   └── errorHandler.js     # Error handling middleware
├── models/                 # Database models
│   ├── User.js
│   ├── Warehouse.js
│   ├── Store.js
│   └── Contract.js
├── routes/                 # Route definitions
│   ├── auth.js
│   ├── warehouses.js
│   ├── stores.js
│   └── contracts.js
├── services/               # Business logic
│   ├── authService.js
│   ├── optimizationService.js
│   └── exportService.js
├── utils/                  # Utility functions
│   ├── logger.js
│   └── helpers.js
├── database/               # Database migrations and seeds
│   ├── migrations/
│   └── seeds/
├── app.js                  # Express app setup
├── server.js               # Server entry point
└── package.json