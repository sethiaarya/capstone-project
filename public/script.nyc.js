/* ===============================
   Golden Twilight – script.js (v2)
   This build FORCE-sets New York's
   image to a local file: img/nyc.jpg
   =============================== */

console.log("script.js v2 loaded — forcing NYC image");

/* ---- Data ---- */
const destinations = [
  {
    name: "Paris, France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80",
    description: "The City of Love. Romance, lights, and rich culture.",
    climate: "Mild Continental",
    bestTime: "Apr–Jun, Sep–Oct",
    attractions: ["Eiffel Tower", "Louvre", "Notre-Dame"]
  },
  {
    name: "Tokyo, Japan",
    image: "https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=1600&q=80",
    description: "Futuristic skylines meet ancient temples and tea gardens.",
    climate: "Humid Subtropical",
    bestTime: "Mar–May, Oct–Nov",
    attractions: ["Shibuya Crossing", "Tokyo Tower", "Senso-ji Temple"]
  },
  {
    name: "New York, USA",
    image: "img/nyc.jpg", // local image under /public/img/nyc.jpg
    description: "The city that never sleeps — skyscrapers, lights, and culture.",
    climate: "Humid Continental",
    bestTime: "Apr–Jun, Sep–Nov",
    attractions: ["Times Square", "Central Park", "Statue of Liberty", "Empire State Building"]
  },
  {
    name: "Rome, Italy",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80",
    description: "Walk through the heart of ancient civilization.",
    climate: "Mediterranean",
    bestTime: "Apr–Jun, Sep–Oct",
    attractions: ["Colosseum", "Vatican City", "Trevi Fountain"]
  },
  {
    name: "Bali, Indonesia",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    description: "Tropical paradise of beaches, temples, and forests.",
    climate: "Tropical",
    bestTime: "Apr–Oct",
    attractions: ["Ubud", "Tanah Lot", "Kuta Beach"]
  },
  {
    name: "Dubai, UAE",
    image: "https://images.unsplash.com/photo-1506790409786-287062b21cfe?auto=format&fit=crop&w=1600&q=80",
    description: "Luxury and innovation rising out of golden desert sands.",
    climate: "Desert",
    bestTime: "Nov–Mar",
    attractions: ["Burj Khalifa", "Palm Jumeirah", "Desert Safari"]
  }
];

/* ---- Elements ---- */
const container = document.getElementById("destinations");
const searchInput = document.getElementById("search");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");

/* ---- Render cards ---- */
function displayDestinations(destList = destinations) {
  container.innerHTML = "";

  destList.forEach(place => {
    const card = document.createElement("div");
    card.className =
      "bg-white/95 text-twilight rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,.25)] " +
      "border border-twilight/10 cursor-pointer transform hover:-translate-y-2 transition";

    const img = document.createElement("img");
    img.className = "w-full h-48 object-cover";
    img.decoding = "async";
    img.loading = "lazy";

    // HARD OVERRIDE for NYC (prevents *any* old/cached URL from sticking)
    if (place.name.toLowerCase().includes("new york")) {
      img.src = "img/nyc.jpg?v=" + Date.now(); // cache-bust local image too
      console.log("NYC image set to:", img.src);
    } else {
      img.src = place.image;
    }

    img.alt = place.name;

    img.onerror = function () {
      if (place.name.toLowerCase().includes("new york")) {
        // If your local file somehow fails, show an obvious fallback text image
        this.src = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'>
             <rect width='100%' height='100%' fill='#001D3D'/>
             <text x='50%' y='50%' font-size='48' fill='#FFC300' text-anchor='middle' font-family='Arial, sans-serif'>
               NYC IMAGE MISSING (img/nyc.jpg)
             </text>
           </svg>`
        );
      } else {
        this.src = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=60";
      }
    };

    const body = document.createElement("div");
    body.className = "p-4";
    body.innerHTML = `
      <h3 class="text-lg font-semibold text-[#FFC300]">${place.name}</h3>
      <p class="text-sm text-twilight/90 mt-2">${place.description}</p>
    `;

    card.appendChild(img);
    card.appendChild(body);
    card.addEventListener("click", () => showDetails(place));
    container.appendChild(card);
  });
}

/* ---- Modal ---- */
function showDetails(place) {
  modal.classList.remove("hidden");
  document.getElementById("modalTitle").textContent = place.name;
  document.getElementById("modalDesc").textContent = place.description;
  document.getElementById("modalDetail").innerHTML = `
    <li><strong>Climate:</strong> ${place.climate}</li>
    <li><strong>Best Time:</strong> ${place.bestTime}</li>
    <li><strong>Attractions:</strong> ${place.attractions.join(", ")}</li>
  `;
}

/* ---- Search ---- */
searchInput.addEventListener("input", e => {
  const text = e.target.value.toLowerCase();
  displayDestinations(
    destinations.filter(d =>
      d.name.toLowerCase().includes(text) ||
      d.description.toLowerCase().includes(text) ||
      d.attractions.join(" ").toLowerCase().includes(text)
    )
  );
});

/* ---- Close modal ---- */
closeModal.addEventListener("click", () => modal.classList.add("hidden"));

/* ---- Init ---- */
displayDestinations();
