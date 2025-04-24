const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json()); // important to parse JSON body

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // default for XAMPP
  database: "planify", // replace with actual DB name
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL");
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  console.log("Login request received:", email, password); // log for debug

  const query = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ error: "Server error" });
    }

    console.log("Query results:", results);

    if (results.length > 0) {
      return res.json({ message: "Login successful", user: results[0] });
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// **********warehouse********** //

app.post("/api/add-warehouse", (req, res) => {
  const { code, location, capacity_km, schedule } = req.body;

  if (!code || !location || !capacity_km || !schedule) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO warehouses (code, location, capacity_km, schedule)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [code, location, capacity_km, schedule], (err, result) => {
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
  const query = "SELECT * FROM warehouses";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching warehouses:", err);
      return res.status(500).json({ error: "Failed to fetch warehouses" });
    }
    res.json(results);
  });
});
