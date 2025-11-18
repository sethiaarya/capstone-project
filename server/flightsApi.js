// server/flightsApi.js
// backend for saving & loading booked flights

const fs = require("fs");
const path = require("path");

// bookings.json is in the ../data folder
const BOOKINGS_PATH = path.join(__dirname, "..", "data", "bookings.json");

// Helper: safely read JSON file, return [] if missing/broken
function loadBookings() {
  try {
    if (!fs.existsSync(BOOKINGS_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(BOOKINGS_PATH, "utf-8") || "[]";
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading bookings file:", e);
    return [];
  }
}

// Helper: write bookings back to file
function saveBookings(list) {
  try {
    fs.writeFileSync(BOOKINGS_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing bookings file:", e);
  }
}

// Export a function that plugs into your existing Express app
module.exports = function flightsApi(app) {
  // GET /api/bookings  -> return all saved bookings
  app.get("/api/bookings", (req, res) => {
    const bookings = loadBookings();
    res.json(bookings);
  });

  // POST /api/bookings -> save a new booking
  app.post("/api/bookings", (req, res) => {
    const b = req.body;

    // Very basic validation
    if (
      !b ||
      !b.from ||
      !b.to ||
      !b.airline ||
      !b.passengers ||
      !b.total
    ) {
      return res.status(400).json({ error: "Invalid booking data" });
    }

    const bookings = loadBookings();
    bookings.push({
      ...b,
      createdAt: new Date().toISOString(),
    });
    saveBookings(bookings);

    res.json({ success: true, message: "Booking saved on server" });
  });
};