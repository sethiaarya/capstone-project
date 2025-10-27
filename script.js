const destinations = [
    {
        name: "Paris, France",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
        description: "The City of Love. Romance, lights, and rich culture.",
        climate: "Mild Continental",
        bestTime: "Apr–Jun, Sep–Oct",
        attractions: ["Eiffel Tower", "Louvre", "Notre-Dame"]
    },
    {
        name: "Tokyo, Japan",
        image: "https://images.unsplash.com/photo-1568084300194-95bb3a2939a7",
        description: "Futuristic skyline meets ancient tradition.",
        climate: "Humid Subtropical",
        bestTime: "Mar–May, Oct–Nov",
        attractions: ["Shibuya", "Tokyo Tower", "Senso-ji"]
    },
    {
        name: "New York, USA",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
        description: "The city that never sleeps.",
        climate: "Humid Continental",
        bestTime: "Apr–Jun, Sep–Nov",
        attractions: ["Times Square", "Central Park", "Liberty"]
    },
    {
        name: "Rome, Italy",
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
        description: "Walk through the heart of ancient civilization.",
        climate: "Mediterranean",
        bestTime: "Apr–Jun, Sep–Oct",
        attractions: ["Colosseum", "Vatican", "Trevi Fountain"]
    },
    {
        name: "Bali, Indonesia",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        description: "A tropical paradise full of magic and relaxation.",
        climate: "Tropical",
        bestTime: "Apr–Oct",
        attractions: ["Ubud", "Tanah Lot", "Beaches"]
    },
    {
        name: "Dubai, UAE",
        image: "https://images.unsplash.com/photo-1506790409786-287062b21cfe",
        description: "Luxury and innovation in the desert.",
        climate: "Desert",
        bestTime: "Nov–Mar",
        attractions: ["Burj Khalifa", "Palm Jumeirah", "Desert Safari"]
    }
];

const container = document.getElementById("destinations");
const searchInput = document.getElementById("search");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");

function displayDestinations(destList = destinations) {
    container.innerHTML = "";

    destList.forEach(place => {
        const elem = document.createElement("div");
        elem.className = "bg-glow text-twilight rounded-xl overflow-hidden shadow-xl cursor-pointer transform hover:-translate-y-2 transition";

        elem.innerHTML = `
            <img class="w-full h-44 object-cover" src="${place.image}">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gold">${place.name}</h3>
                <p class="text-sm text-twilight/80 mt-2">${place.description}</p>
            </div>
        `;

        elem.addEventListener("click", () => showDetails(place));
        container.appendChild(elem);
    });
}

function showDetails(place) {
    modal.classList.remove("hidden");
    document.getElementById("modalTitle").textContent = place.name;
    document.getElementById("modalDesc").textContent = place.description;

    const list = document.getElementById("modalDetail");
    list.innerHTML = `
        <li><strong>Climate:</strong> ${place.climate}</li>
        <li><strong>Best Time:</strong> ${place.bestTime}</li>
        <li><strong>Attractions:</strong> ${place.attractions.join(", ")}</li>
    `;
}

searchInput.addEventListener("input", e => {
    const text = e.target.value.toLowerCase();
    const filtered = destinations.filter(d =>
        d.name.toLowerCase().includes(text) ||
        d.attractions.join(" ").toLowerCase().includes(text)
    );
    displayDestinations(filtered);
});

closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
});

displayDestinations();
