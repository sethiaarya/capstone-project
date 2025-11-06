/* Home page client — Style C (Travel Blog aesthetic) */

// --- Data -------------------------------------------------------------

// IMPORTANT: NYC uses your local image file
// Tokyo uses the exact Unsplash URL you gave me
const DESTINATIONS = [
  {
    title: "Paris, France",
    desc: "The City of Love. Romance, lights, and rich culture.",
    img: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=1600&q=80"
  },
  {
    title: "Tokyo, Japan",
    desc: "Futuristic skyline meets ancient tradition.",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2094"
  },
  {
    title: "New York, USA",
    desc: "The city that never sleeps — lights, energy, and culture.",
    img: "/img/nyc.jpg" // your local file in public/img
  },
  {
    title: "Rome, Italy",
    desc: "Walk through the heart of ancient civilization.",
    img: "https://images.unsplash.com/photo-1526481280698-8fcc13fd6513?auto=format&fit=crop&w=1600&q=80"
  },
  {
    title: "Bali, Indonesia",
    desc: "Tropical paradise of beaches, temples, and forests.",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"
  },
  {
    title: "Dubai, UAE",
    desc: "Luxury and innovation rising out of golden desert.",
    img: "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=1600&q=80"
  },
];

const POPULAR = [
  "Santorini", "Kyoto", "Barcelona", "Amalfi", "Maui", "Seoul",
  "Cappadocia", "Lisbon", "Istanbul", "Paris", "Tokyo", "New York"
];

// --- Helpers ----------------------------------------------------------

const $ = (sel) => document.querySelector(sel);

function makeCard(item) {
  const wrap = document.createElement("article");
  wrap.className =
    "bg-glow/95 rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-colors";

  const img = document.createElement("img");
  img.src = item.img;
  img.alt = item.title;
  img.className = "w-full h-52 md:h-56 object-cover img-fade";
  img.loading = "lazy";
  img.onerror = () => {
    img.src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=60"; // ocean fallback
  };
  img.onload = () => img.classList.add("loaded");

  const box = document.createElement("div");
  box.className = "p-4";

  const h3 = document.createElement("h3");
  h3.className = "font-semibold text-amber";
  h3.textContent = item.title;

  const p = document.createElement("p");
  p.className = "text-night/80 text-sm mt-1";
  p.textContent = item.desc;

  box.appendChild(h3);
  box.appendChild(p);
  wrap.appendChild(img);
  wrap.appendChild(box);
  return wrap;
}

function makeChip(text) {
  const el = document.createElement("div");
  el.className =
    "whitespace-nowrap bg-glow/90 text-night px-4 py-2 rounded-xl border border-amber/30 shadow-sm";
  el.textContent = text;
  return el;
}

function makeTripCard(t) {
  const el = document.createElement("div");
  el.className =
    "min-w-[260px] bg-glow/95 rounded-xl px-4 py-3 border border-amber/20 shadow-soft";
  const title = t.title ?? "Trip";
  const dest = t.destination ?? "—";
  const s = t.start_date ? new Date(t.start_date).toISOString().slice(0,10) : "—";
  const e = t.end_date ? new Date(t.end_date).toISOString().slice(0,10) : "—";
  el.innerHTML =
    `<div class="font-semibold text-amber">${title}</div>
     <div class="text-night/90 text-sm">${dest}</div>
     <div class="text-night/70 text-xs mt-1">${s} → ${e}</div>`;
  return el;
}

// --- Render grid ------------------------------------------------------

const grid = $("#destinations");
const search = $("#search");

function renderGrid(list) {
  grid.innerHTML = "";
  list.forEach(d => grid.appendChild(makeCard(d)));
}
renderGrid(DESTINATIONS);

search.addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase().trim();
  if (!q) return renderGrid(DESTINATIONS);
  const filtered = DESTINATIONS.filter(d =>
    d.title.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q)
  );
  renderGrid(filtered);
});

// --- Ribbons (DB-backed) ----------------------------------------------

async function loadRibbons() {
  try {
    // Wishlist
    const wres = await fetch("/api/wishlist");
    if (wres.ok) {
      const wishlist = await wres.json();
      const sr = $("#savedRibbon");
      const se = $("#savedEmpty");
      sr.innerHTML = "";
      if (wishlist.length === 0) {
        se.classList.remove("hidden");
      } else {
        se.classList.add("hidden");
        wishlist.forEach(w =>
          sr.appendChild(makeChip(w.destination || "Destination")));
      }
    }

    // Trips
    const tres = await fetch("/api/trips");
    if (tres.ok) {
      let trips = await tres.json();
      const ur = $("#upcomingRibbon");
      const ue = $("#upcomingEmpty");
      ur.innerHTML = "";
      trips = trips
        .filter(t => t.start_date)
        .sort((a,b) => new Date(a.start_date) - new Date(b.start_date));
      if (trips.length === 0) {
        ue.classList.remove("hidden");
      } else {
        ue.classList.add("hidden");
        trips.forEach(t => ur.appendChild(makeTripCard(t)));
      }
    }

    // Popular
    const pr = $("#popularRibbon");
    pr.innerHTML = "";
    POPULAR.forEach(p => pr.appendChild(makeChip(p)));

  } catch (err) {
    console.error("Ribbon load error:", err);
  }
}
loadRibbons();
