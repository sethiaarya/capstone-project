/* Dashboard behavior: Trips + Wishlist + Saved ribbon (Travel blog aesthetic) */

const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];

const tripListEl = $("#tripList");
const wishListEl = $("#wishList");
const savedRibbonEl = $("#savedRibbon");

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ---------- TRIPS ---------- */
async function fetchTrips() {
  try {
    const data = await api("/api/trips");
    renderTrips(data || []);
  } catch (e) {
    tripListEl.innerHTML = `<div class="text-red-600">Could not load trips.</div>`;
  }
}

function renderTrips(trips) {
  if (!trips.length) {
    tripListEl.innerHTML =
      `<div class="text-ink/60">No trips yet — plan one with the form above.</div>`;
    return;
  }
  tripListEl.innerHTML = trips
    .map(t => {
      const start = t.start_date ? new Date(t.start_date).toDateString() : "—";
      const end   = t.end_date   ? new Date(t.end_date).toDateString() : "—";
      const budget = typeof t.budget === "number" ? `$${t.budget.toLocaleString()}` : "—";
      return `
        <article class="bg-white/85 rounded-xl border border-black/5 p-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="font-semibold text-twilight">${escapeHTML(t.title || "Untitled Trip")}</h3>
              <p class="text-ink/70 text-sm">${escapeHTML(t.destination || "Somewhere")} • ${start} → ${end}</p>
            </div>
            <div class="text-ink/80 text-sm">Budget: <span class="font-semibold">${budget}</span></div>
          </div>
        </article>
      `;
    })
    .join("");
}

$("#tripForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {
    title: $("#tripTitle").value.trim(),
    destination: $("#tripDestination").value.trim(),
    start_date: $("#tripStart").value || null,
    end_date: $("#tripEnd").value || null,
    budget: $("#tripBudget").value ? Number($("#tripBudget").value) : null,
  };
  if (!body.title || !body.destination) return toast("Please fill title + destination");

  try {
    await api("/api/trips", { method: "POST", body: JSON.stringify(body) });
    e.target.reset();
    toast("Trip added", "ok");
    fetchTrips();
  } catch (err) {
    toast("Could not add trip", "err");
  }
});

/* ---------- WISHLIST ---------- */
async function fetchWishlist() {
  try {
    const data = await api("/api/wishlist");
    renderWishlist(data || []);
    renderSavedRibbon(data || []);
  } catch {
    wishListEl.innerHTML = `<div class="text-red-600">Could not load wishlist.</div>`;
  }
}

function renderWishlist(items) {
  if (!items.length) {
    wishListEl.innerHTML = `<div class="text-ink/60">Nothing saved yet. Add a dream spot ✨</div>`;
    return;
  }
  wishListEl.innerHTML = items
    .map(w => `
      <div class="bg-white/85 rounded-lg border border-black/5 px-3 py-2 flex items-center justify-between">
        <div class="font-medium text-twilight">${escapeHTML(w.destination)}</div>
        <button data-id="${w.id}" class="wish-del text-sm text-red-600 hover:underline">Remove</button>
      </div>
    `)
    .join("");

  // remove handlers
  $$(".wish-del").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        await api(`/api/wishlist/${btn.dataset.id}`, { method: "DELETE" });
        fetchWishlist();
        toast("Removed from wishlist", "ok");
      } catch {
        toast("Could not remove", "err");
      }
    });
  });
}

$("#wishForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const dest = $("#wishInput").value.trim();
  if (!dest) return;
  try {
    await api("/api/wishlist", { method: "POST", body: JSON.stringify({ destination: dest }) });
    $("#wishInput").value = "";
    fetchWishlist();
    toast("Saved ✨", "ok");
  } catch {
    toast("Could not save", "err");
  }
});

/* ---------- SAVED RIBBON (from wishlist) ---------- */
function renderSavedRibbon(items) {
  if (!items.length) {
    savedRibbonEl.innerHTML = `<div class="text-ink/60">Save places to see them here.</div>`;
    return;
  }
  savedRibbonEl.innerHTML = items
    .map(w => {
      const photo = pickPhotoFor(w.destination);
      return `
        <div class="min-w-[240px] bg-white/90 rounded-xl shadow-soft overflow-hidden border border-black/5">
          <div class="h-36 bg-center bg-cover" style="background-image:url('${photo}')"></div>
          <div class="p-3">
            <div class="font-semibold text-twilight">${escapeHTML(w.destination)}</div>
            <div class="text-ink/60 text-sm">Wishlist</div>
          </div>
        </div>
      `;
    })
    .join("");
}

/* ---------- Helpers ---------- */
function toast(msg, type="info") {
  const el = document.createElement("div");
  el.className = `fixed z-50 bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm
    ${type==="ok" ? "bg-twilight text-glow" : type==="err" ? "bg-red-600 text-white" : "bg-ink text-white"}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

// very small destination→photo mapper (extend as you like)
function pickPhotoFor(name = "") {
  const n = name.toLowerCase();
  if (n.includes("tokyo") || n.includes("japan")) {
    return "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1600";
  }
  if (n.includes("new york") || n.includes("nyc")) {
    return "/img/nyc.jpg"; // your local NYC asset
  }
  if (n.includes("paris")) {
    return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1600";
  }
  if (n.includes("rome")) {
    return "https://images.unsplash.com/photo-1548285377-0a79db094e3f?auto=format&fit=crop&q=80&w=1600";
  }
  if (n.includes("bali")) {
    return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1600";
  }
  if (n.includes("dubai")) {
    return "https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&q=80&w=1600";
  }
  return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1600";
}

function escapeHTML(s="") {
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  fetchTrips();
  fetchWishlist();

  // Optional demo autofill to speed testing
  $("#demoFill")?.addEventListener("click", () => {
    $("#tripTitle").value = "Japan 2026";
    $("#tripDestination").value = "Tokyo";
    $("#tripStart").value = "2026-11-22";
    $("#tripEnd").value = "2026-11-30";
    $("#tripBudget").value = "2800";
  });
});
