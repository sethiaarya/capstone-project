// server/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
const { randomUUID } = require("crypto");
const flightsApi = require("./flightsApi");


require("dotenv").config({ path: path.join(__dirname, "../.env") });

const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const bcrypt = require("bcrypt");

const app = express();
const isProd = process.env.NODE_ENV === "production";
if (isProd) app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

// Static
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));
console.log("Serving static from:", publicDir);

// DB
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Sessions (ONE instance)
app.use(
  session({
    store: new PgSession({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || "dev",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // default 7d (overridden when rememberMe)
      secure: isProd,
      sameSite: "lax",
    },
  })
);

// --- Ensure tables and migrate saved_destinations -> user scoped ---
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS hotels (
      id UUID PRIMARY KEY,
      place TEXT NOT NULL,
      note TEXT,
      check_in DATE,
      check_out DATE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // --- MIGRATION: add user_id to saved_destinations if missing ---
  await pool.query(`ALTER TABLE saved_destinations ADD COLUMN IF NOT EXISTS user_id UUID;`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_destinations(user_id);`);

  // (1) Add FK to users.id (idempotent)
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'saved_destinations_user_fk'
      ) THEN
        ALTER TABLE saved_destinations
        ADD CONSTRAINT saved_destinations_user_fk
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      END IF;
    END$$;
  `);

  // (2) OPTIONAL: make user_id NOT NULL only when no NULLs remain
  await pool.query(`
    DO $$
    DECLARE missing_count int;
    BEGIN
      SELECT COUNT(*) INTO missing_count FROM saved_destinations WHERE user_id IS NULL;
      IF missing_count = 0 THEN
        BEGIN
          ALTER TABLE saved_destinations
          ALTER COLUMN user_id SET NOT NULL;
        EXCEPTION WHEN others THEN
          -- ignore if already set / concurrent run
          NULL;
        END;
      END IF;
    END$$;
  `);

  console.log("✅ Tables ready (trips, wishlist, saved_destinations, hotels, users) + per-user FK");
}

// ----- Simple mappers -----
const mapTripRow = (r) => ({
  id: r.id, title: r.title, dest: r.dest,
  start: r.start_date?.toISOString().slice(0,10),
  end:   r.end_date?.toISOString().slice(0,10),
  budget: r.budget == null ? null : Number(r.budget),
});
const mapWishRow = (r) => ({
  id: r.id, place: r.place, note: r.note, date: r.date?.toISOString().slice(0,10),
});
const mapSaved = (r) => ({
  id: r.id, city: r.city, country: r.country, region: r.region, date: r.date?.toISOString().slice(0,10),
});
const mapHotelRow = (r) => ({
  id: r.id, place: r.place, note: r.note,
  checkIn: r.check_in ? r.check_in.toISOString().slice(0,10) : "",
  checkOut: r.check_out ? r.check_out.toISOString().slice(0,10) : "",
  createdAt: r.created_at?.toISOString?.() ?? null,
});

// ----- Trips -----
app.get("/api/trips", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM trips ORDER BY start_date DESC, title ASC");
  res.json(rows.map(mapTripRow));
});
app.post("/api/trips", async (req, res) => {
  const { title, dest, start, end, budget } = req.body || {};
  if (!title || !dest || !start || !end) return res.status(400).json({ error: "Missing required fields" });
  const id = randomUUID();
  const { rows } = await pool.query(
    `INSERT INTO trips (id, title, dest, start_date, end_date, budget)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [id, title, dest, start, end, budget ?? null]
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
  const d = new Date().toISOString().slice(0,10);
  const { rows } = await pool.query(
    `INSERT INTO wishlist (id, place, note, date) VALUES ($1,$2,$3,$4) RETURNING *`,
    [id, place ?? null, note ?? null, d]
  );
  res.status(201).json(mapWishRow(rows[0]));
});
app.delete("/api/wishlist/:id", async (req, res) => {
  await pool.query("DELETE FROM wishlist WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

// ----- Hotels -----
app.get("/api/hotels", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM hotels ORDER BY created_at DESC, place ASC");
  res.json(rows.map(mapHotelRow));
});
app.post("/api/hotels", async (req, res) => {
  const { place, checkIn = null, checkOut = null, note = null } = req.body || {};
  if (!place || !place.trim()) return res.status(400).json({ error: "place required" });
  const id = randomUUID();
  const { rows } = await pool.query(
    `INSERT INTO hotels (id, place, note, check_in, check_out)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [id, place.trim(), note, checkIn, checkOut]
  );
  res.status(201).json(mapHotelRow(rows[0]));
});
app.delete("/api/hotels/:id", async (req, res) => {
  await pool.query("DELETE FROM hotels WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

// ----- Saved Destinations (now per-user) -----
/* ---------- Auth guard ---------- */
function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not signed in" });
  }
  next();
}

/* ---------- Saved Destinations (per-user) ---------- */
// NOTE: This assumes a `user_id` column exists on saved_destinations.
// We’ll add it in the schema step next.

app.get("/api/saved", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, city, country, region, date
       FROM saved_destinations
       WHERE user_id = $1
       ORDER BY date DESC NULLS LAST, city ASC`,
      [req.session.userId]
    );
    res.json(rows.map(mapSaved));
  } catch (e) {
    console.error("GET /api/saved failed:", e);
    res.status(500).json({ error: "Failed to load saved destinations" });
  }
});

app.post("/api/saved", requireAuth, async (req, res) => {
  try {
    const { city, country, region } = req.body || {};
    if (!city || !country) {
      return res.status(400).json({ error: "Missing city/country" });
    }
    const id = randomUUID();
    const d  = new Date().toISOString().slice(0, 10);

    const { rows } = await pool.query(
      `INSERT INTO saved_destinations (id, user_id, city, country, region, date)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, city, country, region, date`,
      [id, req.session.userId, city, country, region ?? null, d]
    );

    res.status(201).json(mapSaved(rows[0]));
  } catch (e) {
    console.error("POST /api/saved failed:", e);
    res.status(500).json({ error: "Failed to add saved destination" });
  }
});

app.delete("/api/saved/:id", requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM saved_destinations
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.session.userId]
    );
    if (rowCount === 0) {
      // not found or not owned by this user
      return res.status(404).json({ error: "Not found" });
    }
    res.status(204).end();
  } catch (e) {
    console.error("DELETE /api/saved/:id failed:", e);
    res.status(500).json({ error: "Failed to remove saved destination" });
  }
});


// ---------- AUTH ----------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullName, email, password, avatarUrl } = req.body || {};
    if (!fullName || !email || !password)
      return res.status(400).json({ error: "Missing fullName/email/password" });

    const id = randomUUID();
    const hash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (id, email, password_hash, full_name, avatar_url)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, email, full_name AS "fullName", avatar_url AS "avatarUrl", created_at AS "createdAt"`,
      [id, email.toLowerCase().trim(), hash, fullName.trim(), avatarUrl ?? null]
    );

    req.session.userId = rows[0].id;
    return res.status(201).json({ user: rows[0] });
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ error: "Email already registered" });
    console.error("Register failed:", e);
    return res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password, rememberMe } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

  const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [email.trim().toLowerCase()]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  // session
  req.session.userId = user.id;

  // Remember me: extend cookie to 30 days; otherwise keep default (7 days)
  if (rememberMe) {
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30;
  } else {
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
  }

  res.json({
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    avatarUrl: user.avatar_url,
  });
});

app.get("/api/auth/me", async (req, res) => {
  if (!req.session.userId) return res.json(null);
  const { rows } = await pool.query(
    `SELECT id, email, full_name AS "fullName", avatar_url AS "avatarUrl" FROM users WHERE id=$1`,
    [req.session.userId]
  );
  res.json(rows[0] || null);
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => res.status(204).end());
});

// Health + tiny debug
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/debug/ping-db", async (_req, res) => {
  const { rows } = await pool.query("SELECT NOW() AS now");
  res.json({ ok: true, now: rows[0].now });
});
app.get("/debug/users", async (_req, res) => {
  const { rows } = await pool.query(`SELECT id, email, full_name AS "fullName", created_at AS "createdAt" FROM users ORDER BY created_at DESC LIMIT 20`);
  res.json(rows);
});

// HTML fallbacks
app.get("/pages/flights.html", (_req, res) =>
  res.sendFile(path.join(__dirname, "..", "public", "pages", "flights.html"))
);
app.get("/pages/personal_dashboard.html", (_req, res) =>
  res.sendFile(path.join(__dirname, "..", "public", "pages", "personal_dashboard.html"))
);
app.get("/pages/destinations.html", (_req, res) =>
  res.sendFile(path.join(__dirname, "..", "public", "pages", "destinations.html"))
);

flightsApi(app);

// Start
const PORT = process.env.PORT || 3000;
ensureTables()
  .then(() => app.listen(PORT, () => console.log(`✅ Server running → http://localhost:${PORT}`)))
  .catch((e) => {
    console.error("Failed to init DB:", e);
    process.exit(1);
  });
