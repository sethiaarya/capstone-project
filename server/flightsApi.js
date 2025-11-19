// server/flightsApi.js
const { Pool } = require("pg");

// Create a separate pool for flights API (uses the same DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = function flightsApi(app) {
  // GET all bookings (for dashboard)
  app.get("/api/bookings", async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM bookings ORDER BY created_at DESC"
      );
      return res.json(result.rows);
    } catch (err) {
      console.error("GET /api/bookings error:", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to fetch bookings" });
    }
  });

  // POST a new booking (from Flights page)
  app.post("/api/bookings", async (req, res) => {
    try {
      console.log("POST /api/bookings body:", req.body);

      const {
        from,
        to,
        flight_date,
        airline,
        passengers,
        price_per_person,
        total,
        duration,
      } = req.body || {};

      // Validate required fields
      if (
        !from ||
        !to ||
        !flight_date ||
        !airline ||
        passengers == null ||
        price_per_person == null ||
        total == null
      ) {
        return res
          .status(400)
          .json({ success: false, error: "Missing required booking fields" });
      }

      const query = `
        INSERT INTO bookings
          (from_city, to_city, flight_date, airline,
           passengers, price_per_person, total, duration)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;

      const values = [
        from,
        to,
        flight_date,
        airline,
        Number(passengers),
        Number(price_per_person),
        Number(total),
        duration || null,
      ];

      const result = await pool.query(query, values);

      return res
        .status(201)
        .json({ success: true, booking: result.rows[0] });
    } catch (err) {
      console.error("POST /api/bookings insert error:", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to save booking" });
    }
  });
};
