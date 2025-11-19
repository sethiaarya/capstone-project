// server/flightsApi.js
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = function flightsApi(app) {
  // GET /api/bookings -> return all saved bookings
  app.get("/api/bookings", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM bookings ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // POST /api/bookings -> save a new booking
  app.post("/api/bookings", async (req, res) => {
    const b = req.body;

    try {
      await pool.query(
        `INSERT INTO bookings (from_city, to_city, flight_date, airline, passengers, price_per_person, total, duration)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [b.from, b.to, b.flight_date, b.airline, b.passengers, b.price_per_person, b.total, b.duration]
      );

      res.json({ success: true, message: "Booking saved in Neon DB" });
    } catch (err) {
      console.error("Error saving booking:", err);
      res.status(500).json({ error: "Database error" });
    }
  });
};
