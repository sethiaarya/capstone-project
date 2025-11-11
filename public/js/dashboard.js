/* public/dashboard.js (with automatic key migration) */
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ dashboard.js loaded");

  /* ---------- Canonical keys ---------- */
  const LS = {
    SAVED: "gt_saved",         // [{id,title,subtitle,img,price,labels,whenSaved}]
    TRIPS: "gt_trips",         // [{id,title,dest,start,end,budget,ts}]
    WISHLIST: "gt_wishlist",   // [{id,place,note,ts}]
    ACTIVITY: "gt_activity"    // [{id,type,title,meta,ts}]
  };

  /* ---------- Likely legacy key names (from earlier sessions) ---------- */
  const LEGACY_KEYS = {
    [LS.SAVED]:   ["saved", "savedDestinations", "gtSaved", "gw_saved", "userSaved"],
    [LS.TRIPS]:   ["trips", "userTrips", "gtTrips", "gw_trips"],
    [LS.WISHLIST]:["wishlist", "userWishlist", "gtWishlist", "gw_wishlist"],
    [LS.ACTIVITY]:["activity", "userActivity", "gtActivity", "gw_activity"]
  };

  /* ---------- Helpers ---------- */
  const $ = (s) => document.querySelector(s);
  const get = (k) => {
    try { return JSON.parse(localStorage.getItem(k) || "[]"); }
    catch (_) { return []; }
  };
  const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const has = (k) => localStorage.getItem(k) !== null;
  const nowISO = () => new Date().toISOString();
  const fmtDate = iso => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit"
    });
  };

  /* ---------- One-time migration: copy legacy -> canonical if canonical empty ---------- */
  function migrateKey(canonicalKey) {
    // If canonical already has data, do nothing.
    const canonVal = get(canonicalKey);
    if (Array.isArray(canonVal) && canonVal.length) return;

    const candidates = LEGACY_KEYS[canonicalKey] || [];
    for (const legacyKey of candidates) {
      if (!has(legacyKey)) continue;
      const legacyVal = get(legacyKey);
      if (Array.isArray(legacyVal) && legacyVal.length) {
        console.log(`🔁 Migrating ${legacyKey} → ${canonicalKey} (${legacyVal.length} items)`);
        set(canonicalKey, legacyVal);
        return;
      }
    }
  }

  function runMigrations() {
    migrateKey(LS.SAVED);
    migrateKey(LS.TRIPS);
    migrateKey(LS.WISHLIST);
    migrateKey(LS.ACTIVITY);
  }

  /* ---------- DOM ---------- */
  const kpiSaved = $("#kpiSaved");
  const kpiTrips = $("#kpiTrips");
  const kpiWishlist = $("#kpiWishlist");
  const kpiActivity = $("#kpiActivity");

  const tripsList = $("#tripsList");
  const activityList = $("#activityList");
  const savedList = $("#savedList");
  const savedCount = $("#savedCount");
  const wishlistList = $("#wishlistList");

  const tripForm = $("#tripForm");
  const tripTitle = $("#tripTitle");
  const tripDest = $("#tripDest");
  const tripStart = $("#tripStart");
  const tripEnd = $("#tripEnd");
  const tripBudget = $("#tripBudget");

  const wishForm = $("#wishForm");
  const wishInput = $("#wishInput");
  const wishNote = $("#wishNote");

  /* ---------- Renderers ---------- */
  function renderTrips() {
    const trips = get(LS.TRIPS);
    kpiTrips.textContent = trips.length;

    tripsList.innerHTML = trips.length
      ? trips.map(t => tripCard(t)).join("")
      : `<div class="rounded-xl border border-slate-200 p-4 text-slate-500">No trips yet. Add one above.</div>`;
  }

  function renderSaved() {
    const saved = get(LS.SAVED);
    kpiSaved.textContent = saved.length;
    savedCount.textContent = saved.length;

    if (!saved.length) {
      savedList.innerHTML = `<div class="rounded-xl border border-slate-200 p-3 text-slate-500">No saved destinations yet. Tap the heart on Explore ✨</div>`;
      return;
    }

    savedList.innerHTML = saved.map(s => `
      <div class="flex items-center gap-3 p-3 rounded-xl border border-slate-200">
        <img src="${s.img || ""}" alt="" class="w-14 h-14 object-cover rounded-lg border"/>
        <div class="min-w-0">
          <p class="font-medium truncate">${s.title || "Saved place"}</p>
          <p class="text-xs text-slate-500 truncate">${s.subtitle || ""}</p>
        </div>
        <span class="ml-auto text-xs text-slate-400">${fmtDate(s.whenSaved)}</span>
      </div>
    `).join("");
  }

  function renderWishlist() {
    const wl = get(LS.WISHLIST);
    kpiWishlist.textContent = wl.length;

    wishlistList.innerHTML = wl.length
      ? wl.map(w => `
          <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200">
            <div>
              <p class="font-medium">${w.place}</p>
              <p class="text-xs text-slate-500">${w.note || ""}</p>
            </div>
            <span class="text-xs text-slate-400">${fmtDate(w.ts)}</span>
          </div>
        `).join("")
      : `<div class="rounded-xl border border-slate-200 p-3 text-slate-500">No wishlist items yet.</div>`;
  }

  function renderActivity() {
    const all = get(LS.ACTIVITY);
    const act = all.slice(-20).reverse();
    const last30d = all.filter(a => (Date.now() - new Date(a.ts).getTime()) <= 30*24*3600*1000);
    kpiActivity.textContent = last30d.length;

    activityList.innerHTML = act.length
      ? act.map(a => `
          <div class="flex items-center gap-3 p-3 rounded-xl border border-slate-200">
            <div class="w-8 h-8 rounded-full grid place-items-center text-white
              ${a.type === "Trip" ? "bg-blue-500" : a.type === "Wishlist" ? "bg-amber-500" : "bg-slate-400"}">
              ${a.type?.[0] || "•"}
            </div>
            <div class="min-w-0">
              <p class="font-medium truncate">${a.title || a.type}</p>
              <p class="text-xs text-slate-500 truncate">${a.meta || ""}</p>
            </div>
            <span class="ml-auto text-xs text-slate-400">${fmtDate(a.ts)}</span>
          </div>
        `).join("")
      : `<div class="rounded-xl border border-slate-200 p-4 text-slate-500">No recent activity.</div>`;
  }

  const tripCard = (t) => `
    <div class="rounded-xl border border-slate-200 p-4">
      <div class="flex items-start justify-between">
        <div>
          <p class="font-semibold">${t.title || "Untitled trip"}</p>
          <p class="text-sm text-slate-600">${t.dest || "—"}</p>
          <p class="text-xs text-slate-500 mt-1">
            ${t.start ? new Date(t.start).toLocaleDateString() : "—"}
            → ${t.end ? new Date(t.end).toLocaleDateString() : "—"}
          </p>
          <p class="text-xs text-slate-500">${t.budget ? `Budget: $${Number(t.budget).toFixed(2)}` : ""}</p>
        </div>
        <span class="px-2 py-1 text-xs rounded-lg bg-slate-100 text-slate-600">Active</span>
      </div>
    </div>
  `;

  /* ---------- Actions ---------- */
  $("#tripForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = (tripTitle.value || "").trim();
    const dest = (tripDest.value || "").trim();
    if (!title || !dest) {
      alert("Please enter a trip title and destination.");
      return;
    }
    const newTrip = {
      id: crypto.randomUUID(),
      title,
      dest,
      start: tripStart.value || null,
      end: tripEnd.value || null,
      budget: tripBudget.value || null,
      ts: nowISO()
    };
    const trips = get(LS.TRIPS); trips.push(newTrip); set(LS.TRIPS, trips);

    const act = get(LS.ACTIVITY);
    act.push({ id: crypto.randomUUID(), type: "Trip", title: `Trip — ${title}`, meta: dest, ts: nowISO() });
    set(LS.ACTIVITY, act);

    e.target.reset();
    renderTrips(); renderActivity();
    kpiTrips.textContent = get(LS.TRIPS).length;
    kpiActivity.textContent = get(LS.ACTIVITY).filter(a => (Date.now() - new Date(a.ts).getTime()) <= 30*24*3600*1000).length;
  });

  $("#wishForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const place = (wishInput.value || "").trim();
    const note = (wishNote.value || "").trim();
    if (!place) { alert("Please enter a place for wishlist."); return; }

    const wl = get(LS.WISHLIST); wl.push({ id: crypto.randomUUID(), place, note, ts: nowISO() }); set(LS.WISHLIST, wl);

    const act = get(LS.ACTIVITY);
    act.push({ id: crypto.randomUUID(), type: "Wishlist", title: `Wishlist — ${place}`, meta: note, ts: nowISO() });
    set(LS.ACTIVITY, act);

    e.target.reset();
    renderWishlist(); renderActivity();
    kpiWishlist.textContent = get(LS.WISHLIST).length;
    kpiActivity.textContent = get(LS.ACTIVITY).filter(a => (Date.now() - new Date(a.ts).getTime()) <= 30*24*3600*1000).length;
  });

  /* ---------- Boot ---------- */
  runMigrations();       // 👈 bring back your old data
  renderTrips();
  renderSaved();
  renderWishlist();
  renderActivity();
});
