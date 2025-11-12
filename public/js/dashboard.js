/* Golden Twilight • Dashboard (SAFE RENDER VERSION)
   - No innerHTML string templates (prevents layout corruption).
   - Pure DOM node creation & event delegation.
   - Trips + Wishlist + Hotels (safe render).
*/

const $ = (sel) => document.querySelector(sel);

/* ------------------ tiny utils ------------------ */
async function req(url, opts = {}) {
  const r = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  let body = null;
  try { body = await r.json(); } catch (_) {}
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${JSON.stringify(body || {})}`);
  return body;
}
const text = (v) => (v == null ? "" : String(v));


function formatTimestamp(date) {
  const d = new Date(date);
  const now = new Date();
  
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  
  const isYesterday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate() - 1;

  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (isToday) return `Today ${time}`;
  if (isYesterday) return `Yesterday ${time}`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + ` ${time}`;
}


/* KPI helper for "Last Added" */
const kpiActivity = $("#kpiActivity");
function updateLastActivity() {
  if (!kpiActivity) return;
  const rows = $("#activityList")?.children?.length || 0;
  kpiActivity.textContent = rows > 0 ? "Today" : "—";
}

function addActivity(msg) {
  const box = $("#activityList");
  if (!box) return;
  const row = document.createElement("div");
  row.className = "border border-[color:var(--line)] rounded-xl p-3";
  row.textContent = msg;
  box.prepend(row);

  // ✅ Update KPI "Last Added"
  const k = $("#kpiActivity");
  if (k) k.textContent = formatTimestamp(new Date());
}


function clearNode(node) {
  while (node && node.firstChild) node.removeChild(node.firstChild);
}

/* ------------------ Trips ------------------ */
const tripsList = $("#tripsList");
const kpiTrips  = $("#kpiTrips");
const tripForm  = $("#tripForm");

function tripCard(t) {
  const card = document.createElement("div");
  card.className = "border border-[color:var(--line)] rounded-xl p-3";

  const row = document.createElement("div");
  row.className = "flex items-start justify-between";
  card.appendChild(row);

  const left = document.createElement("div");
  row.appendChild(left);

  const title = document.createElement("div");
  title.className = "text-[15px] font-semibold";
  title.textContent = text(t.title);
  left.appendChild(title);

  const dest = document.createElement("div");
  dest.className = "text-[13px] text-[color:var(--muted)]";
  dest.textContent = text(t.dest);
  left.appendChild(dest);

  const dates = document.createElement("div");
  dates.className = "text-[12px] text-[color:var(--muted)]";
  dates.textContent = `${text(t.start)} → ${text(t.end)}`;
  left.appendChild(dates);

  if (t.budget != null && t.budget !== "") {
    const bud = document.createElement("div");
    bud.className = "text-[12px] text-[color:var(--muted)]";
    bud.textContent = `Budget: $${t.budget}`;
    left.appendChild(bud);
  }

  const btn = document.createElement("button");
  btn.className = "remove-trip btn btn-navy text-[13px]";
  btn.dataset.id = t.id;
  btn.textContent = "Remove";
  row.appendChild(btn);

  return card;
}

async function loadTrips() {
  const items = await req("/api/trips");
  if (kpiTrips) kpiTrips.textContent = items.length;

  clearNode(tripsList);
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "border border-[color:var(--line)] rounded-xl p-3 text-[color:var(--muted)]";
    empty.textContent = "No trips yet. Add one above.";
    tripsList.appendChild(empty);
    return;
  }
  for (const t of items) tripsList.appendChild(tripCard(t));
}

tripsList?.addEventListener("click", async (e) => {
  const btn = e.target.closest(".remove-trip");
  if (!btn) return;
  const id = btn.dataset.id;
  await req(`/api/trips/${id}`, { method: "DELETE" });
  await loadTrips();
  addActivity("Trip removed");
});

tripForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = $("#tripTitle").value.trim();
  const dest  = $("#tripDest").value.trim();
  const start = $("#tripStart").value.trim();
  const end   = $("#tripEnd").value.trim();
  const budgetRaw = $("#tripBudget").value.trim();
  const budget = budgetRaw === "" ? null : budgetRaw;

  if (!title || !dest || !start || !end) return;
  await req("/api/trips", {
    method: "POST",
    body: JSON.stringify({ title, dest, start, end, budget }),
  });
  tripForm.reset();
  await loadTrips();
  addActivity(`Trip added: ${title}`);
});

/* ------------------ Wishlist ------------------ */
const wishlistList = $("#wishlistList");
const kpiWishlist  = $("#kpiWishlist");
const wishForm     = $("#wishForm");

function wishCard(w) {
  const card = document.createElement("div");
  card.className = "border border-[color:var(--line)] rounded-xl p-3";

  const row = document.createElement("div");
  row.className = "flex items-start justify-between";
  card.appendChild(row);

  const left = document.createElement("div");
  row.appendChild(left);

  const place = document.createElement("div");
  place.className = "text-[15px] font-semibold";
  place.textContent = text(w.place);
  left.appendChild(place);

  const date = document.createElement("div");
  date.className = "text-[12px] text-[color:var(--muted)]";
  date.textContent = text(w.date);
  left.appendChild(date);

  if (w.note) {
    const note = document.createElement("div");
    note.className = "text-[13px] text-[color:var(--muted)] pt-1";
    note.textContent = text(w.note);
    card.appendChild(note);
  }

  const btn = document.createElement("button");
  btn.className = "remove-wish btn btn-navy text-[13px]";
  btn.dataset.id = w.id;
  btn.textContent = "Remove";
  row.appendChild(btn);

  return card;
}

async function loadWishlist() {
  const items = await req("/api/wishlist");
  if (kpiWishlist) kpiWishlist.textContent = items.length;

  clearNode(wishlistList);
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "border border-[color:var(--line)] rounded-xl p-3 text-[color:var(--muted)]";
    empty.textContent = "No wishlist items yet.";
    wishlistList.appendChild(empty);
    return;
  }
  for (const w of items) wishlistList.appendChild(wishCard(w));
}

wishlistList?.addEventListener("click", async (e) => {
  const btn = e.target.closest(".remove-wish");
  if (!btn) return;
  const id = btn.dataset.id;
  await req(`/api/wishlist/${id}`, { method: "DELETE" });
  await loadWishlist();
  addActivity("Wishlist item removed");
});

wishForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const place = $("#wishInput").value.trim();
  const note  = $("#wishNote").value.trim() || null;
  if (!place) return;
  await req("/api/wishlist", {
    method: "POST",
    body: JSON.stringify({ place, note }),
  });
  wishForm.reset();
  await loadWishlist();
  addActivity(`Added to wishlist: ${place}`);
});

/* ------------------ Hotels ------------------ */
const hotelsList   = $("#hotelsList");
const kpiHotels    = $("#kpiHotels");
const hotelForm    = $("#hotelForm");
const hotelPlace   = $("#hotelPlace");
const hotelCheckIn = $("#hotelCheckIn");
const hotelCheckOut= $("#hotelCheckOut");
const hotelNote    = $("#hotelNote");

function hotelLinks(place, checkIn, checkOut) {
  const p  = encodeURIComponent(place || "");
  const ci = checkIn ? encodeURIComponent(checkIn) : null;
  const co = checkOut ? encodeURIComponent(checkOut) : null;

  // Google Hotels (dates optional)
  let google = `https://www.google.com/travel/hotels?q=${p}`;
  if (ci) google += `&checkin=${ci}`;
  if (co) google += `&checkout=${co}`;

  // Booking.com
  let booking = `https://www.booking.com/searchresults.html?ss=${p}`;
  if (ci) booking += `&checkin=${ci}`;
  if (co) booking += `&checkout=${co}`;

  // Expedia
  let expedia = `https://www.expedia.com/Hotel-Search?destination=${p}`;
  if (ci) expedia += `&checkIn=${ci}`;
  if (co) expedia += `&checkOut=${co}`;

  return { google, booking, expedia };
}

function mapsEmbedUrl(place) {
  const q = encodeURIComponent(place || "");
  return `https://www.google.com/maps?q=${q}&output=embed`;
}

/* text-only, elegant hotel card (no photo) */
function hotelCard(h) {
  const card = document.createElement("div");
  card.className = "rounded-2xl border border-[var(--line)] bg-white p-4 space-y-2";

  // Title + dates
  const title = document.createElement("div");
  title.className = "text-lg font-semibold text-[var(--navy)]";
  title.textContent = h.place || "—";
  card.appendChild(title);

  const dates = document.createElement("div");
  dates.className = "text-xs text-[var(--muted)]";
  dates.textContent = `${h.checkIn || "—"} → ${h.checkOut || "—"}`;
  card.appendChild(dates);

  // Note
  if (h.note) {
    const note = document.createElement("div");
    note.className = "text-[13px] text-[var(--muted)]";
    note.textContent = h.note;
    card.appendChild(note);
  }

  // Row: left = pills, right = Remove
  const row = document.createElement("div");
  row.className = "flex items-center justify-between gap-2 pt-1 flex-wrap";
  card.appendChild(row);

  const left = document.createElement("div");
  left.className = "flex items-center gap-2 flex-wrap";
  row.appendChild(left);

  const { google, booking, expedia } = hotelLinks(h.place, h.checkIn, h.checkOut);

  const mk = (href, label) => {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = label;
    a.className = "px-3 py-1.5 rounded-full border border-[var(--line)] text-[13px] hover:bg-black/5 transition";
    return a;
  };

  left.appendChild(mk(google, "Google"));
  left.appendChild(mk(booking, "Booking"));
  left.appendChild(mk(expedia, "Expedia"));

  const mapBtn = document.createElement("button");
  mapBtn.type = "button";
  mapBtn.textContent = "Map";
  mapBtn.className = "px-3 py-1.5 rounded-full border border-[var(--line)] text-[13px] hover:bg-black/5 transition";
  left.appendChild(mapBtn);

  // RIGHT: Remove pill — same style as Trips
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-hotel btn btn-navy text-[13px]";
  removeBtn.dataset.id = h.id;
  removeBtn.textContent = "Remove";
  row.appendChild(removeBtn);

  // Collapsible map
  const mapWrap = document.createElement("div");
  mapWrap.className = "pt-3 hidden";
  const iframe = document.createElement("iframe");
  iframe.className = "w-full h-[240px] rounded-xl border border-[var(--line)]";
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  iframe.setAttribute("allowfullscreen", "");
  mapWrap.appendChild(iframe);
  card.appendChild(mapWrap);

  let mapLoaded = false;
  mapBtn.addEventListener("click", () => {
    if (mapWrap.classList.contains("hidden")) {
      mapWrap.classList.remove("hidden");
      if (!mapLoaded) {
        iframe.src = mapsEmbedUrl(h.place);
        mapLoaded = true;
      }
    } else {
      mapWrap.classList.add("hidden");
    }
  });

  return card;
}

async function loadHotels() {
  const items = await req("/api/hotels");
  if (kpiHotels) kpiHotels.textContent = items.length;

  clearNode(hotelsList);
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "border border-[color:var(--line)] rounded-xl p-3 text-[color:var(--muted)]";
    empty.textContent = "No hotels yet.";
    hotelsList.appendChild(empty);
    return;
  }
  for (const h of items) hotelsList.appendChild(hotelCard(h));
}

/* ------------------ init ------------------ */
document.addEventListener("DOMContentLoaded", () => {
  if (tripsList) loadTrips();
  if (wishlistList) loadWishlist();

  // initial Last Added KPI state
  updateLastActivity();

  // Bind Hotels after DOM exists
  const hotelsListEl   = document.querySelector("#hotelsList");
  const hotelFormEl    = document.querySelector("#hotelForm");
  const hotelPlaceEl   = document.querySelector("#hotelPlace");
  const hotelCheckInEl = document.querySelector("#hotelCheckIn");
  const hotelCheckOutEl= document.querySelector("#hotelCheckOut");
  const hotelNoteEl    = document.querySelector("#hotelNote");

  if (hotelsListEl) {
    loadHotels();
  }

  // Global delegated handler for removing hotels (bulletproof)
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".remove-hotel");
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.id;
    try {
      await req(`/api/hotels/${id}`, { method: "DELETE" });
      await loadHotels();
      addActivity("Hotel removed");
    } catch (err) {
      console.error("Failed to remove hotel:", err);
      alert("Could not remove hotel: " + err.message);
    }
  });

  if (hotelFormEl) {
    hotelFormEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const place   = hotelPlaceEl?.value.trim();
      const checkIn = hotelCheckInEl?.value.trim();
      const checkOut= hotelCheckOutEl?.value.trim();
      const note    = hotelNoteEl?.value.trim() || null;

      if (!place) return;

      try {
        await req("/api/hotels", {
          method: "POST",
          body: JSON.stringify({ place, checkIn, checkOut, note }),
        });
        hotelFormEl.reset();
        await loadHotels();
        addActivity(`Hotel added: ${place}`);
      } catch (err) {
        console.error("Hotel add failed:", err);
        alert("Could not add hotel: " + err.message);
      }
    });
  }
});
