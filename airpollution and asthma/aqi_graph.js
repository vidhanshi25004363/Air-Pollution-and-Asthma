// ------------------------------
// Manual Data for the Graph
// ------------------------------
const dates = [
    "2025-11-01",
    "2025-11-05",
    "2025-11-10",
    "2025-11-15",
    "2025-11-20"
];

const aqiValues = [50, 100, 120, 150, 180];  // AQI values
const severityValues = [1, 2, 3, 4, 5];      // Severity 1–5


// ------------------------------
// Chart.js Code
// ------------------------------

const ctx = document.getElementById("aqiChart");

new Chart(ctx, {
    type: "line",
    data: {
        labels: dates,
        datasets: [
            {
                label: "AQI Reading",
                data: aqiValues,
                borderWidth: 2,
                borderColor: "green",
                backgroundColor: "green",
                yAxisID: "y",
                tension: 0.3,
                pointRadius: 8
            },
            {
                label: "Symptom Severity (1-5)",
                data: severityValues,
                borderWidth: 2,
                borderColor: "red",
                backgroundColor: "red",
                yAxisID: "y1",
                tension: 0.3,
                pointStyle: "triangle",
                pointRadius: 10
            }
        ]
    },

    options: {
        responsive: true,
        plugins: {
            legend: {
                position: "top"
            },
            title: {
                display: false
            }
        },
        scales: {
            y: {
                type: "linear",
                position: "left",
                title: {
                    display: true,
                    text: "AQI Value"
                },
                min: 0,
                max: 200
            },
            y1: {
                type: "linear",
                position: "right",
                min: 0,
                max: 5,
                title: {
                    display: true,
                    text: "Severity (1–5)"
                },
                grid: {
                    drawOnChartArea: false
                }
            }
        }
    }
});
