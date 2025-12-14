// ===========================================================
//                 GLOBAL DATA & CONSTANTS
// ===========================================================

// Manual AQI Data for Home Page & Tools
const MANUAL_DATA = {
    "delhi":    { lat: 28.6139, lon: 77.2090, aqiIndex: 5, pm25: 180, pm10: 250 },
    "lucknow":  { lat: 26.8467, lon: 80.9462, aqiIndex: 4, pm25: 150, pm10: 200 },
    "shillong": { lat: 25.5788, lon: 91.8933, aqiIndex: 2, pm25: 25,  pm10: 40  }
};

// Detailed City Data for Search & Radar Chart
const cityData = {
    delhi:    { aqi: 310, pm25: 180, pm10: 240, no2: 95, ozone: 50 },
    lucknow:  { aqi: 220, pm25: 130, pm10: 180, no2: 60, ozone: 40 },
    shillong: { aqi: 70,  pm25: 30,  pm10: 40,  no2: 20, ozone: 15 }
};

// Pollution Data for Bar Charts (Air Pollution Page)
const pollutionData = {
    delhi:    { PM25: 120, PM10: 180, NO2: 40, SO2: 12 },
    lucknow:  { PM25: 95,  PM10: 150, NO2: 32, SO2: 10 },
    shillong: { PM25: 28,  PM10: 45,  NO2: 12, SO2: 5  }
};

// Global variable for Radar Chart instance
let radarChart; 


// ===========================================================
//                  NAVIGATION TOGGLE
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const toggleButton = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (toggleButton && navLinks) {
        toggleButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // 2. Load Page-Specific Charts (Safety Checks Included)
    loadCityPollutionChart();       // For Air Pollution Page
    initializeRadarChart();         // For Home Page
    initializeAqiScaleChart();      // For Air Pollution Page
    
    // 3. Load Recommendations (Solutions Page)
    if (document.getElementById('recs-output')) {
        loadRecommendations();
    }
});


// ===========================================================
//                  HELPER FUNCTIONS
// ===========================================================

function getAqiInfo(aqiIndex) {
    let category = '', color = '', healthAdvice = '';

    if (aqiIndex == 1) {
        category = 'Good'; color = '#00e400';
        healthAdvice = "Air quality is good.";
    } else if (aqiIndex == 2) {
        category = 'Fair'; color = '#ffff00';
        healthAdvice = "Moderate risk for sensitive groups.";
    } else if (aqiIndex == 3) {
        category = 'Moderate'; color = '#ff7e00';
        healthAdvice = "Asthma patients should limit outdoor activity.";
    } else if (aqiIndex == 4) {
        category = 'Poor'; color = '#ff0000';
        healthAdvice = "Avoid outdoor physical activity.";
    } else if (aqiIndex == 5) {
        category = 'Very Poor'; color = '#8f3f97';
        healthAdvice = "Severe health risk! Stay indoors.";
    } else {
        category = '--'; color = '#ccc';
        healthAdvice = "No data available.";
    }
    return { category, color, healthAdvice };
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


// ===========================================================
//                 HOME PAGE LOGIC
// ===========================================================

// 1. Fetch AQI (Manual)
async function fetchAQI() {
    const cityInput = document.getElementById('city-input').value.trim().toLowerCase();
    if (!cityInput) { alert("Enter a city name."); return; }

    const data = MANUAL_DATA[cityInput];
    if (!data) { alert("City not found in manual database.\nAvailable: Delhi, Lucknow, Shillong."); return; }

    const { category, color, healthAdvice } = getAqiInfo(data.aqiIndex);

    // Update Text Elements
    document.getElementById('location-name').textContent = cityInput.toUpperCase();
    document.getElementById('aqi-category').textContent = category;
    
    const colorBar = document.getElementById('aqi-color-bar');
    if(colorBar) colorBar.style.backgroundColor = color;
    
    document.getElementById('pm25-val').textContent = data.pm25;
    document.getElementById('pm10-val').textContent = data.pm10;

    const resultsBox = document.getElementById('aqi-results');
    if(resultsBox) resultsBox.classList.remove('hidden');

    // Show Warning if element exists
    const warningBox = document.getElementById('asthma-warning');
    if(warningBox) {
        warningBox.innerHTML = healthAdvice;
        warningBox.classList.remove('hidden');
    }

    localStorage.setItem('lastAqi', data.aqiIndex);
}

// 2. Search City Function (Home Page)
function searchCity() {
    let typedCity = document.getElementById("city-input").value.trim().toLowerCase();
    let dropdownCity = document.getElementById("city-dropdown").value;
    let finalCity = dropdownCity || typedCity;

    if (!finalCity || !cityData[finalCity]) {
        alert("City not found in manual data!");
        return;
    }

    // Update AQI Box
    const nameEl = document.getElementById("city-name");
    const valEl = document.getElementById("aqi-value");
    const boxEl = document.getElementById("aqi-box");

    if (nameEl) nameEl.textContent = capitalize(finalCity);
    if (valEl) valEl.textContent = cityData[finalCity].aqi;
    if (boxEl) boxEl.classList.remove("hidden");

    // Update Radar Chart
    updateRadar(finalCity);
}

// 3. Initialize Radar Chart (Only runs if canvas exists)
function initializeRadarChart() {
    const radarCtx = document.getElementById('radarChart');
    if (!radarCtx) return; // Exit if not on Home Page

    radarChart = new Chart(radarCtx.getContext('2d'), {
        type: 'radar',
        data: {
            labels: ['PM25', 'PM10', 'NO₂', 'Ozone'],
            datasets: [{
                label: 'Pollutant Levels',
                data: [0, 0, 0, 0],
                fill: true,
                backgroundColor: "rgba(0, 128, 0, 0.3)",
                borderColor: "rgba(0, 128, 0, 1)",
                pointBackgroundColor: "rgba(0, 128, 0, 1)",
                pointBorderColor: "#fff",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    min: 0, max: 300,
                    ticks: { stepSize: 50 },
                    grid: { color: "#ccc" },
                    angleLines: { color: "#ccc" }
                }
            }
        }
    });
}

// 4. Update Radar Chart
function updateRadar(city) {
    if (!radarChart) return; // Safety check
    
    let c = cityData[city];
    let newData = [c.pm25, c.pm10, c.no2, c.ozone];

    radarChart.data.datasets[0].label = capitalize(city) + " Pollutants";
    radarChart.data.datasets[0].data = newData;
    radarChart.update();
}


// ===========================================================
//               AIR POLLUTION PAGE LOGIC
// ===========================================================

// 1. City Pollution Bar Chart
function loadCityPollutionChart() {
    const ctx = document.getElementById("cityPollutionChart");
    if (!ctx) return; // Exit if not on Air Pollution Page

    const cityName = (localStorage.getItem("selectedCity") || "").toLowerCase();
    
    if (!pollutionData[cityName]) {
        ctx.outerHTML = `<p style="color:red;font-size:18px;">City data not available.<br>Try: Delhi, Lucknow, Shillong</p>`;
        return;
    }

    const selected = pollutionData[cityName];

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["PM2.5", "PM10", "NO₂", "SO₂"],
            datasets: [{
                label: `Pollution Levels in ${cityName.toUpperCase()}`,
                data: [selected.PM25, selected.PM10, selected.NO2, selected.SO2],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)", "rgba(75, 192, 192, 0.6)"
                ]
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

// 2. Interactive AQI Color Scale Chart
function initializeAqiScaleChart() {
    const aqiChartCanvas = document.getElementById("aqiColorScaleChart");
    if (!aqiChartCanvas) return; // Exit if not on Air Pollution Page

    new Chart(aqiChartCanvas.getContext("2d"), {
        type: "bar",
        data: {
            labels: [
                "Good (0-50)", "Moderate (51-100)", "Poor (101-150)", 
                "Unhealthy (151-200)", "V. Unhealthy (201-300)", "Hazardous (301+)"
            ],
            datasets: [{
                label: "AQI Range Upper Limit",
                data: [50, 100, 150, 200, 300, 400],
                backgroundColor: [
                    "#00e400", "#ffff00", "#ff7e00", 
                    "#ff0000", "#8f3f97", "#7e0023"
                ],
                borderColor: [
                    "#00b000", "#e6e600", "#cc6600", 
                    "#cc0000", "#703075", "#5e001a"
                ],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal Bar Chart
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true, max: 450 } }
        }
    });
}


// ===========================================================
//                  ASTHMA PAGE LOGIC
// ===========================================================

// 1. Initial Assessment
function checkAsthmaRisk() {
    const symptoms = document.querySelectorAll('#symptom-form input[name="symptom"]:checked');
    const symptomValues = Array.from(symptoms).map(s => s.value);
    const count = symptoms.length;

    const resultsDiv = document.getElementById('risk-results');
    const riskLevelSpan = document.getElementById('risk-level');

    if (!resultsDiv || !riskLevelSpan) return;

    let risk = "Low";
    if (count >= 3 || symptomValues.includes('shortness')) {
        risk = "HIGH (Severe)";
    } else if (count >= 1) {
        risk = "Medium";
    }

    riskLevelSpan.textContent = risk;
    resultsDiv.classList.remove('hidden');
    localStorage.setItem('lastSymptoms', JSON.stringify(symptomValues));
}

// 2. Detailed Condition Check
function checkCondition() {
    const form = document.forms["symptomForm"];
    if (!form) return;

    const symptoms = [
        form.breath.value, form.cough.value, form.chest.value,
        form.wheeze.value, form.inhaler.value, form.activity.value
    ];

    let severeCount = symptoms.filter(s => s === "severe").length;
    let mildCount = symptoms.filter(s => s === "mild").length;
    let resultDiv = document.getElementById("result");

    if (!resultDiv) return;

    if (severeCount >= 2) {
        resultDiv.style.background = "#ffcccc";
        resultDiv.innerHTML = `<h3>⚠ Severe Asthma Flare-Up</h3><p>Your symptoms suggest a **strong flare-up**.</p><ul><li>Use inhaler immediately</li><li>Seek medical help if needed</li></ul>`;
    } else if (mildCount >= 2) {
        resultDiv.style.background = "#fff3cd";
        resultDiv.innerHTML = `<h3>🟡 Moderate Symptoms</h3><p>You may be having worsening symptoms.</p><ul><li>Rest and monitor breathing</li></ul>`;
    } else {
        resultDiv.style.background = "#d4edda";
        resultDiv.innerHTML = `<h3>🟢 Mild / No Symptoms</h3><p>Breathing looks stable.</p>`;
    }
}


// ===========================================================
//                SOLUTIONS & TOOLS LOGIC
// ===========================================================

// 1. Load Recommendations (Solutions Page)
function loadRecommendations() {
    const lastAqi = parseInt(localStorage.getItem('lastAqi') || 1);
    const symptoms = JSON.parse(localStorage.getItem('lastSymptoms') || '[]');
    const recsDiv = document.getElementById('recs-output');

    if (!recsDiv) return;

    const info = getAqiInfo(lastAqi);
    const recs = [];
    recs.push(`<strong>Your Last AQI:</strong> ${info.category}`);
    recs.push(`<strong>Symptoms:</strong> ${symptoms.length > 0 ? symptoms.join(', ') : "None"}`);

    if (lastAqi >= 4) recs.push("Avoid going outside.");
    else if (lastAqi == 3) recs.push("Limit outdoor activity.");
    else recs.push("Air quality is good.");

    recsDiv.innerHTML = "<ul>" + recs.map(r => `<li>${r}</li>`).join("") + "</ul>";
}

// 2. Instant AQI Tool (Tools Page)
function getInstantAQI() {
    const cityInput = document.getElementById('tool-city-input').value.trim().toLowerCase();
    const result = document.getElementById('instant-aqi-result');

    if (!result) return;

    const data = MANUAL_DATA[cityInput];
    if (!data) {
        result.innerHTML = `<p style="color:red;">City not found in manual database.</p>`;
        return;
    }

    const { category, color } = getAqiInfo(data.aqiIndex);
    result.innerHTML = `<p>AQI for ${cityInput.toUpperCase()}: <strong style="color:${color};">${data.aqiIndex}</strong></p><p>Category: ${category}</p>`;
}
// ===========================================================