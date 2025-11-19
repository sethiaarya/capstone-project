// Destination data
const destinations = [
  {
    name: "Santorini",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1602686082498-bc97cea3f832?w=500&h=400&fit=crop",
    description: "Iconic sunsets, volcanic beaches, and charming villages perched on dramatic cliffs",
    rating: 4.8,
    bestTime: "Apr - Oct",
    tags: ["beach", "culture", "adventure"],
    weather: "Perfect Weather"
  },
  {
    name: "Kyoto",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1725827786681-4929966a01dc?w=500&h=400&fit=crop",
    description: "Ancient temples, traditional gardens, and authentic cultural experiences",
    rating: 4.9,
    bestTime: "Mar - May, Sep - Nov",
    tags: ["culture", "food", "city"],
    weather: "Autumn Colors"
  },
  {
    name: "Patagonia",
    country: "Chile",
    image: "https://images.unsplash.com/photo-1658815025103-447a4eb30847?w=500&h=400&fit=crop",
    description: "Untamed wilderness, glacial landscapes, and world-class trekking adventures",
    rating: 4.7,
    bestTime: "Dec - Mar",
    tags: ["mountain", "adventure"],
    weather: "Adventure Season"
  },
  {
    name: "Bali",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&h=400&fit=crop",
    description: "Tropical paradise with stunning beaches, rice terraces, and spiritual temples",
    rating: 4.7,
    bestTime: "Apr - Oct",
    tags: ["beach", "culture", "adventure"],
    weather: "Tropical Paradise"
  },
  {
    name: "Iceland",
    country: "Iceland",
    image: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=500&h=400&fit=crop",
    description: "Dramatic landscapes with waterfalls, geysers, and the Northern Lights",
    rating: 4.8,
    bestTime: "Jun - Aug",
    tags: ["mountain", "adventure"],
    weather: "Summer Magic"
  },
  {
    name: "Barcelona",
    country: "Spain",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=500&h=400&fit=crop",
    description: "Vibrant city life, stunning architecture by Gaudí, and Mediterranean beaches",
    rating: 4.6,
    bestTime: "May - Oct",
    tags: ["city", "beach", "culture", "food"],
    weather: "Mediterranean Bliss"
  },
  {
    name: "Maldives",
    country: "Maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500&h=400&fit=crop",
    description: "Luxury overwater villas, crystal-clear waters, and pristine coral reefs",
    rating: 4.9,
    bestTime: "Nov - Apr",
    tags: ["beach"],
    weather: "Perfect Beach Weather"
  },
  {
    name: "New York",
    country: "USA",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&h=400&fit=crop",
    description: "The city that never sleeps with iconic landmarks, world-class dining, and Broadway",
    rating: 4.7,
    bestTime: "Apr - Jun, Sep - Nov",
    tags: ["city", "culture", "food"],
    weather: "Big City Energy"
  },
  {
    name: "Swiss Alps",
    country: "Switzerland",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=500&h=400&fit=crop",
    description: "Majestic mountains, charming villages, and year-round outdoor activities",
    rating: 4.8,
    bestTime: "Dec - Mar, Jun - Sep",
    tags: ["mountain", "adventure"],
    weather: "Alpine Adventure"
  },
  {
    name: "Rome",
    country: "Italy",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500&h=400&fit=crop",
    description: "Ancient history, incredible cuisine, and timeless art and architecture",
    rating: 4.8,
    bestTime: "Apr - Jun, Sep - Oct",
    tags: ["culture", "food", "city"],
    weather: "Perfect Sightseeing"
  },
  {
    name: "Dubai",
    country: "UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&h=400&fit=crop",
    description: "Modern luxury, stunning skyscrapers, desert adventures, and pristine beaches",
    rating: 4.6,
    bestTime: "Nov - Mar",
    tags: ["city", "beach", "adventure"],
    weather: "Desert Luxury"
  },
  {
    name: "Machu Picchu",
    country: "Peru",
    image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=500&h=400&fit=crop",
    description: "Ancient Incan citadel set high in the Andes mountains with breathtaking views",
    rating: 4.9,
    bestTime: "May - Sep",
    tags: ["mountain", "culture", "adventure"],
    weather: "Dry Season"
  },
  {
    name: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&h=400&fit=crop",
    description: "The City of Light with iconic landmarks, world-class museums, and romantic ambiance",
    rating: 4.8,
    bestTime: "Apr - Jun, Sep - Oct",
    tags: ["city", "culture", "food"],
    weather: "Spring in Paris"
  },
  {
    name: "Queenstown",
    country: "New Zealand",
    image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=500&h=400&fit=crop",
    description: "Adventure capital with stunning lakes, mountains, and endless outdoor activities",
    rating: 4.7,
    bestTime: "Dec - Feb",
    tags: ["mountain", "adventure"],
    weather: "Summer Adventures"
  },
  {
    name: "Morocco",
    country: "Morocco",
    image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=500&h=400&fit=crop",
    description: "Exotic markets, Sahara Desert, ancient medinas, and rich cultural heritage",
    rating: 4.6,
    bestTime: "Mar - May, Sep - Nov",
    tags: ["culture", "adventure", "food"],
    weather: "Desert Magic"
  },
  {
    name: "Thailand",
    country: "Thailand",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=500&h=400&fit=crop",
    description: "Tropical beaches, ornate temples, vibrant street food, and warm hospitality",
    rating: 4.7,
    bestTime: "Nov - Feb",
    tags: ["beach", "culture", "food"],
    weather: "Tropical Paradise"
  },
  {
    name: "Amsterdam",
    country: "Netherlands",
    image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=500&h=400&fit=crop",
    description: "Charming canals, historic architecture, world-class museums, and cycling culture",
    rating: 4.6,
    bestTime: "Apr - May, Sep - Nov",
    tags: ["city", "culture"],
    weather: "Spring Beauty"
  },
  {
    name: "Norway Fjords",
    country: "Norway",
    image: "https://images.unsplash.com/photo-1601439678777-b2b3c56fa627?w=500&h=400&fit=crop",
    description: "Dramatic fjords, stunning waterfalls, Northern Lights, and pristine wilderness",
    rating: 4.9,
    bestTime: "May - Sep",
    tags: ["mountain", "adventure"],
    weather: "Midnight Sun"
  },
  {
    name: "Cairo",
    country: "Egypt",
    image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=500&h=400&fit=crop",
    description: "Ancient pyramids, Sphinx, pharaonic history, and the mighty Nile River",
    rating: 4.5,
    bestTime: "Oct - Apr",
    tags: ["culture", "adventure"],
    weather: "Ancient Wonders"
  },
  {
    name: "Vancouver",
    country: "Canada",
    image: "https://images.unsplash.com/photo-1559511260-66a654ae982a?w=500&h=400&fit=crop",
    description: "Mountain backdrop, ocean views, diverse neighborhoods, and outdoor adventures",
    rating: 4.7,
    bestTime: "Jun - Sep",
    tags: ["city", "mountain", "adventure"],
    weather: "Pacific Northwest"
  },
  {
    name: "Vietnam",
    country: "Vietnam",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=500&h=400&fit=crop",
    description: "Ha Long Bay, ancient towns, delicious cuisine, and rich cultural heritage",
    rating: 4.6,
    bestTime: "Feb - Apr, Aug - Oct",
    tags: ["beach", "culture", "food", "adventure"],
    weather: "Southeast Asian Gem"
  },
  {
    name: "Ireland",
    country: "Ireland",
    image: "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=500&h=400&fit=crop",
    description: "Rolling green hills, dramatic cliffs, historic castles, and lively pub culture",
    rating: 4.7,
    bestTime: "May - Sep",
    tags: ["culture", "adventure"],
    weather: "Emerald Isle"
  },
  {
    name: "Singapore",
    country: "Singapore",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500&h=400&fit=crop",
    description: "Modern architecture, incredible food scene, lush gardens, and multicultural vibes",
    rating: 4.8,
    bestTime: "Feb - Apr",
    tags: ["city", "food", "culture"],
    weather: "Urban Garden"
  },
  {
    name: "Croatia",
    country: "Croatia",
    image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=500&h=400&fit=crop",
    description: "Adriatic coastline, medieval towns, crystal-clear waters, and island hopping",
    rating: 4.7,
    bestTime: "May - Sep",
    tags: ["beach", "culture", "adventure"],
    weather: "Mediterranean Dream"
  },
  {
    name: "Scottish Highlands",
    country: "Scotland",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=400&fit=crop",
    description: "Rugged mountains, historic castles, lochs, whisky distilleries, and Highland culture",
    rating: 4.6,
    bestTime: "May - Sep",
    tags: ["mountain", "culture", "adventure"],
    weather: "Highland Magic"
  },
  {
    name: "Argentina",
    country: "Argentina",
    image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=500&h=400&fit=crop",
    description: "Tango dancing, wine country, glaciers, vibrant Buenos Aires, and Patagonian wilderness",
    rating: 4.7,
    bestTime: "Oct - Apr",
    tags: ["culture", "food", "adventure", "mountain"],
    weather: "South American Passion"
  },
  {
    name: "Turkey",
    country: "Turkey",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=500&h=400&fit=crop",
    description: "Ancient ruins, hot air balloons in Cappadocia, bazaars, and Turkish delights",
    rating: 4.6,
    bestTime: "Apr - May, Sep - Nov",
    tags: ["culture", "food", "adventure"],
    weather: "East Meets West"
  },
  {
    name: "South Africa",
    country: "South Africa",
    image: "https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=500&h=400&fit=crop",
    description: "Safari adventures, Cape Town beauty, wine regions, and diverse landscapes",
    rating: 4.7,
    bestTime: "May - Sep",
    tags: ["adventure", "beach", "mountain"],
    weather: "Safari Season"
  },
  {
    name: "Portugal",
    country: "Portugal",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=500&h=400&fit=crop",
    description: "Coastal beauty, historic Lisbon, port wine, colorful tiles, and warm sunshine",
    rating: 4.7,
    bestTime: "Mar - May, Sep - Oct",
    tags: ["beach", "culture", "food", "city"],
    weather: "Atlantic Coast"
  },
  {
    name: "Nepal",
    country: "Nepal",
    image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=500&h=400&fit=crop",
    description: "Home to Mount Everest, ancient temples, Himalayan treks, and spiritual heritage",
    rating: 4.8,
    bestTime: "Oct - Nov, Mar - May",
    tags: ["mountain", "adventure", "culture"],
    weather: "Himalayan Wonder"
  }
];

// State
let currentFilter = "all";
let searchQuery = "";

// Render destinations
function renderDestinations() {
  const grid = document.getElementById("destinationsGrid");
  const noResults = document.getElementById("noResults");
  
  // Filter destinations
  let filtered = destinations.filter(dest => {
    const matchesFilter = currentFilter === "all" || dest.tags.includes(currentFilter);
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dest.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = "";
    noResults.classList.remove("hidden");
    return;
  }

  noResults.classList.add("hidden");
  
  grid.innerHTML = filtered.map((dest, index) => `
    <div class="destination-card" onclick="openModal(${index})">
      <div class="relative h-64 overflow-hidden">
        <img src="${dest.image}" 
             alt="${dest.name}" 
             class="w-full h-full object-cover opacity-80">
        <div class="absolute top-4 right-4">
          <span class="pill">${getWeatherEmoji(dest.tags)} ${dest.weather}</span>
        </div>
      </div>
      <div class="p-6">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="text-2xl font-bold">${dest.name}</h3>
            <p class="text-white/60 text-sm">${dest.country}</p>
          </div>
          <div class="rating">${dest.rating}</div>
        </div>
        <p class="text-white/70 text-sm mb-4">
          ${dest.description}
        </p>
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm text-white/60">Best time: ${dest.bestTime}</span>
        </div>
        <div class="flex gap-2 mb-4 flex-wrap">
          ${dest.tags.map(tag => `
            <span class="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
              ${tag}
            </span>
          `).join('')}
        </div>
        <a href="/pages/flights.html" 
           class="text-gold hover:text-yellow-300 font-semibold flex items-center gap-2">
          Book Flight → 
        </a>
      </div>
    </div>
  `).join('');
}

// Get weather emoji based on tags
function getWeatherEmoji(tags) {
  if (tags.includes("beach")) return "🌡️";
  if (tags.includes("mountain")) return "🏔️";
  if (tags.includes("city")) return "🌆";
  if (tags.includes("culture")) return "🏛️";
  return "✨";
}

// Handle filter clicks
document.getElementById("filterChips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  
  // Update active state
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  chip.classList.add("active");
  
  // Update filter
  currentFilter = chip.dataset.filter;
  renderDestinations();
});

// Handle search
document.getElementById("searchInput").addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderDestinations();
});

// Get URL parameters and apply filters/search on page load
function applyURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  const filterParam = urlParams.get('filter');

  // Apply search if present
  if (searchParam) {
    searchQuery = searchParam;
    document.getElementById("searchInput").value = searchParam;
  }

  // Apply filter if present
  if (filterParam) {
    currentFilter = filterParam;
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    const activeChip = document.querySelector(`[data-filter="${filterParam}"]`);
    if (activeChip) {
      activeChip.classList.add("active");
    }
  }

  // Render with applied params
  renderDestinations();
}

// Initial render
applyURLParams();

// Modal functions
function openModal(index) {
  const dest = destinations[index];
  const modal = document.getElementById('destinationModal');
  const modalBody = document.getElementById('modalBody');
  
  modalBody.innerHTML = `
    <div class="relative">
      <!-- Close Button -->
      <button onclick="closeModal()" class="absolute top-4 right-4 z-10 bg-twilight/80 hover:bg-twilight text-white rounded-full w-10 h-10 flex items-center justify-center transition">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <!-- Hero Image -->
      <div class="relative h-96 overflow-hidden rounded-t-2xl">
        <img src="${dest.image}" alt="${dest.name}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-twilight/80 to-transparent"></div>
        <div class="absolute bottom-6 left-6 right-6">
          <div class="flex items-center gap-3 mb-2">
            <span class="pill">${getWeatherEmoji(dest.tags)} ${dest.weather}</span>
            <div class="rating text-base">${dest.rating}</div>
          </div>
          <h2 class="text-4xl font-bold mb-2">${dest.name}</h2>
          <p class="text-white/80 text-lg">${dest.country}</p>
        </div>
      </div>

      <!-- Content -->
      <div class="p-8">
        <!-- Description -->
        <div class="mb-8">
          <h3 class="text-2xl font-bold mb-3">About</h3>
          <p class="text-white/80 leading-relaxed">${dest.description}</p>
        </div>

        <!-- Quick Info -->
        <div class="grid md:grid-cols-2 gap-4 mb-8">
          <div class="bg-white/5 rounded-xl p-4 border border-white/10">
            <div class="text-gold font-semibold mb-1">Best Time to Visit</div>
            <div class="text-white/80">${dest.bestTime}</div>
          </div>
          <div class="bg-white/5 rounded-xl p-4 border border-white/10">
            <div class="text-gold font-semibold mb-1">Rating</div>
            <div class="text-white/80">${dest.rating} ⭐ out of 5</div>
          </div>
        </div>

        <!-- Tags -->
        <div class="mb-8">
          <h3 class="text-2xl font-bold mb-4">Experience Types</h3>
          <div class="flex flex-wrap gap-2">
            ${dest.tags.map(tag => `
              <span class="px-4 py-2 bg-white/10 rounded-full text-sm border border-white/10 text-white/80 capitalize">
                ${tag}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4 pt-4">
          <a href="/pages/flights.html" class="flex-1 bg-gold text-black px-6 py-3 rounded-lg font-semibold hover:brightness-95 transition text-center">
            Book Flights
          </a>
          <a href="/pages/personal_dashboard.html" class="flex-1 border border-gold text-gold px-6 py-3 rounded-lg font-semibold hover:bg-gold hover:text-black transition text-center">
            Add to Wishlist
          </a>
        </div>
      </div>
    </div>
  `;
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(event) {
  if (!event || event.target.id === 'destinationModal') {
    const modal = document.getElementById('destinationModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});
