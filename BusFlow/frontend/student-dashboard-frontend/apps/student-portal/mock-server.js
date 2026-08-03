const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 4000;

// Mock data
const mockStudent = {
  id: 'STU001',
  email: 'student@university.edu',
  firstName: 'Harbin',
  lastName: 'Singh',
  credits: 5,
  enrolledRoutes: [
    { id: 'RT001', name: 'Downtown Route', stops: 8 }
  ]
};

const mockBus = {
  id: 'BUS001',
  busNumber: 'BUS-42',
  status: 'SCHEDULED',
  eta: 12,
  route: 'Downtown Route',
  capacity: {
    total: 30,
    occupied: 23,
    available: 7
  },
  currentLocation: { lat: 40.7128, lng: -74.0060 }
};

const mockTrip = {
  id: 'TRIP001',
  status: 'SCHEDULED',
  scheduledTime: new Date(Date.now() + 30 * 60000).toISOString(),
  pickupStop: { stopName: 'Main Campus Gate', stopOrder: 1 },
  droppingStop: { stopName: 'University Center', stopOrder: 5 },
  busAssignment: 'BUS-42'
};

const mockPickupPoint = {
  stopName: 'Main Campus Gate',
  stopOrder: 1,
  latitude: 40.7128,
  longitude: -74.0060,
  arrivalTime: new Date(Date.now() + 12 * 60000).toISOString()
};

const mockReturnTrip = {
  id: 'TRIP002',
  status: 'SCHEDULED',
  scheduledTime: new Date(Date.now() + 8 * 3600000).toISOString(),
  pickupStop: { stopName: 'University Center', stopOrder: 5 },
  droppingStop: { stopName: 'Residential Area', stopOrder: 1 }
};

const mockNotifications = [
  {
    id: 'NOTIF001',
    title: 'Bus Arriving Soon',
    message: 'Bus-42 will arrive at your pickup point in 12 minutes',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    type: 'BUS_ARRIVAL'
  },
  {
    id: 'NOTIF002',
    title: 'Schedule Update',
    message: 'Your return trip has been scheduled for 5:30 PM',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    type: 'SCHEDULE_UPDATE'
  }
];

const mockMissedBus = null; // No missed bus today

// === AUTHENTICATION ===
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Email and password are required'
      }
    });
  }

  if (email === 'student@university.edu' && password === 'password123') {
    return res.status(200).json({
      success: true,
      data: {
        accessToken: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        student: mockStudent
      }
    });
  }

  res.status(401).json({
    error: {
      code: 'UNAUTHORIZED',
      message: 'Invalid credentials'
    }
  });
});

app.post('/auth/refresh', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid token'
      }
    });
  }

  res.status(200).json({
    success: true,
    data: {
      accessToken: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now()
    }
  });
});

app.post('/auth/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// === MIDDLEWARE: Check Authentication ===
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }

  next();
};

// === STUDENT PROFILE ===
app.get('/students/profile', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    data: mockStudent
  });
});

// === TODAY'S BUS ===
app.get('/students/today-bus', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    data: mockBus
  });
});

// === TODAY'S TRIP ===
app.get('/students/today-trip', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    data: mockTrip
  });
});

// === PICKUP POINT ===
app.get('/students/pickup-point', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    data: mockPickupPoint
  });
});

// === RETURN TRIP ===
app.get('/students/return-trip', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    data: mockReturnTrip
  });
});

// === NOTIFICATIONS ===
app.get('/students/notifications', requireAuth, (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  res.status(200).json({
    success: true,
    data: mockNotifications.slice(0, limit)
  });
});

// === MISSED BUS ===
app.get('/students/missed-bus', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    data: mockMissedBus
  });
});

// === MISSED BUS REQUEST ===
app.post('/students/missed-bus/request', requireAuth, (req, res) => {
  const { busId } = req.body;

  if (!busId) {
    return res.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Bus ID is required'
      }
    });
  }

  res.status(200).json({
    success: true,
    message: 'Switched to bus successfully',
    data: {
      busId,
      timestamp: new Date().toISOString()
    }
  });
});

// === ISSUE REPORTING ===
app.post('/students/report-issue', requireAuth, (req, res) => {
  const { title, description, category } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Title and description are required'
      }
    });
  }

  res.status(201).json({
    success: true,
    message: 'Issue reported successfully',
    data: {
      issueId: 'ISSUE_' + Date.now(),
      status: 'OPEN',
      createdAt: new Date().toISOString()
    }
  });
});

// === ERROR HANDLING ===
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n✅ Mock API Server running on http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST   /auth/login`);
  console.log(`  POST   /auth/refresh`);
  console.log(`  POST   /auth/logout`);
  console.log(`  GET    /students/profile`);
  console.log(`  GET    /students/today-bus`);
  console.log(`  GET    /students/today-trip`);
  console.log(`  GET    /students/pickup-point`);
  console.log(`  GET    /students/return-trip`);
  console.log(`  GET    /students/notifications`);
  console.log(`  GET    /students/missed-bus`);
  console.log(`  POST   /students/missed-bus/request`);
  console.log(`  POST   /students/report-issue\n`);
});
