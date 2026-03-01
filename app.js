// ===============================
// 🌾 AGRICULTURAL LOAN SCORER
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    // -----------------------------
    // SLIDER UPDATE
    // -----------------------------
    function updateSlider(el, suffix) {
        const min = parseFloat(el.min);
        const max = parseFloat(el.max);
        const val = parseFloat(el.value);
        const pct = ((val - min) / (max - min)) * 100;
        el.style.setProperty('--pct', pct + '%');

        const display = suffix === '%' 
            ? val.toFixed(1) + '%' 
            : val + suffix;

        const valueLabel = document.getElementById(el.id + "Val");
        if (valueLabel) valueLabel.textContent = display;
    }

    document.querySelectorAll('input[type="range"]').forEach(s => {
        updateSlider(s, s.id === 'organicMatter' ? '%' : '/10');
        s.addEventListener("input", () => {
            updateSlider(s, s.id === 'organicMatter' ? '%' : '/10');
        });
    });

    // -----------------------------
    // HELPER FUNCTIONS
    // -----------------------------
    function getVal(id) {
        const el = document.getElementById(id);
        return el ? parseFloat(el.value) || 0 : 0;
    }

    function getSelectScore(id) {
        const el = document.getElementById(id);
        return el ? parseFloat(el.value) || 0 : 0;
    }

    // -----------------------------
    // FORM SUBMIT (MAIN FUNCTION)
    // -----------------------------
    const form = document.getElementById("loanForm");

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const name = document.getElementById("farmerName").value.trim();

            if (!name) {
                alert("⚠️ Please enter farmer name.");
                return;
            }

            // Show loading
            const loading = document.getElementById("loadingOverlay");
            if (loading) loading.classList.add("active");

            // ========================
            // Collect Data for Backend
            // ========================
            const data = {
                landSize: getVal("farmSize"),
                income: getVal("farmIncome"),
                existingLoan: getVal("existingLoan"),
                repaymentRate: getSelectScore("repayment"),
                soilPH: getVal("soilPH"),
                rainfall: getVal("rainfall"),
                productivity: getVal("productivity")
            };

            try {
                const response = await fetch("http://127.0.0.1:5000/predict", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (loading) loading.classList.remove("active");

                renderResult(name, result);

            } catch (error) {
                if (loading) loading.classList.remove("active");
                alert("❌ Backend not connected. Check Flask server.");
                console.error(error);
            }
        });
    }

    // -----------------------------
    // RESULT RENDER
    // -----------------------------
    function renderResult(name, result) {

        const trustScore = Math.round(result.credit_score || 0);
        const loanAmount = Math.round(result.eligible_loan || 0);

        const interestRate =
            trustScore >= 75 ? "4% p.a. (Subsidized)" :
            trustScore >= 60 ? "7% p.a." :
            trustScore >= 45 ? "10.5% p.a." :
            "12% p.a. (Higher Risk)";

        const tenure =
            trustScore >= 65 ? "5 Years" :
            trustScore >= 45 ? "3 Years" :
            "1 Year";

        const eligibility =
            trustScore >= 70 ? "✅ ELIGIBLE FOR FULL LOAN" :
            trustScore >= 50 ? "⚠️ CONDITIONALLY ELIGIBLE" :
            "❌ NOT ELIGIBLE";

        document.getElementById("resultBody").innerHTML = `
            <h3>Assessment for ${name}</h3>
            <p><strong>Trust Score:</strong> ${trustScore}/100</p>
            <p><strong>Eligible Loan Amount:</strong> ₹ ${loanAmount.toLocaleString()}</p>
            <p><strong>Interest Rate:</strong> ${interestRate}</p>
            <p><strong>Tenure:</strong> ${tenure}</p>
            <h4>${eligibility}</h4>
        `;

        document.getElementById("resultCard").classList.remove("hidden");

        const fill = document.getElementById("trustFill");
        if (fill) fill.style.width = trustScore + "%";
    }

    // -----------------------------
    // RESET FUNCTION
    // -----------------------------
    window.resetForm = function () {
        form.reset();
        document.getElementById("resultCard").classList.add("hidden");
    };

});