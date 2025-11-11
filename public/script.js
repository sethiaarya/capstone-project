document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ public/script.js loaded (DOM ready)");

  const $ = (s) => document.querySelector(s);
  const grid = $("#cardsGrid");
  const savedRibbon = $("#savedRibbon");
  const searchInput = $("#searchInput");
  const chipsRow = $("#chipsRow");
  const loadMoreBtn = $("#loadMoreBtn");

  const IMG_NYC = "img/nyc.jpg";
  const IMG_TOKYO = "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2094";

  const destinations = [
    { id:"paris", title:"Paris, France", region:"Île-de-France", description:"Romance, lights, and rich culture.", img:"https://images.unsplash.com/photo-1543342684-4a3928eb2edc?q=80&w=1600&auto=format&fit=crop",
      badges:["Classic","Romantic"], tags:["romantic","art","culture","city"], rating:4.7, reviews:5892, priceText:"From €65/day", best:"Best: Apr–Jun, Sep–Oct", safe:"Safe" },
    { id:"tokyo", title:"Tokyo, Japan", region:"Kanto Region", description:"Futuristic skyline meets ancient tradition.", img:IMG_TOKYO,
      badges:["Hidden Gem","Cultural"], tags:["cultural","temples","nature","city"], rating:4.9, reviews:3124, priceText:"From ¥8,500/day", best:"Best: Mar–May, Oct–Nov", safe:"Safe" },
    { id:"nyc", title:"New York, USA", region:"New York State", description:"The city that never sleeps.", img:IMG_NYC,
      badges:["Trending","City"], tags:["city","nightlife","food"], rating:4.8, reviews:7421, priceText:"From $120/day", best:"Best: Apr–Oct", safe:"Safe" },
    { id:"rome", title:"Rome, Italy", region:"Lazio", description:"Walk through the heart of ancient civilization.", img:"https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=1600&auto=format&fit=crop",
      badges:["UNESCO","History"], tags:["history","art","food"], rating:4.6, reviews:4231, priceText:"From €55/day", best:"Best: Apr–Jun, Sep–Oct", safe:"Moderate Risk" },
    { id:"bali", title:"Bali, Indonesia", region:"Indonesian Archipelago", description:"A tropical paradise full of magic and relaxation.", img:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
      badges:["Hot","Tropical"], tags:["beach","tropical","spiritual","nature"], rating:4.6, reviews:4231, priceText:"From $45/day", best:"Best: Apr–Oct", safe:"Safe" },
    { id:"dubai", title:"Dubai, UAE", region:"United Arab Emirates", description:"Luxury and innovation in the desert.", img:"https://images.unsplash.com/photo-1534214526114-0ea4d2d48eb7?q=80&w=1600&auto=format&fit=crop",
      badges:["Luxury","City"], tags:["luxury","city","shopping"], rating:4.5, reviews:2687, priceText:"From AED 250/day", best:"Best: Nov–Mar", safe:"Safe" }
  ];

  const state = {
    visibleCount: 6,
    query: "",
    chips: new Set(),
    saved: new Set(JSON.parse(localStorage.getItem("gt_saved") || "[]")) // local first
  };

  // try to merge DB-saved into state.saved on load
  (async () => {
    try {
      const r = await fetch("/api/saved");
      if (r.ok) {
        const rows = await r.json(); // [{destination_id,...}]
        rows.forEach(row => state.saved.add(row.destination_id));
        localStorage.setItem("gt_saved", JSON.stringify([...state.saved]));
        render(); renderSavedRibbon();
      }
    } catch (e) {
      console.warn("DB /api/saved not reachable; using local only.", e);
    }
  })();

  const pill = (t) => `<span class="pill text-xs px-2 py-1 rounded-full">${t}</span>`;
  const tag  = (t) => `<span class="tag text-xs px-2 py-1 rounded-full">${t}</span>`;
  const stars = (r,n)=>`
    <div class="flex items-center gap-1 text-[#FFB703]">
      <span>★ ★ ★ ★</span>
      <span class="ml-2 text-black/80 font-medium">${r.toFixed(1)}</span>
      <span class="text-black/60 text-sm">(${n.toLocaleString()})</span>
    </div>`;

  function cardHTML(d){
    const isSaved = state.saved.has(d.id);
    return `
      <article class="rounded-2xl overflow-hidden bg-white text-[#0f172a] shadow-glow">
        <div class="relative h-56">
          <img src="${d.img}" alt="${d.title}" class="w-full h-full object-cover"/>
          <div class="absolute top-3 left-3 flex gap-2">${d.badges.map(pill).join("")}</div>
          <button data-save="${d.id}" class="absolute top-3 right-3 bg-white/90 rounded-full p-2 hover:scale-105 transition">
            ${isSaved ? "💛" : "🤍"}
          </button>
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-lg">${d.title}</h3>
          <p class="text-sm text-slate-600">${d.region}</p>
          <p class="mt-2 text-sm text-slate-700">${d.description}</p>
          <div class="mt-2">${stars(d.rating, d.reviews)}</div>
          <p class="mt-2 text-sm text-slate-700">${d.tags.slice(0,3).map(tag).join(" ")}</p>
          <div class="mt-3 flex items-center justify-between">
            <span class="font-bold text-[#FFB703]">${d.priceText}</span>
            <a href="#" class="text-[#003566] font-semibold hover:underline">View Details →</a>
          </div>
          <div class="mt-2 flex items-center gap-3 text-xs text-slate-600">
            <span>📅 ${d.best}</span>
            <span>🛡️ ${d.safe}</span>
          </div>
        </div>
      </article>
    `;
  }

  function filterList(){
    let list = [...destinations];
    if (state.query) {
      const q = state.query.toLowerCase();
      list = list.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.tags.join(" ").toLowerCase().includes(q)
      );
    }
    if (state.chips.size) {
      list = list.filter(d =>
        [...state.chips].every(c =>
          d.tags.includes(c) || d.badges.map(b=>b.toLowerCase()).includes(c)
        )
      );
    }
    return list;
  }

  function render(){
    const list = filterList().slice(0, state.visibleCount);
    grid.innerHTML = list.map(cardHTML).join("");

    // hearts (toggle + sync)
    grid.querySelectorAll("[data-save]").forEach(btn=>{
      btn.addEventListener("click", async ()=>{
        const id = btn.getAttribute("data-save");
        const d = destinations.find(x=>x.id===id);

        // optimistic local
        if (state.saved.has(id)) state.saved.delete(id); else state.saved.add(id);
        localStorage.setItem("gt_saved", JSON.stringify([...state.saved]));
        render(); renderSavedRibbon();

        // DB sync (non-blocking)
        try {
          await fetch("/api/saved", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              destination_id: d.id,
              destination_title: d.title,
              destination_region: d.region,
              image_url: d.img
            })
          });
        } catch (e) {
          console.warn("DB save failed; kept local.", e);
        }
      });
    });

    if (loadMoreBtn) {
      loadMoreBtn.style.display = filterList().length > state.visibleCount ? "inline-flex" : "none";
    }
  }

  function renderSavedRibbon(){
    const items = [...state.saved].map(id => destinations.find(d=>d.id===id)).filter(Boolean);
    if (!items.length) {
      savedRibbon.innerHTML = `<div class="text-white/70">No saved destinations yet — tap the heart 💛 on any card.</div>`;
      return;
    }
    savedRibbon.innerHTML = items.map(d=>`
      <div class="min-w-[240px] bg-white text-[#0f172a] rounded-xl overflow-hidden shadow">
        <img src="${d.img}" alt="${d.title}" class="h-28 w-full object-cover">
        <div class="p-3">
          <div class="font-semibold">${d.title}</div>
          <div class="text-xs text-slate-600">${d.region}</div>
        </div>
      </div>
    `).join("");
  }

  // search
  if (searchInput) {
    searchInput.addEventListener("input", e => {
      state.query = e.target.value.trim();
      state.visibleCount = 6;
      render();
    });
  }

  // chips
  if (chipsRow) {
    chipsRow.querySelectorAll(".chip").forEach(chip=>{
      chip.addEventListener("click", ()=>{
        const key = chip.dataset.chip;
        if (state.chips.has(key)) {
          state.chips.delete(key);
          chip.classList.remove("active");
        } else {
          state.chips.add(key);
          chip.classList.add("active");
        }
        state.visibleCount = 6;
        render();
      });
    });
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", ()=>{
      state.visibleCount += 6;
      render();
    });
  }

  render();
  renderSavedRibbon();
});