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
  
  grid.innerHTML = filtered.map(dest => `
    <div class="destination-card">
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
