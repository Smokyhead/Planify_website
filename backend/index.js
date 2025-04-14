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
