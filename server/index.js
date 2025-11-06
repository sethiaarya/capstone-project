// server/index.js
import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

// --- Paths ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- App ---
const app = express();
app.use(express.json());

// Serve the /public folder statically
app.use(express.static(path.join(__dirname, "..", "public")));

// --- DB ---
const DATABASE_URL = process.env.DATABASE_URL || process.env.PGDATABASE_URL || process.env.PGURI || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL missing in .env");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// --- API ---

// Health
app.get("/api/health", async (_req, res) => {
  try {
    const r = await pool.query("SELECT NOW()");
    res.json({ ok: true, time: r.rows[0].now });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Trips
app.get("/api/trips", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, title, destination, start_date, end_date, budget, created_at FROM trips ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/trips", async (req, res) => {
  try {
    const { title, destination, start_date, end_date, budget } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO trips (title, destination, start_date, end_date, budget)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, title, destination, start_date, end_date, budget, created_at`,
      [title, destination, start_date, end_date, budget ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Wishlist
app.get("/api/wishlist", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, destination, added_at FROM wishlist ORDER BY added_at DESC"
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/wishlist", async (req, res) => {
  try {
    const { destination } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO wishlist (destination) VALUES ($1) RETURNING id, destination, added_at",
      [destination]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// --- Start ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
