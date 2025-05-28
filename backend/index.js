// Keep original file as backup - this will be replaced by the new modular structure
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "planify_secret_key_2025";

app.use(cors());
app.use(express.json()); // important to parse JSON body

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root", // MySQL root password
  database: "planify", // replace with actual DB name
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL");
  connection.release();
});

// **********authentication********** //

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Login query error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = results[0];

    // For demo purposes, accept "password123" or check hashed password
    const isValidPassword = password === "password123" ||
      (user.password && await bcrypt.compare(password, user.password));

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last_login timestamp
    const updateLoginQuery = "UPDATE users SET last_login = NOW() WHERE id = ?";
    db.query(updateLoginQuery, [user.id], (updateErr) => {
      if (updateErr) {
        console.error("Update last_login error:", updateErr);
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  });
});

app.get("/api/profile", authenticateToken, (req, res) => {
  const query = "SELECT id, email, name, created_at, last_login, phone, department, role FROM users WHERE id = ?";
  db.query(query, [req.user.id], (err, results) => {
    if (err) {
      console.error("Profile query error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results[0]);
  });
});

// Update user profile
app.put("/api/profile", authenticateToken, (req, res) => {
  const { name, email, phone, department, role } = req.body;
  const userId = req.user.id;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  // Check if email is already taken by another user
  const checkEmailQuery = "SELECT id FROM users WHERE email = ? AND id != ?";
  db.query(checkEmailQuery, [email, userId], (err, results) => {
    if (err) {
      console.error("Email check error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Update user profile
    const updateQuery = `
      UPDATE users
      SET name = ?, email = ?, phone = ?, department = ?, role = ?
      WHERE id = ?
    `;

    db.query(updateQuery, [name, email, phone, department, role, userId], (err, result) => {
      if (err) {
        console.error("Profile update error:", err);
        return res.status(500).json({ error: "Failed to update profile" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: "Profile updated successfully",
        user: { id: userId, name, email, phone, department, role }
      });
    });
  });
});

// Change password
app.put("/api/change-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current password and new password are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters long" });
  }

  // Get current user data
  const getUserQuery = "SELECT password FROM users WHERE id = ?";
  db.query(getUserQuery, [userId], async (err, results) => {
    if (err) {
      console.error("Get user error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];

    // Verify current password
    const isValidPassword = currentPassword === "password123" ||
      (user.password && await bcrypt.compare(currentPassword, user.password));

    if (!isValidPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const updatePasswordQuery = "UPDATE users SET password = ? WHERE id = ?";
    db.query(updatePasswordQuery, [hashedNewPassword, userId], (err, result) => {
      if (err) {
        console.error("Password update error:", err);
        return res.status(500).json({ error: "Failed to update password" });
      }

      res.json({ message: "Password updated successfully" });
    });
  });
});

// **********warehouse********** //

app.post("/api/add-warehouse", (req, res) => {
  const { code, location, capacity_km, schedule, gps_lat, gps_lng } = req.body;

  if (!code || !location || !capacity_km || !schedule) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO warehouses (code, location, capacity_km, schedule, gps_lat, gps_lng, active_status)
    VALUES (?, ?, ?, ?, ?, ?, TRUE)
  `;

  db.query(query, [code, location, capacity_km, schedule, gps_lat, gps_lng], (err, result) => {
    if (err) {
      console.error("Database insert error:", err);
      return res.status(500).json({ error: "Failed to add warehouse" });
    }

    res.status(201).json({
      message: "Warehouse added successfully",
      id: result.insertId,
    });
  });
});

app.get("/api/get-warehouses", (req, res) => {
  const includeInactive = req.query.include_inactive === 'true';

  let query = "SELECT * FROM warehouses";

  if (!includeInactive) {
    query += " WHERE active_status = TRUE OR active_status IS NULL";
  }

  query += " ORDER BY created_at DESC";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching warehouses:", err);
      return res.status(500).json({ error: "Failed to fetch warehouses" });
    }
    res.json(results);
  });
});

// Get single warehouse by ID
app.get("/api/get-warehouse/:id", (req, res) => {
  const warehouseId = req.params.id;

  const query = "SELECT * FROM warehouses WHERE id = ?";

  db.query(query, [warehouseId], (err, results) => {
    if (err) {
      console.error("Error fetching warehouse:", err);
      return res.status(500).json({ error: "Failed to fetch warehouse" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Warehouse not found" });
    }

    res.json(results[0]);
  });
});

// Update warehouse
app.put("/api/update-warehouse/:id", (req, res) => {
  const warehouseId = req.params.id;
  const { code, location, capacity_km, schedule, gps_lat, gps_lng, active_status } = req.body;

  if (!code || !location || !capacity_km || !schedule) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    UPDATE warehouses
    SET code = ?, location = ?, capacity_km = ?, schedule = ?, gps_lat = ?, gps_lng = ?, active_status = ?
    WHERE id = ?
  `;

  const activeStatusValue = active_status !== undefined ? active_status : true;

  db.query(query, [code, location, capacity_km, schedule, gps_lat, gps_lng, activeStatusValue, warehouseId], (err, result) => {
    if (err) {
      console.error("Database update error:", err);
      return res.status(500).json({ error: "Failed to update warehouse" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Warehouse not found" });
    }

    res.json({
      message: "Warehouse updated successfully",
      id: warehouseId,
    });
  });
});

// Delete warehouse (soft delete by setting active_status to false)
app.delete("/api/delete-warehouse/:id", (req, res) => {
  const warehouseId = req.params.id;

  const query = `
    UPDATE warehouses
    SET active_status = FALSE
    WHERE id = ?
  `;

  db.query(query, [warehouseId], (err, result) => {
    if (err) {
      console.error("Database delete error:", err);
      return res.status(500).json({ error: "Failed to delete warehouse" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Warehouse not found" });
    }

    res.json({
      message: "Warehouse deleted successfully",
      id: warehouseId,
    });
  });
});

// **********stores********** //

app.get("/api/get-stores", (req, res) => {
  const includeInactive = req.query.include_inactive === 'true';

  let query = `
    SELECT s.*, c.contract_type, c.frequency_per_week, c.active_status as contract_active
    FROM stores s
    LEFT JOIN contracts c ON s.id = c.store_id AND c.active_status = TRUE
  `;

  if (!includeInactive) {
    query += ` WHERE s.active_status = TRUE OR s.active_status IS NULL`;
  }

  query += ` ORDER BY s.active_status DESC, s.code`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching stores:", err);
      return res.status(500).json({ error: "Failed to fetch stores" });
    }
    res.json(results);
  });
});

// Get single store by ID
app.get("/api/get-store/:id", (req, res) => {
  const storeId = req.params.id;

  const query = `
    SELECT s.*, c.contract_type, c.frequency_per_week, c.active_status as contract_active
    FROM stores s
    LEFT JOIN contracts c ON s.id = c.store_id AND c.active_status = TRUE
    WHERE s.id = ?
  `;

  db.query(query, [storeId], (err, results) => {
    if (err) {
      console.error("Error fetching store:", err);
      return res.status(500).json({ error: "Failed to fetch store" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json(results[0]);
  });
});

app.post("/api/add-store", (req, res) => {
  const { code, name, address, gps_lat, gps_lng, opening_hours, closing_hours, unloading_time_minutes } = req.body;

  if (!code || !name || !address || !gps_lat || !gps_lng) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO stores (code, name, address, gps_lat, gps_lng, opening_hours, closing_hours, unloading_time_minutes, active_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
  `;

  db.query(query, [code, name, address, gps_lat, gps_lng, opening_hours || '08:00:00', closing_hours || '21:00:00', unloading_time_minutes || 30], (err, result) => {
    if (err) {
      console.error("Database insert error:", err);
      return res.status(500).json({ error: "Failed to add store" });
    }

    res.status(201).json({
      message: "Store added successfully",
      id: result.insertId,
    });
  });
});

// Update store
app.put("/api/update-store/:id", (req, res) => {
  const storeId = req.params.id;
  const { code, name, address, gps_lat, gps_lng, opening_hours, closing_hours, unloading_time_minutes, active_status } = req.body;

  if (!code || !name || !address || !gps_lat || !gps_lng) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    UPDATE stores
    SET code = ?, name = ?, address = ?, gps_lat = ?, gps_lng = ?, opening_hours = ?, closing_hours = ?, unloading_time_minutes = ?, active_status = ?
    WHERE id = ?
  `;

  const activeStatusValue = active_status !== undefined ? active_status : true;

  db.query(query, [code, name, address, gps_lat, gps_lng, opening_hours, closing_hours, unloading_time_minutes, activeStatusValue, storeId], (err, result) => {
    if (err) {
      console.error("Database update error:", err);
      return res.status(500).json({ error: "Failed to update store" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json({
      message: "Store updated successfully",
      id: storeId,
    });
  });
});

// Delete store (soft delete by setting active_status to false)
app.delete("/api/delete-store/:id", (req, res) => {
  const storeId = req.params.id;

  const query = `
    UPDATE stores
    SET active_status = FALSE
    WHERE id = ?
  `;

  db.query(query, [storeId], (err, result) => {
    if (err) {
      console.error("Database delete error:", err);
      return res.status(500).json({ error: "Failed to delete store" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json({
      message: "Store deleted successfully",
      id: storeId,
    });
  });
});

// **********contracts********** //

app.get("/api/get-contracts", (req, res) => {
  const includeInactive = req.query.include_inactive === 'true';

  let query = `
    SELECT c.*, s.code as store_code, s.name as store_name
    FROM contracts c
    LEFT JOIN stores s ON c.store_id = s.id
  `;

  if (!includeInactive) {
    query += ` WHERE c.active_status = TRUE`;
  }

  query += ` ORDER BY c.active_status DESC, c.created_at DESC`;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching contracts:", err);
      return res.status(500).json({ error: "Failed to fetch contracts" });
    }
    res.json(results);
  });
});

app.post("/api/add-contract", (req, res) => {
  const { store_id, contract_type, frequency_per_week, start_date, end_date } = req.body;

  if (!store_id || !contract_type || !frequency_per_week) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO contracts (store_id, contract_type, frequency_per_week, start_date, end_date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [store_id, contract_type, frequency_per_week, start_date, end_date], (err, result) => {
    if (err) {
      console.error("Database insert error:", err);
      return res.status(500).json({ error: "Failed to add contract" });
    }

    res.status(201).json({
      message: "Contract added successfully",
      id: result.insertId,
    });
  });
});

// Get single contract by ID
app.get("/api/get-contract/:id", (req, res) => {
  const contractId = req.params.id;

  const query = `
    SELECT c.*, s.code as store_code, s.name as store_name
    FROM contracts c
    LEFT JOIN stores s ON c.store_id = s.id
    WHERE c.id = ?
  `;

  db.query(query, [contractId], (err, results) => {
    if (err) {
      console.error("Error fetching contract:", err);
      return res.status(500).json({ error: "Failed to fetch contract" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }

    res.json(results[0]);
  });
});

// Update contract
app.put("/api/update-contract/:id", (req, res) => {
  const contractId = req.params.id;
  const { store_id, contract_type, frequency_per_week, start_date, end_date, active_status } = req.body;

  if (!store_id || !contract_type || !frequency_per_week) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    UPDATE contracts
    SET store_id = ?, contract_type = ?, frequency_per_week = ?, start_date = ?, end_date = ?, active_status = ?
    WHERE id = ?
  `;

  const activeStatus = active_status !== undefined ? active_status : true;

  db.query(query, [store_id, contract_type, frequency_per_week, start_date, end_date, activeStatus, contractId], (err, result) => {
    if (err) {
      console.error("Database update error:", err);
      return res.status(500).json({ error: "Failed to update contract" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }

    res.json({
      message: "Contract updated successfully",
      id: contractId,
    });
  });
});

// Delete contract (soft delete by setting active_status to false)
app.delete("/api/delete-contract/:id", (req, res) => {
  const contractId = req.params.id;

  const query = `
    UPDATE contracts
    SET active_status = FALSE
    WHERE id = ?
  `;

  db.query(query, [contractId], (err, result) => {
    if (err) {
      console.error("Database delete error:", err);
      return res.status(500).json({ error: "Failed to delete contract" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }

    res.json({
      message: "Contract deleted successfully",
      id: contractId,
    });
  });
});

// Simple test endpoint
console.log("Registering /api/test endpoint");
app.get("/api/test", (req, res) => {
  console.log("Test endpoint called");
  res.json({ message: "Test endpoint working!" });
});

// Test contract endpoint without parameters
console.log("Registering /api/test-contract endpoint");
app.get("/api/test-contract", (req, res) => {
  console.log("Test contract endpoint called");
  res.json({ message: "Test contract endpoint working!" });
});

// Test endpoint with parameter
console.log("Registering /api/test-param/:id endpoint");
app.get("/api/test-param/:id", (req, res) => {
  console.log("Test param endpoint called with id:", req.params.id);
  res.json({ message: "Test param endpoint working!", id: req.params.id });
});

// **********distance calculation********** //

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

app.post("/api/calculate-distances", (req, res) => {
  const { warehouse_id, store_ids } = req.body;

  if (!warehouse_id || !store_ids || !Array.isArray(store_ids)) {
    return res.status(400).json({ error: "Missing required fields: warehouse_id and store_ids array" });
  }

  // Get warehouse coordinates
  const warehouseQuery = "SELECT * FROM warehouses WHERE id = ?";
  db.query(warehouseQuery, [warehouse_id], (err, warehouseResults) => {
    if (err || warehouseResults.length === 0) {
      console.error("Error fetching warehouse:", err);
      return res.status(500).json({ error: "Failed to fetch warehouse" });
    }

    const warehouse = warehouseResults[0];

    // Get store coordinates
    const storeQuery = "SELECT * FROM stores WHERE id IN (?) AND active_status = TRUE";
    db.query(storeQuery, [store_ids], (err, storeResults) => {
      if (err) {
        console.error("Error fetching stores:", err);
        return res.status(500).json({ error: "Failed to fetch stores" });
      }

      const distances = storeResults.map(store => {
        const distance = calculateDistance(
          warehouse.gps_lat || 48.8566, // Default to Paris if no GPS
          warehouse.gps_lng || 2.3522,
          store.gps_lat,
          store.gps_lng
        );

        return {
          store_id: store.id,
          store_code: store.code,
          store_name: store.name,
          distance_km: Math.round(distance * 100) / 100 // Round to 2 decimal places
        };
      });

      res.json({
        warehouse_id: warehouse_id,
        warehouse_name: warehouse.location,
        distances: distances,
        total_stores: distances.length
      });
    });
  });
});

// **********schedule generation********** //

// Test endpoint
app.get("/api/test-schedule", (req, res) => {
  res.json({ message: "Schedule endpoint is working!" });
});

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getWeekDates(year, week) {
  const jan1 = new Date(year, 0, 1);
  const days = (week - 1) * 7 - jan1.getDay() + 1;
  const monday = new Date(year, 0, days + 1);

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDates.push(date);
  }
  return weekDates;
}

app.post("/api/generate-schedule", (req, res) => {
  const { warehouse_id, week_number, year, max_daily_distance = 600 } = req.body;

  if (!warehouse_id || !week_number || !year) {
    return res.status(400).json({ error: "Missing required fields: warehouse_id, week_number, year" });
  }

  const startTime = Date.now();

  // Get all active stores with contracts
  const storesQuery = `
    SELECT s.*, c.id as contract_id, c.contract_type, c.frequency_per_week
    FROM stores s
    JOIN contracts c ON s.id = c.store_id
    WHERE s.active_status = TRUE AND c.active_status = TRUE
  `;

  db.query(storesQuery, (err, stores) => {
    if (err) {
      console.error("Error fetching stores:", err);
      return res.status(500).json({ error: "Failed to fetch stores" });
    }

    // Calculate distances for all stores
    const storeIds = stores.map(s => s.id);

    const warehouseQuery = "SELECT * FROM warehouses WHERE id = ?";
    db.query(warehouseQuery, [warehouse_id], (err, warehouseResults) => {
      if (err || warehouseResults.length === 0) {
        console.error("Error fetching warehouse:", err);
        return res.status(500).json({ error: "Failed to fetch warehouse" });
      }

      const warehouse = warehouseResults[0];

      // Calculate distances for optimization
      const storeDistances = {};
      stores.forEach(store => {
        const distance = calculateDistance(
          warehouse.gps_lat || 48.8566,
          warehouse.gps_lng || 2.3522,
          store.gps_lat,
          store.gps_lng
        );
        storeDistances[store.id] = distance;
      });

      // Simple optimization algorithm
      const weekDates = getWeekDates(year, week_number);
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      const schedule = [];
      const dailyDistances = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun

      // Separate stores by contract type
      const comeauStores = stores.filter(s => s.contract_type === 'COMEAU');
      const comdetStores = stores.filter(s => s.contract_type === 'COMDET');

      // Schedule COMDET stores (1 delivery per week) - prefer early in week
      comdetStores.forEach(store => {
        const distance = storeDistances[store.id];
        let scheduled = false;

        for (let day = 0; day < 7 && !scheduled; day++) {
          if (dailyDistances[day] + distance <= max_daily_distance) {
            schedule.push({
              store_id: store.id,
              contract_id: store.contract_id,
              warehouse_id: warehouse_id,
              delivery_date: weekDates[day].toISOString().split('T')[0],
              delivery_day_of_week: dayNames[day],
              delay_days: 0,
              estimated_distance_km: distance,
              week_number: week_number,
              year: year
            });
            dailyDistances[day] += distance;
            scheduled = true;
          }
        }

        if (!scheduled) {
          // If can't fit in any day, schedule with delay
          const minDay = dailyDistances.indexOf(Math.min(...dailyDistances));
          schedule.push({
            store_id: store.id,
            contract_id: store.contract_id,
            warehouse_id: warehouse_id,
            delivery_date: weekDates[minDay].toISOString().split('T')[0],
            delivery_day_of_week: dayNames[minDay],
            delay_days: 1,
            estimated_distance_km: distance,
            week_number: week_number,
            year: year
          });
        }
      });

      // Schedule COMEAU stores (3 deliveries per week) - spread across week
      comeauStores.forEach(store => {
        const distance = storeDistances[store.id];
        let deliveriesScheduled = 0;
        const targetDays = [0, 2, 4]; // Mon, Wed, Fri preferred

        targetDays.forEach(day => {
          if (deliveriesScheduled < 3 && dailyDistances[day] + distance <= max_daily_distance) {
            schedule.push({
              store_id: store.id,
              contract_id: store.contract_id,
              warehouse_id: warehouse_id,
              delivery_date: weekDates[day].toISOString().split('T')[0],
              delivery_day_of_week: dayNames[day],
              delay_days: 0,
              estimated_distance_km: distance,
              week_number: week_number,
              year: year
            });
            dailyDistances[day] += distance;
            deliveriesScheduled++;
          }
        });

        // Fill remaining deliveries on other days
        for (let day = 0; day < 7 && deliveriesScheduled < 3; day++) {
          if (!targetDays.includes(day) && dailyDistances[day] + distance <= max_daily_distance) {
            schedule.push({
              store_id: store.id,
              contract_id: store.contract_id,
              warehouse_id: warehouse_id,
              delivery_date: weekDates[day].toISOString().split('T')[0],
              delivery_day_of_week: dayNames[day],
              delay_days: 0,
              estimated_distance_km: distance,
              week_number: week_number,
              year: year
            });
            dailyDistances[day] += distance;
            deliveriesScheduled++;
          }
        }
      });

      const executionTime = (Date.now() - startTime) / 1000;
      const totalDistance = dailyDistances.reduce((sum, dist) => sum + dist, 0);

      // Save optimization run
      const optimizationQuery = `
        INSERT INTO optimization_runs (week_number, year, parameters_json, total_distance_km, stores_served, execution_time_seconds, status, created_by_user_id)
        VALUES (?, ?, ?, ?, ?, ?, 'completed', 1)
      `;

      const parameters = {
        warehouse_id,
        max_daily_distance,
        total_stores: stores.length,
        comeau_stores: comeauStores.length,
        comdet_stores: comdetStores.length
      };

      db.query(optimizationQuery, [week_number, year, JSON.stringify(parameters), totalDistance, stores.length, executionTime], (err, optimizationResult) => {
        if (err) {
          console.error("Error saving optimization run:", err);
        }

        // Save schedules to database
        if (schedule.length > 0) {
          // Clear existing schedules for this week/year/warehouse
          const clearQuery = "DELETE FROM delivery_schedules WHERE week_number = ? AND year = ? AND warehouse_id = ?";
          db.query(clearQuery, [week_number, year, warehouse_id], (clearErr) => {
            if (clearErr) {
              console.error("Error clearing existing schedules:", clearErr);
            }

            // Insert new schedules
            const insertQuery = `
              INSERT INTO delivery_schedules
              (store_id, contract_id, warehouse_id, delivery_date, delivery_day_of_week, delay_days, estimated_distance_km, week_number, year)
              VALUES ?
            `;

            const scheduleValues = schedule.map(s => [
              s.store_id, s.contract_id, s.warehouse_id, s.delivery_date,
              s.delivery_day_of_week, s.delay_days, s.estimated_distance_km, s.week_number, s.year
            ]);

            db.query(insertQuery, [scheduleValues], (insertErr) => {
              if (insertErr) {
                console.error("Error saving schedules:", insertErr);
              }

              res.json({
                success: true,
                optimization_run_id: optimizationResult ? optimizationResult.insertId : null,
                schedule: schedule,
                summary: {
                  total_deliveries: schedule.length,
                  total_distance_km: Math.round(totalDistance * 100) / 100,
                  daily_distances: dailyDistances.map(d => Math.round(d * 100) / 100),
                  execution_time_seconds: executionTime,
                  stores_served: stores.length,
                  comeau_deliveries: schedule.filter(s => stores.find(st => st.id === s.store_id)?.contract_type === 'COMEAU').length,
                  comdet_deliveries: schedule.filter(s => stores.find(st => st.id === s.store_id)?.contract_type === 'COMDET').length
                }
              });
            });
          });
        } else {
          res.json({
            success: true,
            optimization_run_id: optimizationResult ? optimizationResult.insertId : null,
            schedule: schedule,
            summary: {
              total_deliveries: 0,
              total_distance_km: 0,
              daily_distances: [0, 0, 0, 0, 0, 0, 0],
              execution_time_seconds: executionTime,
              stores_served: stores.length,
              comeau_deliveries: 0,
              comdet_deliveries: 0
            }
          });
        }
      });
    });
  });
});

// **********optimization runs analytics********** //

app.get("/api/optimization-runs", (req, res) => {
  const query = `
    SELECT * FROM optimization_runs
    ORDER BY run_date DESC
    LIMIT 50
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching optimization runs:", err);
      return res.status(500).json({ error: "Failed to fetch optimization runs" });
    }
    res.json(results);
  });
});

// **********dashboard analytics********** //

app.get("/api/dashboard-stats", (req, res) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Get multiple statistics in parallel
  const queries = {
    // Current month deliveries
    currentMonthDeliveries: `
      SELECT COUNT(*) as count
      FROM delivery_schedules
      WHERE MONTH(delivery_date) = ? AND YEAR(delivery_date) = ?
    `,

    // Last month deliveries for comparison
    lastMonthDeliveries: `
      SELECT COUNT(*) as count
      FROM delivery_schedules
      WHERE MONTH(delivery_date) = ? AND YEAR(delivery_date) = ?
    `,

    // Total active stores
    totalStores: `
      SELECT COUNT(*) as count
      FROM stores
      WHERE active_status = TRUE
    `,

    // Total active contracts
    totalContracts: `
      SELECT COUNT(*) as count
      FROM contracts
      WHERE active_status = TRUE
    `,

    // Recent optimization runs
    recentOptimizations: `
      SELECT COUNT(*) as count,
             AVG(total_distance_km) as avg_distance,
             AVG(execution_time_seconds) as avg_execution_time
      FROM optimization_runs
      WHERE run_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `,

    // Contract type distribution
    contractTypes: `
      SELECT contract_type, COUNT(*) as count
      FROM contracts
      WHERE active_status = TRUE
      GROUP BY contract_type
    `,

    // Weekly delivery trends (last 4 weeks)
    weeklyTrends: `
      SELECT
        WEEK(delivery_date) as week_number,
        COUNT(*) as deliveries,
        SUM(estimated_distance_km) as total_distance
      FROM delivery_schedules
      WHERE delivery_date >= DATE_SUB(NOW(), INTERVAL 4 WEEK)
      GROUP BY WEEK(delivery_date)
      ORDER BY week_number DESC
      LIMIT 4
    `
  };

  const results = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;

  // Execute all queries
  Object.entries(queries).forEach(([key, query]) => {
    let params = [];

    if (key === 'currentMonthDeliveries') {
      params = [currentMonth, currentYear];
    } else if (key === 'lastMonthDeliveries') {
      params = [lastMonth, lastMonthYear];
    }

    db.query(query, params, (err, queryResults) => {
      if (err) {
        console.error(`Error in ${key} query:`, err);
        results[key] = null;
      } else {
        results[key] = queryResults;
      }

      completedQueries++;

      if (completedQueries === totalQueries) {
        // All queries completed, process and send results
        const currentDeliveries = results.currentMonthDeliveries?.[0]?.count || 0;
        const lastDeliveries = results.lastMonthDeliveries?.[0]?.count || 0;
        const deliveryGrowth = lastDeliveries > 0
          ? ((currentDeliveries - lastDeliveries) / lastDeliveries * 100).toFixed(1)
          : 0;

        const contractTypeCounts = {};
        if (results.contractTypes) {
          results.contractTypes.forEach(row => {
            contractTypeCounts[row.contract_type] = row.count;
          });
        }

        const dashboardData = {
          currentMonth: {
            deliveries: currentDeliveries,
            deliveryGrowth: parseFloat(deliveryGrowth),
            stores: results.totalStores?.[0]?.count || 0,
            contracts: results.totalContracts?.[0]?.count || 0
          },
          optimization: {
            recentRuns: results.recentOptimizations?.[0]?.count || 0,
            avgDistance: parseFloat(results.recentOptimizations?.[0]?.avg_distance || 0).toFixed(1),
            avgExecutionTime: parseFloat(results.recentOptimizations?.[0]?.avg_execution_time || 0).toFixed(3)
          },
          contracts: {
            comeau: contractTypeCounts.COMEAU || 0,
            comdet: contractTypeCounts.COMDET || 0,
            total: results.totalContracts?.[0]?.count || 0
          },
          trends: {
            weekly: results.weeklyTrends || []
          }
        };

        res.json(dashboardData);
      }
    });
  });
});

// **********schedule retrieval and management********** //

app.get("/api/schedules/:week/:year", (req, res) => {
  const { week, year } = req.params;
  const { warehouse_id } = req.query;

  let query = `
    SELECT ds.*, s.code as store_code, s.name as store_name, c.contract_type, w.location as warehouse_location
    FROM delivery_schedules ds
    JOIN stores s ON ds.store_id = s.id
    JOIN contracts c ON ds.contract_id = c.id
    JOIN warehouses w ON ds.warehouse_id = w.id
    WHERE ds.week_number = ? AND ds.year = ?
  `;

  const params = [week, year];

  if (warehouse_id) {
    query += " AND ds.warehouse_id = ?";
    params.push(warehouse_id);
  }

  query += " ORDER BY ds.delivery_date, s.code";

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching schedules:", err);
      return res.status(500).json({ error: "Failed to fetch schedules" });
    }
    res.json(results);
  });
});

// **********export functionality********** //

app.post("/api/export-schedule", (req, res) => {
  const { week_number, year, warehouse_id, format = 'json' } = req.body;

  if (!week_number || !year) {
    return res.status(400).json({ error: "Missing required fields: week_number, year" });
  }

  let query = `
    SELECT
      s.code,
      s.name as store,
      c.contract_type as contract,
      ds.delivery_date,
      ds.delivery_day_of_week,
      ds.delay_days,
      w.location as warehouse,
      c.frequency_per_week as frequency
    FROM delivery_schedules ds
    JOIN stores s ON ds.store_id = s.id
    JOIN contracts c ON ds.contract_id = c.id
    JOIN warehouses w ON ds.warehouse_id = w.id
    WHERE ds.week_number = ? AND ds.year = ?
  `;

  const params = [week_number, year];

  if (warehouse_id) {
    query += " AND ds.warehouse_id = ?";
    params.push(warehouse_id);
  }

  query += " ORDER BY s.code, ds.delivery_date";

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching export data:", err);
      return res.status(500).json({ error: "Failed to fetch export data" });
    }

    // Transform data into the required weekly format
    const weeklySchedule = {};
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    results.forEach(row => {
      const storeCode = row.code;
      if (!weeklySchedule[storeCode]) {
        weeklySchedule[storeCode] = {
          Code: row.code,
          Store: row.store,
          Contract: row.contract,
          Warehouse: row.warehouse,
          Frequency: 0,
          Monday: 0, DELAY_Monday: 0,
          Tuesday: 0, DELAY_Tuesday: 0,
          Wednesday: 0, DELAY_Wednesday: 0,
          Thursday: 0, DELAY_Thursday: 0,
          Friday: 0, DELAY_Friday: 0,
          Saturday: 0, DELAY_Saturday: 0,
          Sunday: 0, DELAY_Sunday: 0
        };
      }

      const dayName = row.delivery_day_of_week;
      weeklySchedule[storeCode][dayName] = 1;
      weeklySchedule[storeCode][`DELAY_${dayName}`] = row.delay_days;
      weeklySchedule[storeCode].Frequency++;
    });

    const exportData = Object.values(weeklySchedule);

    if (format === 'csv') {
      // Convert to CSV format
      const headers = ['Code', 'Store', 'Contract', 'Mon', 'DELAY_Mon', 'Tue', 'DELAY_Tue', 'Wed', 'DELAY_Wed', 'Thu', 'DELAY_Thu', 'Fri', 'DELAY_Fri', 'Sat', 'DELAY_Sat', 'Sun', 'DELAY_Sun', 'Warehouse', 'Frequency'];
      let csv = headers.join(',') + '\n';

      exportData.forEach(row => {
        const csvRow = [
          row.Code, row.Store, row.Contract,
          row.Monday, row.DELAY_Monday,
          row.Tuesday, row.DELAY_Tuesday,
          row.Wednesday, row.DELAY_Wednesday,
          row.Thursday, row.DELAY_Thursday,
          row.Friday, row.DELAY_Friday,
          row.Saturday, row.DELAY_Saturday,
          row.Sunday, row.DELAY_Sunday,
          row.Warehouse, row.Frequency
        ].map(field => `"${field}"`).join(',');
        csv += csvRow + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="delivery_schedule_week_${week_number}_${year}.csv"`);
      res.send(csv);
    } else {
      res.json({
        week_number,
        year,
        warehouse_id,
        total_stores: exportData.length,
        schedule: exportData
      });
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});