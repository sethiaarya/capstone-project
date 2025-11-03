import express from "express";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ Server is running!" });
});

// Get wishlist
app.get("/api/wishlist", async (req, res) => {
  const result = await pool.query("SELECT * FROM wishlist ORDER BY added_at DESC;");
  res.json(result.rows);
});

// Add to wishlist
app.post("/api/wishlist", async (req, res) => {
  const { destination } = req.body;
  await pool.query("INSERT INTO wishlist (destination) VALUES ($1);", [destination]);
  res.json({ success: true });
});

// Get trips
app.get("/api/trips", async (req, res) => {
  const result = await pool.query("SELECT * FROM trips ORDER BY created_at DESC;");
  res.json(result.rows);
});

// Add new trip
app.post("/api/trips", async (req, res) => {
  const { title, destination, start_date, end_date, budget, notes } = req.body;
  await pool.query(
    `INSERT INTO trips (title, destination, start_date, end_date, budget, notes) 
     VALUES ($1, $2, $3, $4, $5, $6);`,
    [title, destination, start_date, end_date, budget, notes]
  );
  res.json({ success: true });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
