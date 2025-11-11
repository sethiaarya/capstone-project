/* Golden Twilight • Dashboard (SAFE RENDER VERSION)
   - No innerHTML string templates (prevents layout corruption).
   - Pure DOM node creation & event delegation.
   - Trips + Wishlist only (no Saved Destinations wiring).
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

function addActivity(msg) {
  const box = $("#activityList");
  if (!box) return;
  const row = document.createElement("div");
  row.className = "border border-[color:var(--line)] rounded-xl p-3";
  row.textContent = msg;
  box.prepend(row);
}

/* ------------------ Trips ------------------ */
const tripsList = $("#tripsList");
const kpiTrips = $("#kpiTrips");
const tripForm = $("#tripForm");

function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

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
  const dest = $("#tripDest").value.trim();
  const start = $("#tripStart").value.trim();
  const end = $("#tripEnd").value.trim();
  const budgetRaw = $("#tripBudget").value.trim();
  const budget = budgetRaw === "" ? null : budgetRaw;

  if (!title || !dest || !start || !end) return; // keep UI quiet
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
const kpiWishlist = $("#kpiWishlist");
const wishForm = $("#wishForm");

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

  // Place button on the right side of the top row
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
  const note = $("#wishNote").value.trim() || null;
  if (!place) return;
  await req("/api/wishlist", {
    method: "POST",
    body: JSON.stringify({ place, note }),
  });
  wishForm.reset();
  await loadWishlist();
  addActivity(`Added to wishlist: ${place}`);
});

/* ------------------ init ------------------ */
document.addEventListener("DOMContentLoaded", () => {
  // Guard: do nothing if containers aren’t on this page.
  if (tripsList) loadTrips();
  if (wishlistList) loadWishlist();
});
