// Mock Trip Data for estimation (per person, per day, excluding flight)
const tripEstimates = [
  // Paris (Moderate cost)
  {
    destination: "Paris",
    lodging_per_night: 150, // Mid-range hotel
    food_per_day: 80, // Mix of restaurants and casual dining
    activities_per_day: 50, // Museum/tour average
    misc_per_day: 20,
    base_flight_cost: 650 // Mock flight cost
  },
  // Tokyo (Higher cost)
  {
    destination: "Tokyo",
    lodging_per_night: 180,
    food_per_day: 90,
    activities_per_day: 60,
    misc_per_day: 25,
    base_flight_cost: 1000
  },
  // Chicago (Lower cost)
  {
    destination: "Chicago",
    lodging_per_night: 120,
    food_per_day: 70,
    activities_per_day: 40,
    misc_per_day: 15,
    base_flight_cost: 400
  }
];

// Helper function to format currency
const formatCurrency = (amount) => {
  return `$${Math.round(amount).toLocaleString()}`;
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("tripPlannerForm");
  const resultsContainer = document.getElementById("resultsContainer");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const destination = document.getElementById("destinationInput").value.trim();
    const duration = parseInt(
      document.getElementById("durationInput").value,
      10
    );
    const budget = parseInt(
      document.getElementById("budgetInput").value,
      10
    );

    resultsContainer.innerHTML = "";

    if (!destination || !duration || !budget) {
      resultsContainer.innerHTML =
        `<p class="text-sm text-red-100">Please fill all fields for trip planning.</p>`;
      return;
    }

    // Find the closest matching estimate (case-insensitive)
    const estimate = tripEstimates.find((t) =>
      destination.toLowerCase().includes(t.destination.toLowerCase())
    );

    if (!estimate) {
      resultsContainer.innerHTML =
        `<p class="text-sm text-sky-100">No specific cost data found for ${destination}. Using a general **Average Trip** estimate.</p>`;
      // Use a fallback/average estimate if destination isn't found
      calculateAndDisplay(
        {
          destination: destination,
          lodging_per_night: 140,
          food_per_day: 75,
          activities_per_day: 45,
          misc_per_day: 20,
          base_flight_cost: 700
        },
        duration,
        budget
      );
      return;
    }

    // If an estimate is found
    calculateAndDisplay(estimate, duration, budget);
  });

  function calculateAndDisplay(estimate, duration, budget) {
    const nights = duration; // Using days as nights for simple calculation

    // Calculate sub-totals
    const lodgingTotal = estimate.lodging_per_night * nights;
    const foodTotal = estimate.food_per_day * duration;
    const activitiesTotal = estimate.activities_per_day * duration;
    const miscTotal = estimate.misc_per_day * duration;
    const flightCost = estimate.base_flight_cost;

    // Total estimated cost
    const estimatedTotal =
      lodgingTotal + foodTotal + activitiesTotal + miscTotal + flightCost;

    // Compare with budget
    const difference = budget - estimatedTotal;
    const isOverBudget = difference < 0;

    let statusText = "";
    let statusClass = "";

    if (isOverBudget) {
      statusText = `**$${Math.abs(difference).toLocaleString()} OVER** budget.`;
      statusClass = "text-red-400";
    } else {
      statusText = `**$${difference.toLocaleString()} UNDER** budget!`;
      statusClass = "text-emerald-400";
    }

    // Generate HTML result card
    resultsContainer.innerHTML = `
      <div class="card rounded-2xl bg-white/95 p-6 flex flex-col gap-4 text-slate-800">
        <h3 class="text-xl font-bold text-twilight">
          Estimated Cost for ${estimate.destination} (${duration} Days)
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm">
          <p class="font-semibold">Flight (Round Trip):</p>
          <p class="col-span-1 md:col-span-2">${formatCurrency(flightCost)}</p>

          <p class="font-semibold">Lodging (${nights} nights):</p>
          <p class="col-span-1 md:col-span-2">${formatCurrency(lodgingTotal)}</p>

          <p class="font-semibold">Food/Dining:</p>
          <p class="col-span-1 md:col-span-2">${formatCurrency(foodTotal)}</p>

          <p class="font-semibold">Activities/Tours:</p>
          <p class="col-span-1 md:col-span-2">${formatCurrency(activitiesTotal)}</p>

          <p class="font-semibold">Miscellaneous:</p>
          <p class="col-span-1 md:col-span-2">${formatCurrency(miscTotal)}</p>
        </div>
        <hr class="border-slate-200" />

        <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <p class="text-xs text-slate-500 font-medium">Your Budget: ${formatCurrency(budget)}</p>
            <p class="text-3xl font-extrabold text-slate-900">
              Total Estimate: ${formatCurrency(estimatedTotal)}
            </p>
            <p class="mt-1 text-sm font-semibold ${statusClass}">
              Comparison: ${statusText}
            </p>
          </div>

          <button id="planButton"
                  class="mt-4 md:mt-0 px-6 py-2.5 rounded-lg bg-gold text-black font-semibold shadow hover:brightness-95 transition">
            Plan This Trip!
          </button>
        </div>
      </div>
    `;

    // Add listener for the Plan button
    document.getElementById("planButton").addEventListener("click", () => {
      alert(
        `Trip Planning started!\nDestination: ${estimate.destination}\nDuration: ${duration} Days\nEstimated Total: ${formatCurrency(estimatedTotal)}`
      );
      // future: navigate to a full planning page or save to personal_dashboard.html
    });
  }
});