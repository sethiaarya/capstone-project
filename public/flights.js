// Mock flight data for demo
const flights = [
  // New York → Paris
  {
    from: "New York (JFK)",
    to: "Paris (CDG)",
    date: "2025-11-18",
    airline: "SkyWings",
    duration: "7h 10m",
    price: 640
  },
  {
    from: "New York (JFK)",
    to: "Paris (CDG)",
    date: "2025-11-18",
    airline: "AirLink",
    duration: "7h 25m",
    price: 690
  },
  // New York → Tokyo
  {
    from: "New York (JFK)",
    to: "Tokyo (HND)",
    date: "2025-11-18",
    airline: "PacificAir",
    duration: "14h 30m",
    price: 980
  },
  {
    from: "New York (JFK)",
    to: "Tokyo (HND)",
    date: "2025-11-18",
    airline: "NipponSky",
    duration: "14h 15m",
    price: 1020
  },
  // Chicago → Paris
  {
    from: "Chicago (ORD)",
    to: "Paris (CDG)",
    date: "2025-11-18",
    airline: "EuroConnect",
    duration: "8h 05m",
    price: 610
  },
  // Dallas → New York
  {
    from: "Dallas (DFW)",
    to: "New York (JFK)",
    date: "2025-11-18",
    airline: "MetroJet",
    duration: "3h 10m",
    price: 210
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("flightSearchForm");
  const resultsContainer = document.getElementById("resultsContainer");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const from = document.getElementById("fromInput").value.trim();
    const to = document.getElementById("toInput").value.trim();
    const date = document.getElementById("dateInput").value; // yyyy-mm-dd
    const passengers = parseInt(
      document.getElementById("passengersInput").value,
      10
    );

    resultsContainer.innerHTML = "";

    if (!from || !to || !date || !passengers) {
      resultsContainer.innerHTML =
        `<p class="text-sm text-red-100">Please fill all fields to search flights.</p>`;
      return;
    }

    // Filter flights (case-insensitive, exact date)
    let matches = flights.filter((f) =>
      f.from.toLowerCase().includes(from.toLowerCase()) &&
      f.to.toLowerCase().includes(to.toLowerCase()) &&
      f.date === date
    );

    // Sort by price (cheapest first)
    matches.sort((a, b) => a.price - b.price);

    if (matches.length === 0) {
      resultsContainer.innerHTML =
        `<p class="text-sm text-sky-100">No flights found for that route/date. Try a different date or route.</p>`;
      return;
    }

    matches.forEach((f, index) => {
      const total = f.price * passengers;

      const div = document.createElement("div");
      div.className =
        "card rounded-2xl bg-white/95 p-4 flex flex-col gap-2";

      div.innerHTML = `
        <div class="flex justify-between items-baseline gap-3">
          <div>
            <h3 class="font-semibold text-slate-900 text-sm">
              ${f.from} → ${f.to}
            </h3>
            <p class="text-[11px] text-slate-500">
              ${f.date} • ${f.duration}
            </p>
          </div>
          <span class="text-[10px] px-2 py-1 rounded-full bg-skyfade text-slate-700">
            ${f.airline}
          </span>
        </div>

        <div class="flex items-end justify-between mt-1">
          <div class="text-[11px] text-slate-700">
            <p>Price per person:
              <span class="font-semibold text-slate-900">$${f.price}</span>
            </p>
            <p>Total for ${passengers}:
              <span class="font-semibold text-emerald-600">$${total}</span>
            </p>
          </div>

          <button
            class="text-[11px] px-3 py-1.5 rounded-lg border border-gold text-gold hover:bg-gold hover:text-black transition"
            data-index="${index}">
            Book Flight
          </button>
        </div>
      `;

      resultsContainer.appendChild(div);
    });

    // Simple "Book" behavior: show confirmation + (later you can save to dashboard)
    resultsContainer.querySelectorAll("button[data-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.getAttribute("data-index"), 10);
        const chosen = matches[i];
        alert(
          `Flight booked!\n${chosen.from} → ${chosen.to}\n${chosen.airline} • ${chosen.date}\nTotal: $${chosen.price * passengers}`
        );
        // future: save to localStorage and show in personal_dashboard.html
      });
    });
  });
});