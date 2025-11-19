/* Golden Twilight • Dashboard (Auth-fixed + 2b/2c UX)
   - credentials:"same-origin" so session cookie sticks
   - IDs match personal_dashboard.html (regForm/loginForm + regName/regEmail/regPass)
   - Inline auth status + disabled buttons while pending (2b)
   - Modal closes on Esc & backdrop click (2c)
*/

const $ = (sel) => document.querySelector(sel);

/* ------------------ core helpers ------------------ */
async function req(url, opts = {}) {
  const r = await fetch(url, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  let body = null;
  try { body = await r.json(); } catch (_) {}
  if (!r.ok) throw new Error(body?.error || `HTTP ${r.status}`);
  return body;
}
const text = (v) => (v == null ? "" : String(v));

/* ------------------ activity / KPI ------------------ */
function formatTimestamp(date) {
  const d = new Date(date);
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const y = new Date(now); y.setDate(now.getDate() - 1);

  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const isYesterday =
    d.getFullYear() === y.getFullYear() &&
    d.getMonth() === y.getMonth() &&
    d.getDate() === y.getDate();

  if (isToday) return `Today ${time}`;
  if (isYesterday) return `Yesterday ${time}`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + ` ${time}`;
}

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
  if (kpiActivity) kpiActivity.textContent = formatTimestamp(new Date());
}

/* ------------------ misc util ------------------ */
function clearNode(node) {
  while (node && node.firstChild) node.removeChild(node.firstChild);
}

/* ===== 2b: tiny status helpers for the auth forms ===== */
function ensureFormStatusEl(form) {
  let el = form.querySelector('[data-form-status]');
  if (!el) {
    el = document.createElement("div");
    el.setAttribute("data-form-status", "1");
    el.className = "text-sm mt-2";
    form.appendChild(el);
  }
  return el;
}
function setFormStatus(form, msg, kind = "info") {
  const el = ensureFormStatusEl(form);
  el.textContent = msg || "";
  el.className = "text-sm mt-2 " + (
    kind === "error" ? "text-red-600" :
    kind === "success" ? "text-emerald-600" :
    "text-gray-600"
  );
}
function withPending(btn, pendingText, fn) {
  const orig = btn.textContent;
  btn.disabled = true;
  btn.textContent = pendingText;
  return fn().finally(() => {
    btn.disabled = false;
    btn.textContent = orig;
  });
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

/* ------------------ Hotels (unchanged functionally) ------------------ */
const hotelsList   = $("#hotelsList");
const kpiHotels    = $("#kpiHotels");
const kpiHotelsInline = $("#kpiHotelsInline");
const hotelForm    = $("#hotelForm");
const hotelPlace   = $("#hotelPlace");
const hotelCheckIn = $("#hotelCheckIn");
const hotelCheckOut= $("#hotelCheckOut");
const hotelNote    = $("#hotelNote");

function hotelLinks(place, checkIn, checkOut) {
  const p  = encodeURIComponent(place || "");
  const ci = checkIn ? encodeURIComponent(checkIn) : null;
  const co = checkOut ? encodeURIComponent(checkOut) : null;

  let google  = `https://www.google.com/travel/hotels?q=${p}`;
  if (ci) google  += `&checkin=${ci}`;
  if (co) google  += `&checkout=${co}`;

  let booking = `https://www.booking.com/searchresults.html?ss=${p}`;
  if (ci) booking += `&checkin=${ci}`;
  if (co) booking += `&checkout=${co}`;

  let expedia = `https://www.expedia.com/Hotel-Search?destination=${p}`;
  if (ci) expedia += `&checkIn=${ci}`;
  if (co) expedia += `&checkOut=${co}`;

  return { google, booking, expedia };
}

function mapsEmbedUrl(place) {
  const q = encodeURIComponent(place || "");
  return `https://www.google.com/maps?q=${q}&output=embed`;
}

function hotelCard(h) {
  const card = document.createElement("div");
  card.className = "rounded-2xl border border-[var(--line)] bg-white p-4 space-y-2";

  const title = document.createElement("div");
  title.className = "text-lg font-semibold text-[var(--navy)]";
  title.textContent = h.place || "—";
  card.appendChild(title);

  const dates = document.createElement("div");
  dates.className = "text-xs text-[var(--muted)]";
  dates.textContent = `${h.checkIn || "—"} → ${h.checkOut || "—"}`;
  card.appendChild(dates);

  if (h.note) {
    const note = document.createElement("div");
    note.className = "text-[13px] text-[var(--muted)]";
    note.textContent = h.note;
    card.appendChild(note);
  }

  const row = document.createElement("div");
  row.className = "flex items-center justify-between gap-2 pt-1 flex-wrap";
  card.appendChild(row);

  const left = document.createElement("div");
  left.className = "flex items-center gap-2 flex-wrap";
  row.appendChild(left);

  const { google, booking, expedia } = hotelLinks(h.place, h.checkIn, h.checkOut);
  const mk = (href, label) => {
    const a = document.createElement("a");
    a.href = href; a.target = "_blank"; a.rel = "noopener";
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

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-hotel btn btn-navy text-[13px]";
  removeBtn.dataset.id = h.id;
  removeBtn.textContent = "Remove";
  row.appendChild(removeBtn);

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
  if (kpiHotelsInline) kpiHotelsInline.textContent = items.length;

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

  /* ------------------ Flights / Bookings ------------------ */

const bookingsList = document.querySelector("#flights-list");   // 👈 matches Dashboard.html
const kpiFlights = document.querySelector("#kpiFlights");       // optional KPI counter

function bookingCard(b) {
  const card = document.createElement("div");
  card.className = "border border-[color:var(--line)] rounded-xl p-3";

  card.innerHTML = `
    <div class="font-semibold">${b.from_city} → ${b.to_city}</div>
    <div class="text-[13px] text-[color:var(--muted)]">
      ${b.flight_date} · ${b.airline} · ${b.duration}
    </div>
    <div class="text-[12px] text-[color:var(--muted)]">Passengers: ${b.passengers}</div>
    <div class="text-gold font-semibold mt-1">Total: $${b.total}</div>
  `;
  return card;
}

async function loadBookings() {
  try {
    const items = await req("/api/bookings");   // 👈 calls backend
    if (kpiFlights) kpiFlights.textContent = items.length;

    clearNode(bookingsList);

    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "border border-[color:var(--line)] rounded-xl p-3 text-[color:var(--muted)]";
      empty.textContent = "No booked flights yet.";
      bookingsList.appendChild(empty);
      return;
    }

    for (const b of items) bookingsList.appendChild(bookingCard(b));
  } catch (err) {
    console.error("Error loading bookings:", err);
  }
}

// 👈 Call it when dashboard loads
loadBookings();


/* ------------------ AUTH (single, clean) ------------------ */
function setUserUI(me) {
  const statusLabel = document.querySelector("#statusLabel");
  const navUserName = document.querySelector("#navUserName");
  const openBtn     = document.querySelector("#openAuth");
  const logoutBtn   = document.querySelector("#logoutBtn");
  const modal       = document.querySelector("#authModal");

  if (me) {
    statusLabel && (statusLabel.textContent = "Signed in");
    if (navUserName) {
      navUserName.textContent = me.fullName || me.email || "You";
      navUserName.classList.remove("hidden");
    }
    openBtn?.classList.add("hidden");
    logoutBtn?.classList.remove("hidden");
    // close modal if open
    modal?.classList.add("hidden");
    modal?.classList.remove("flex");
  } else {
    statusLabel && (statusLabel.textContent = "Guest");
    if (navUserName) { navUserName.textContent = ""; navUserName.classList.add("hidden"); }
    openBtn?.classList.remove("hidden");
    logoutBtn?.classList.add("hidden");
  }
}

async function refreshMe() {
  try {
    const me = await req("/api/auth/me"); // {id,email,fullName,avatarUrl} or null
    setUserUI(me);
    return me;
  } catch (e) {
    console.error("refreshMe failed:", e);
    setUserUI(null);
    return null;
  }
}

function initAuthUI() {
  const modal     = document.querySelector("#authModal");
  const openAuth  = document.querySelector("#openAuth");
  const closeAuth = document.querySelector("#closeAuth");
  const regForm   = document.querySelector("#regForm");
  const loginForm = document.querySelector("#loginForm");
  const logoutBtn = document.querySelector("#logoutBtn");

  // Open modal
  openAuth?.addEventListener("click", () => {
    modal?.classList.remove("hidden");
    modal?.classList.add("flex");
  });

  // ===== 2c: close modal on backdrop click & Esc =====
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) { // clicked the overlay outside the card
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal?.classList.contains("hidden")) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  });
  closeAuth?.addEventListener("click", () => {
    modal?.classList.add("hidden");
    modal?.classList.remove("flex");
  });

  // Register
  regForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = $("#regName")?.value.trim();
    const email    = $("#regEmail")?.value.trim();
    const password = $("#regPass")?.value;
    if (!fullName || !email || !password) {
      setFormStatus(regForm, "Please fill full name, email, and password.", "error");
      return;
    }
    const submitBtn = regForm.querySelector("button[type='submit'], .btn");
    await withPending(submitBtn, "Creating…", async () => {
      try {
        await req("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ fullName, email, password }),
        });
        setFormStatus(regForm, "Profile created!", "success");
        addActivity(`Profile created: ${fullName}`);
        await refreshMe();
      } catch (err) {
        setFormStatus(regForm, err.message || "Registration failed", "error");
      }
    });
  });

  // Login
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email    = $("#loginEmail")?.value.trim();
    const password = $("#loginPass")?.value;
    if (!email || !password) {
      setFormStatus(loginForm, "Email and password required.", "error");
      return;
    }
    const submitBtn = loginForm.querySelector("button[type='submit'], .btn");
    await withPending(submitBtn, "Signing in…", async () => {
      try {
        await req("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setFormStatus(loginForm, "Signed in!", "success");
        addActivity("Signed in");
        await refreshMe();
      } catch (err) {
        setFormStatus(loginForm, err.message || "Sign in failed", "error");
      }
    });
  });

  // Logout
  logoutBtn?.addEventListener("click", async () => {
    try {
      await req("/api/auth/logout", { method: "POST", body: "{}" });
      addActivity("Signed out");
      await refreshMe();
    } catch (e) {
      alert(e.message || "Sign out failed");
    }
  });

  // Initial state
  refreshMe();
}

/* ------------------ boot ------------------ */
document.addEventListener("DOMContentLoaded", () => {
  if (tripsList) loadTrips();
  if (wishlistList) loadWishlist();
  if (hotelsList) loadHotels();

  updateLastActivity();
  initAuthUI();

  // Global handler for removing hotels
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
      alert("Could not remove hotel: " + err.message);
    }
  });

  // Hotel submit
  if (hotelForm) {
    hotelForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const place   = hotelPlace?.value.trim();
      const checkIn = hotelCheckIn?.value.trim();
      const checkOut= hotelCheckOut?.value.trim();
      const note    = hotelNote?.value.trim() || null;
      if (!place) return;
      try {
        await req("/api/hotels", {
          method: "POST",
          body: JSON.stringify({ place, checkIn, checkOut, note }),
        });
        hotelForm.reset();
        await loadHotels();
        addActivity(`Hotel added: ${place}`);
      } catch (err) {
        alert("Could not add hotel: " + err.message);
      }
    });
  }

// === Simran: Load booked flights from backend (Neon) and show on dashboard ===
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("flights-list");
  if (!container) return;

  try {
    const res = await fetch("/api/bookings");
    if (!res.ok) {
      throw new Error("Server returned " + res.status);
    }

    const bookings = await res.json();

    if (!bookings || bookings.length === 0) {
      container.innerHTML = `
        <div class="bg-white rounded-xl p-4 shadow text-sm text-slate-600">
          No flights booked yet.
          Go to <a href="flights.html" class="text-blue-600 underline">Flights</a> to add one.
        </div>
      `;
      return;
    }

    bookings.forEach((b) => {
      const div = document.createElement("div");
      div.className = "bg-white rounded-xl p-4 shadow flex flex-col gap-1";

      const dateText = b.flight_date
        ? new Date(b.flight_date).toISOString().split("T")[0]
        : "Flexible date";

      const createdText = b.created_at
        ? new Date(b.created_at).toLocaleString()
        : "";

      div.innerHTML = `
        <div class="flex justify-between gap-4">
          <div>
            <div class="font-semibold text-slate-900">
              ${b.from_city} → ${b.to_city}
            </div>
            <div class="text-[12px] text-slate-600">
              ${dateText} • ${b.airline || "Airline"} ${b.duration ? "• " + b.duration : ""}
            </div>
            <div class="text-[12px] text-slate-600">
              Passengers: ${b.passengers}
            </div>
          </div>
          <div class="text-right">
            <div class="text-[13px] font-semibold text-emerald-600">
              Total: $${b.total}
            </div>
            ${
              createdText
                ? `<div class="text-[11px] text-slate-400 mt-1">
                     Booked: ${createdText}
                   </div>`
                : ""
            }
          </div>
        </div>
      `;

      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading bookings:", err);
    container.innerHTML = `
      <div class="bg-white rounded-xl p-4 shadow text-sm text-red-600">
        Could not load your flights from the server.
      </div>
    `;
  }
});
// === END Simran section ===

async function loadBookings() {
  const res = await fetch("/api/bookings");
  const bookings = await res.json();

  const list = document.getElementById("flights-List");
  list.innerHTML = "";

  if (!bookings.length) {
    list.innerHTML = "<div class='text-slate-500'>No activity yet.</div>";
    return;
  }

  bookings.forEach(b => {
    const item = document.createElement("div");
    item.className = "bg-white rounded-xl p-4 shadow";
    item.innerHTML = `
      <div class="font-semibold">${b.from_city} → ${b.to_city}</div>
      <div class="muted">Date: ${b.flight_date}</div>
      <div class="muted">Airline: ${b.airline}</div>
      <div class="muted">Passengers: ${b.passengers}</div>
      <div class="muted">Duration: ${b.duration}</div>
      <div class="text-gold font-semibold mt-1">Total: $${b.total}</div>
    `;
    list.appendChild(item);
  });
}

loadBookings();


});
