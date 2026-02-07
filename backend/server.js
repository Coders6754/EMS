const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const { initializeFixedUsers } = require('./utils/initUsers');
const { initializeDefaultDepartments } = require('./utils/initDepartments');

const app = express();

app.use(cors());
app.use(express.json());

// Initialize database connection and setup (runs once per cold start)
let initPromise = null;
const initializeApp = async () => {
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      await connectDB();
      // Run initialization in background (don't block requests)
      initializeFixedUsers().catch(err => console.error('User init error:', err));
      initializeDefaultDepartments().catch(err => console.error('Dept init error:', err));
    } catch (err) {
      console.error('Database initialization error:', err);
      // Don't throw - allow function to handle requests even if DB init fails
    }
  })();
  
  return initPromise;
};

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await initializeApp();
  } catch (err) {
    // Log error but continue - let routes handle DB errors
    console.error('DB connection failed:', err.message);
  }
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'EMS Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      employees: '/api/employees',
      departments: '/api/departments',
      projects: '/api/projects',
      invoices: '/api/invoices',
      leaves: '/api/leaves',
      reports: '/api/reports',
      dashboard: '/api/dashboard',
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/dashboard', require('./routes/dashboard'));

// For Vercel serverless - export the app
module.exports = app;

// For local development - start the server
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  
  connectDB().then(async () => {
    await initializeFixedUsers();
    await initializeDefaultDepartments();
    
    const server = app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please either:`);
        process.exit(1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
