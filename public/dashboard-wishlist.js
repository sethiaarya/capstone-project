// public/dashboard-wishlist.js
console.log("✅ dashboard-wishlist.js loaded");

const $ = (sel) => document.querySelector(sel);

async function fetchJSON(url, opt) {
  const r = await fetch(url, opt);
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
}

// ------- Wishlist -------
async function loadWishlist() {
  const list = await fetchJSON("/api/wishlist");
  const box = $("#wishlistList");
  const stat = $("#statWishlist");
  if (!box) return;

  if (stat) stat.textContent = String(list.length);

  if (!list.length) {
    box.innerHTML = `<div class="text-slate-500 text-sm">No wishlist items yet.</div>`;
    return;
  }

  box.innerHTML = list
    .map(
      (w) => `
      <div class="flex items-center justify-between p-3 rounded-lg border border-slate-200">
        <div>
          <div class="font-medium">${w.destination}</div>
          ${w.note ? `<div class="text-sm text-slate-500">${w.note}</div>` : ""}
        </div>
        <div class="text-xs text-slate-500">${new Date(w.added_at).toLocaleDateString()}</div>
      </div>`
    )
    .join("");
}

async function addWishlistItem() {
  const place = $("#wishPlace")?.value.trim();
  const note = $("#wishNote")?.value.trim() || null;
  if (!place) return;

  await fetchJSON("/api/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ place, note }),
  });

  $("#wishPlace").value = "";
  $("#wishNote").value = "";
  await loadWishlist();
  await loadActivity();
}

// ------- Activity -------
async function loadActivity() {
  const list = await fetchJSON("/api/activity");
  const box = $("#activityList");
  const stat = $("#statActivity");
  if (!box) return;

  if (stat) stat.textContent = String(list.length);

  if (!list.length) {
    box.innerHTML = `<div class="text-slate-500 text-sm">No recent activity.</div>`;
    return;
  }

  box.innerHTML = list
    .map(
      (a) => `
      <div class="flex items-start gap-3 p-3 rounded-lg border border-slate-200">
        <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">✨</div>
        <div class="flex-1">
          <div class="text-sm font-medium">${a.message}</div>
          <div class="text-xs text-slate-500">${new Date(a.created_at).toLocaleString()}</div>
        </div>
      </div>`
    )
    .join("");
}

// ------- init -------
document.addEventListener("DOMContentLoaded", () => {
  // Align the wishlist Add row neatly
  const row = document.querySelector("#wishlistRow");
  if (row) row.classList.add("items-center");

  $("#addWishBtn")?.addEventListener("click", addWishlistItem);
  loadWishlist().catch(console.error);
  loadActivity().catch(console.error);
});
