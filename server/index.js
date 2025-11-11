// server/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
const { randomUUID } = require("crypto");

// Load .env from project root
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const app = express();
app.use(cors());
app.use(express.json());

// serve the frontend from /public
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));
console.log("Serving static from:", publicDir);

// ----- DB -----
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // sslmode=require is already in your Neon URL
});

// Create tables (ids inserted from server using randomUUID)
async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS trips (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL,
      dest TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      budget NUMERIC(12,2)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS wishlist (
      id UUID PRIMARY KEY,
      place TEXT,
      note TEXT,
      date DATE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS saved_destinations (
      id UUID PRIMARY KEY,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      region TEXT,
      date DATE
    );
  `);

  console.log("✅ Tables ready (trips, wishlist, saved_destinations)");
}

// ----- Mappers -----
const mapTripRow = (r) => ({
  id: r.id,
  title: r.title,
  dest: r.dest,
  start: r.start_date?.toISOString().slice(0, 10),
  end: r.end_date?.toISOString().slice(0, 10),
  budget: r.budget === null ? null : Number(r.budget),
});
const mapWishRow = (r) => ({
  id: r.id,
  place: r.place,
  note: r.note,
  date: r.date?.toISOString().slice(0, 10),
});
const mapSaved = (r) => ({
  id: r.id,
  city: r.city,
  country: r.country,
  region: r.region,
  date: r.date?.toISOString().slice(0, 10),
});

// ----- Trips -----
app.get("/api/trips", async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM trips ORDER BY start_date DESC, title ASC"
  );
  res.json(rows.map(mapTripRow));
});

app.post("/api/trips", async (req, res) => {
  const { title, dest, start, end, budget } = req.body || {};
  if (!title || !dest || !start || !end) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const id = randomUUID();
  const params = [id, title, dest, start, end, budget ?? null];
  const { rows } = await pool.query(
    `INSERT INTO trips (id, title, dest, start_date, end_date, budget)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    params
  );
  res.status(201).json(mapTripRow(rows[0]));
});

app.delete("/api/trips/:id", async (req, res) => {
  await pool.query("DELETE FROM trips WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

// ----- Wishlist -----
app.get("/api/wishlist", async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM wishlist ORDER BY date DESC NULLS LAST, place ASC NULLS LAST"
  );
  res.json(rows.map(mapWishRow));
});

app.post("/api/wishlist", async (req, res) => {
  const { place, note } = req.body || {};
  const id = randomUUID();
  const d = new Date().toISOString().slice(0, 10);
  const { rows } = await pool.query(
    `INSERT INTO wishlist (id, place, note, date)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [id, place ?? null, note ?? null, d]
  );
  res.status(201).json(mapWishRow(rows[0]));
});

app.delete("/api/wishlist/:id", async (req, res) => {
  await pool.query("DELETE FROM wishlist WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

// ----- Saved Destinations (kept, but Dashboard doesn’t depend on it) -----
app.get("/api/saved", async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM saved_destinations ORDER BY date DESC NULLS LAST, city ASC"
  );
  res.json(rows.map(mapSaved));
});
app.post("/api/saved", async (req, res) => {
  const { city, country, region } = req.body || {};
  if (!city || !country) return res.status(400).json({ error: "Missing city/country" });
  const id = randomUUID();
  const d = new Date().toISOString().slice(0, 10);
  const { rows } = await pool.query(
    `INSERT INTO saved_destinations (id, city, country, region, date)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [id, city, country, region ?? null, d]
  );
  res.status(201).json(mapSaved(rows[0]));
});
app.delete("/api/saved/:id", async (req, res) => {
  await pool.query("DELETE FROM saved_destinations WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

// health (for quick check)
app.get("/health", (_req, res) => res.json({ ok: true }));

/* HTML fallbacks - serve pages from organized structure */
app.get("/pages/flights.html", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "pages", "flights.html"));
});
app.get("/pages/personal_dashboard.html", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "pages", "personal_dashboard.html"));
});

// start
const PORT = process.env.PORT || 3000;
ensureTables()
  .then(() => app.listen(PORT, () => {
    console.log(`✅ Server running → http://localhost:${PORT}`);
  }))
  .catch((e) => {
    console.error("Failed to init DB:", e);
    process.exit(1);
  });
