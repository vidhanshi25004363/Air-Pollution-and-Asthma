// ===========================================================
//                 GLOBAL DATA & CONSTANTS
// ===========================================================

const MANUAL_DATA = {
    "delhi":    { lat: 28.6139, lon: 77.2090, aqiIndex: 5, pm25: 180, pm10: 250 },
    "lucknow":  { lat: 26.8467, lon: 80.9462, aqiIndex: 4, pm25: 150, pm10: 200 },
    "shillong": { lat: 25.5788, lon: 91.8933, aqiIndex: 2, pm25: 25,  pm10: 40  }
};

const cityData = {
    delhi:    { aqi: 310, pm25: 180, pm10: 240, no2: 95, ozone: 50 },
    lucknow:  { aqi: 220, pm25: 130, pm10: 180, no2: 60, ozone: 40 },
    shillong: { aqi: 70,  pm25: 30,  pm10: 40,  no2: 20, ozone: 15 }
};

const pollutionData = {
    delhi:    { PM25: 120, PM10: 180, NO2: 40, SO2: 12 },
    lucknow:  { PM25: 95,  PM10: 150, NO2: 32, SO2: 10 },
    shillong: { PM25: 28,  PM10: 45,  NO2: 12, SO2: 5  }
};

const historicalAqiData = {
    "delhi": [310, 285, 340],
    "lucknow": [210, 195, 230],
    "shillong": [45, 52, 48],
    "mumbai": [120, 115, 130]
};

let radarChart; 
let aqiChartInstance = null;

// ===========================================================
//                 MAIN INITIALIZATION
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (toggleButton && navLinks) {
        toggleButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    loadCityPollutionChart();       
    initializeRadarChart();         
    initializeAqiScaleChart();      
    initializeHistoryChart(); 

    if (document.getElementById('recs-output')) {
        loadRecommendations();
    }
});

// ===========================================================
//                 HELPER FUNCTIONS
// ===========================================================

function getAqiInfo(aqiIndex) {
    let category = '', color = '', healthAdvice = '';
    if (aqiIndex == 1) { category = 'Good'; color = '#00e400'; healthAdvice = "Air quality is good."; }
    else if (aqiIndex == 2) { category = 'Fair'; color = '#ffff00'; healthAdvice = "Moderate risk."; }
    else if (aqiIndex == 3) { category = 'Moderate'; color = '#ff7e00'; healthAdvice = "Limit outdoor activity."; }
    else if (aqiIndex == 4) { category = 'Poor'; color = '#ff0000'; healthAdvice = "Avoid exertion."; }
    else if (aqiIndex == 5) { category = 'Very Poor'; color = '#8f3f97'; healthAdvice = "Stay indoors!"; }
    else { category = '--'; color = '#ccc'; healthAdvice = "No data."; }
    return { category, color, healthAdvice };
}

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

// ===========================================================
//                 ASTHMA SYMPTOM CHECKER LOGIC
// ===========================================================

function initializeHistoryChart() {
    const ctx = document.getElementById('aqiChart');
    if (!ctx) return;

    aqiChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: [], 
            datasets: [{
                label: 'AQI Levels Logged',
                data: [],
                borderColor: '#007BFF',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

function checkAsthmaRisk() {
    const checkboxes = document.querySelectorAll('input[name="symptom"]:checked');
    const aqiInput = document.getElementById('user-aqi');
    const locationInput = document.getElementById('user-location');
    
    const resultDiv = document.getElementById('risk-results');
    const riskLevelDisplay = document.getElementById('risk-level');
    const displayAQI = document.getElementById('display-aqi');
    const displayLoc = document.getElementById('display-location');
    const riskBar = document.getElementById('risk-bar');
    const medicalHelp = document.getElementById('medical-help');
    const emergencyBox = document.getElementById('emergency-signs');
    
    const symptomCount = checkboxes.length;
    const aqiValue = parseInt(aqiInput ? aqiInput.value : 0);
    const city = locationInput ? locationInput.value.trim().toLowerCase() : "";

    if(resultDiv) resultDiv.classList.remove('hidden');

    let riskStatus = "";
    let riskColor = "";
    let barWidth = "0%";
    let advice = "";

    // 1. HIGH RISK: 3+ symptoms OR AQI over 200
    if (symptomCount >= 3 || aqiValue > 200) {
        riskStatus = "High Risk / Action Required";
        riskColor = "#d32f2f";
        barWidth = "100%";
        advice = "🚨 <strong>Immediate Action:</strong> High symptoms or hazardous air. Use rescue inhaler and stay indoors.";
        
        if (emergencyBox) {
            emergencyBox.style.border = "2px solid #d32f2f";
            emergencyBox.style.boxShadow = "0 0 15px rgba(211, 47, 47, 0.6)";
            emergencyBox.style.backgroundColor = "#fffafa";
        }
    } 
    // 2. MODERATE RISK: 2 symptoms OR AQI between 101-200
    else if (symptomCount >= 2 || aqiValue > 100) {
        riskStatus = "Moderate / Caution";
        riskColor = "#f57c00";
        barWidth = "50%";
        advice = "⚠️ <strong>Monitor:</strong> You are experiencing multiple symptoms or air quality is poor. Limit heavy outdoor activity.";
        
        if (emergencyBox) {
            emergencyBox.style.border = "1px solid #ccc";
            emergencyBox.style.boxShadow = "none";
            emergencyBox.style.backgroundColor = "#fff";
        }
    } 
    // 3. LOW RISK: 0-1 symptom AND AQI 0-100
    else {
        riskStatus = "Low / Healthy";
        riskColor = "#388e3c";
        barWidth = "15%";
        advice = "✅ <strong>Stable:</strong> Your symptoms are minimal and air quality is acceptable.";

        if (emergencyBox) {
            emergencyBox.style.border = "1px solid #ccc";
            emergencyBox.style.boxShadow = "none";
            emergencyBox.style.backgroundColor = "#fff";
        }
    }

    if(riskLevelDisplay) {
        riskLevelDisplay.innerText = riskStatus;
        riskLevelDisplay.style.color = riskColor;
    }
    if(riskBar) {
        riskBar.style.width = barWidth;
        riskBar.style.backgroundColor = riskColor;
    }
    if(displayLoc) displayLoc.innerText = city ? locationInput.value : "N/A";
    if(displayAQI) displayAQI.innerText = aqiValue || "0";
    if(medicalHelp) medicalHelp.innerHTML = advice;

    // Trigger Additional Updates
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    showHistoricalAqi(city);
    updateSymptomChart(currentTime, aqiValue);

    if(resultDiv) resultDiv.scrollIntoView({ behavior: 'smooth' });
}

function showHistoricalAqi(city) {
    const cityName = city ? city.toLowerCase().trim() : "";
    let historyDiv = document.getElementById('historical-data');

    if (!historyDiv) {
        historyDiv = document.createElement('div');
        historyDiv.id = 'historical-data';
        const guidanceSection = document.getElementById('guidance');
        if (guidanceSection) {
            guidanceSection.appendChild(historyDiv);
        } else {
            const container = document.querySelector('.container');
            if(container) container.appendChild(historyDiv);
        }
    }

    if (cityName && historicalAqiData[cityName]) {
        const history = historicalAqiData[cityName];
        historyDiv.innerHTML = `
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <h4 style="margin-top:15px; color: #333;">📅 Previous 3 Days AQI for ${city.toUpperCase()}</h4>
            <ul style="list-style: none; padding: 0; display: flex; gap: 10px; margin-top: 10px;">
                <li style="background:#f4f4f4; padding:10px; border-radius:8px; flex:1; text-align:center; border: 1px solid #ddd;">
                    <span style="font-size: 0.8rem; color: #666;">Day 1</span><br><strong>${history[0]}</strong>
                </li>
                <li style="background:#f4f4f4; padding:10px; border-radius:8px; flex:1; text-align:center; border: 1px solid #ddd;">
                    <span style="font-size: 0.8rem; color: #666;">Day 2</span><br><strong>${history[1]}</strong>
                </li>
                <li style="background:#f4f4f4; padding:10px; border-radius:8px; flex:1; text-align:center; border: 1px solid #ddd;">
                    <span style="font-size: 0.8rem; color: #666;">Day 3</span><br><strong>${history[2]}</strong>
                </li>
            </ul>
        `;
    } else if (cityName) {
        historyDiv.innerHTML = `<hr><p style="font-size:0.9rem; color:#d32f2f;">No historical data for "${city}". Try Delhi, Lucknow, or Mumbai.</p>`;
    }
}

function updateSymptomChart(time, aqi) {
    if (aqiChartInstance && aqiChartInstance.data) {
        aqiChartInstance.data.labels.push(time);
        aqiChartInstance.data.datasets[0].data.push(aqi);

        if (aqiChartInstance.data.labels.length > 7) {
            aqiChartInstance.data.labels.shift();
            aqiChartInstance.data.datasets[0].data.shift();
        }
        aqiChartInstance.update();
    }
}

// ===========================================================
//                 HOME & AIR POLLUTION LOGIC
// ===========================================================

function searchCity() {
    let typedCity = document.getElementById("city-input").value.trim().toLowerCase();
    let dropdownCity = document.getElementById("city-dropdown").value;
    let finalCity = dropdownCity || typedCity;

    if (!finalCity || !cityData[finalCity]) {
        alert("City not found!");
        return;
    }

    if (document.getElementById("city-name")) document.getElementById("city-name").textContent = capitalize(finalCity);
    if (document.getElementById("aqi-value")) document.getElementById("aqi-value").textContent = cityData[finalCity].aqi;
    if (document.getElementById("aqi-box")) document.getElementById("aqi-box").classList.remove("hidden");

    updateRadar(finalCity);
}

function initializeRadarChart() {
    const radarCtx = document.getElementById('radarChart');
    if (!radarCtx) return;

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
                borderWidth: 2
            }]
        },
        options: { responsive: true, scales: { r: { min: 0, max: 300 } } }
    });
}

function updateRadar(city) {
    if (!radarChart) return;
    let c = cityData[city];
    radarChart.data.datasets[0].label = capitalize(city) + " Pollutants";
    radarChart.data.datasets[0].data = [c.pm25, c.pm10, c.no2, c.ozone];
    radarChart.update();
}

function loadCityPollutionChart() {
    const ctx = document.getElementById("cityPollutionChart");
    if (!ctx) return;
    const cityName = (localStorage.getItem("selectedCity") || "delhi").toLowerCase();
    const selected = pollutionData[cityName];

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["PM2.5", "PM10", "NO₂", "SO₂"],
            datasets: [{
                label: `Pollution in ${cityName.toUpperCase()}`,
                data: [selected.PM25, selected.PM10, selected.NO2, selected.SO2],
                backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0"]
            }]
        }
    });
}

function initializeAqiScaleChart() {
    const ctx = document.getElementById("aqiColorScaleChart");
    if (!ctx) return;
    new Chart(ctx.getContext("2d"), {
        type: "bar",
        data: {
            labels: ["Good", "Moderate", "Poor", "Unhealthy", "V. Unhealthy", "Hazardous"],
            datasets: [{
                data: [50, 100, 150, 200, 300, 400],
                backgroundColor: ["#00e400", "#ffff00", "#ff7e00", "#ff0000", "#8f3f97", "#7e0023"]
            }]
        },
        options: { indexAxis: 'y', plugins: { legend: { display: false } } }
    });
}

function loadRecommendations() {
    const lastAqi = parseInt(localStorage.getItem('lastAqi') || 1);
    const recsDiv = document.getElementById('recs-output');
    if (!recsDiv) return;
    const info = getAqiInfo(lastAqi);
    recsDiv.innerHTML = `<ul><li><strong>Current Status:</strong> ${info.category}</li><li>${info.healthAdvice}</li></ul>`;
}

function assessSymptoms() {
    const form = document.getElementById('symptomForm');
    
    const choices = [
        form.elements['breath'].value,
        form.elements['cough'].value,
        form.elements['chest'].value,
        form.elements['wheeze'].value,
        form.elements['inhaler'].value,
        form.elements['activity'].value
    ];

    let mildCount = 0;
    let isEmergency = false;

    choices.forEach(val => {
        if (val === 'severe') {
            isEmergency = true; 
        } else if (val === 'mild') {
            mildCount += 1; 
        }
    });

    const resultsCard = document.getElementById('risk-results');
    const riskLevelText = document.getElementById('risk-level-text');
    const medicalAdvice = document.getElementById('medical-help');

    resultsCard.style.display = "block";

    if (isEmergency || mildCount > 6) {
        riskLevelText.innerText = "🚨 High Risk / Action Required";
        riskLevelText.style.color = "#d32f2f";
        
        medicalAdvice.innerHTML = `
            <div style="background-color: #fff5f5; border-left: 5px solid #d32f2f; padding: 15px; margin-bottom: 10px; border-radius: 4px;">
                <strong style="font-size: 1.1rem;">🩺 Significant Doctor Concern:</strong><br>
                ${mildCount > 2 ? "Multiple moderate symptoms detected." : "Severe symptoms detected."} 
                <strong>You must consult your doctor immediately.</strong>
            </div>
            <p>Use your rescue inhaler and limit activity.</p>
        `;
    } 
    else if (mildCount >= 4) {
        riskLevelText.innerText = "⚠️ Moderate Risk / Caution";
        riskLevelText.style.color = "#ff9800";
        medicalAdvice.innerHTML = "You are showing a few mild symptoms. Monitor your breathing closely and rest.";
    } 
    else {
        riskLevelText.innerText = "✅ Low Risk / Stable";
        riskLevelText.style.color = "#2e7d32";
        medicalAdvice.innerHTML = mildCount === 1 
            ? "A single mild symptom detected. Keep an eye on it, but you are currently stable." 
            : "Your symptoms are currently under control. Continue your regular plan.";
    }

    resultsCard.scrollIntoView({ behavior: 'smooth' });
}