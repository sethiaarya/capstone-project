// Small helper
const $ = (sel) => document.querySelector(sel);

const tripsListEl = $("#tripsList");
const wishlistEl = $("#wishlist");
const tripForm = $("#tripForm");
const wishForm = $("#wishForm");
const tripsCount = $("#tripsCount");
const wishCount = $("#wishCount");
const alertBox = $("#alert");

function showAlert(msg, type = "info") {
  alertBox.className = "rounded-lg border px-4 py-3";
  const styles = {
    info:  "border-white/20 bg-white/10",
    ok:    "border-emerald-300/30 bg-emerald-300/15",
    error: "border-red-300/30 bg-red-300/15"
  };
  alertBox.classList.add(...styles[type].split(" "));
  alertBox.innerHTML = msg;
  alertBox.classList.remove("hidden");
  setTimeout(() => alertBox.classList.add("hidden"), 3000);
}
function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

// API wrapper with visible errors
async function fetchJSON(url, options) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
  }
  return res.json().catch(() => ({}));
}

// RENDERERS
function renderTrips(rows = []) {
  tripsCount.textContent = `${rows.length} trips`;
  if (!rows.length) {
    tripsListEl.innerHTML = `<div class="text-sand/60">No trips yet. Add one ✨</div>`;
    return;
  }

  tripsListEl.innerHTML = rows
    .map(t => `
      <div class="py-3">
        <div class="font-semibold text-white">${escapeHtml(t.title)} 
          <span class="text-sand/70">· ${escapeHtml(t.destination)}</span>
        </div>
        <div class="text-sand/70 text-sm">
          ${new Date(t.start_date).toLocaleDateString()} → ${new Date(t.end_date).toLocaleDateString()}
          · Budget: ${t.budget ? `$${Number(t.budget).toLocaleString()}` : "—"}
        </div>
        ${t.notes ? `<div class="text-sand/60 text-sm mt-1">${escapeHtml(t.notes)}</div>` : ""}
      </div>
    `)
    .join("");
}


function renderWishlist(rows = []) {
  wishCount.textContent = `${rows.length} saved`;
  if (!rows.length) {
    wishlistEl.innerHTML = `<div class="text-sand/70">Nothing saved yet. Add a dream spot ✨</div>`;
    return;
  }
  wishlistEl.innerHTML = rows.map(w => {
    const when = w.added_at ? new Date(w.added_at).toLocaleString() : "";
    return `
      <div class="py-3 flex items-center justify-between">
        <div>
          <div class="font-medium">${escapeHtml(w.destination)}</div>
          <div class="text-sand/70 text-sm">${when}</div>
        </div>
      </div>
    `;
  }).join("");
}

// LOADERS
async function loadTrips() {
  try {
    const rows = await fetchJSON("/api/trips");
    renderTrips(rows);
  } catch (e) {
    console.error(e);
    showAlert(`Could not load trips. ${e.message}`, "error");
    renderTrips([]); // keep page stable
  }
}
async function loadWishlist() {
  try {
    const rows = await fetchJSON("/api/wishlist");
    renderWishlist(rows);
  } catch (e) {
    console.error(e);
    showAlert(`Could not load wishlist. ${e.message}`, "error");
    renderWishlist([]);
  }
}

// INIT
document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([loadTrips(), loadWishlist()]);
});

// FORMS
tripForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  if (data.budget === "") data.budget = null;
  try {
    await fetchJSON("/api/trips", { method: "POST", body: JSON.stringify(data) });
    form.reset();
    showAlert("Trip added successfully ✨", "ok");
    await loadTrips();
  } catch (err) {
    console.error(err);
    showAlert("Could not add trip. " + err.message, "error");
  }
});

wishForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await fetchJSON("/api/wishlist", { method: "POST", body: JSON.stringify(data) });
    form.reset();
    showAlert("Added to wishlist ✨", "ok");
    await loadWishlist();
  } catch (err) {
    console.error(err);
    showAlert("Could not add to wishlist. " + err.message, "error");
  }
});
