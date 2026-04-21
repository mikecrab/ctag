document.addEventListener('DOMContentLoaded', () => {

  // Form Elements
  const form = document.getElementById('ai-profiler-form');
  const analyzeBtn = document.getElementById('analyze-btn');
  const revInput = document.getElementById('rev-input');
  const industryInput = document.getElementById('industry-input');
  const profitSelect = document.getElementById('profit-select');
  const checkboxes = document.querySelectorAll('.checkbox-grid input[type="checkbox"]');

  // UI States
  const stateStart = document.getElementById('state-start');
  const stateLoading = document.getElementById('state-loading');
  const stateResults = document.getElementById('state-results');

  // Results Text Elements
  const outRedflag = document.getElementById('out-redflag');
  const outSolution = document.getElementById('out-solution');
  const labelCurrent = document.getElementById('chart-val-current');
  const labelAdded = document.getElementById('chart-val-added');
  const labelFuture = document.getElementById('chart-val-future');

  // Chart Bars
  const barCurrent = document.getElementById('bar-current');
  const barAdded = document.getElementById('bar-added');
  const barFuture = document.getElementById('bar-future');

  // Hidden Form Inputs (for Modal)
  const hiddenIndustry = document.getElementById('hidden-industry');
  const hiddenCurrVal = document.getElementById('hidden-curr-val');
  const hiddenAddedVal = document.getElementById('hidden-added-val');
  const hiddenFutureVal = document.getElementById('hidden-future-val');
  const hiddenRedFlag = document.getElementById('hidden-red-flag');

  // Utils
  const formatShortCurrency = (num) => {
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return '$' + (num / 1e3).toFixed(0) + 'K';
    return '$' + num;
  };

  const parseNumber = (str) => {
    return parseFloat(str.replace(/[^0-9.-]+/g, "")) || 0;
  };

  // Format revenue input on the fly
  revInput.addEventListener('input', (e) => {
    let val = parseNumber(e.target.value);
    if (val > 0) {
      e.target.value = new Intl.NumberFormat('en-US').format(val);
    } else {
      e.target.value = '';
    }
  });

  // Handle Form Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Gather data
    const revenue = parseNumber(revInput.value);
    const industry = industryInput.value.trim();
    const profitability = profitSelect.value;
    const headwinds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);

    // Switch UI to Loading
    stateStart.style.display = 'none';
    stateResults.style.display = 'none';
    stateLoading.style.display = 'flex';
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revenue, industry, profitability, headwinds })
      });

      if (!response.ok) {
        throw new Error('API Error');
      }

      const data = await response.json();
      
      // We have the JSON response!
      displayResults(data, industry);

    } catch (error) {
      console.error(error);
      alert('Error fetching AI analysis. Please try again or check Vercel deployment.');
      // Revert UI
      stateLoading.style.display = 'none';
      stateStart.style.display = 'flex';
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = 'Analyze Business Profile';
    }
  });

  function displayResults(data, industryStr) {
    // Hide loading, show results
    stateLoading.style.display = 'none';
    stateResults.style.display = 'flex';

    // Populate Insights
    outRedflag.textContent = data.red_flag_insight;
    outSolution.textContent = data.value_bridge_insight;

    // Populate Chart Labels (Ranges)
    const curRangeStr = `${formatShortCurrency(data.current_valuation_low)} - ${formatShortCurrency(data.current_valuation_high)}`;
    const futRangeStr = `${formatShortCurrency(data.future_valuation_low)} - ${formatShortCurrency(data.future_valuation_high)}`;
    const addValStr = `+${formatShortCurrency(data.added_value_potential)}`;

    labelCurrent.textContent = curRangeStr;
    labelAdded.textContent = addValStr;
    labelFuture.textContent = futRangeStr;

    // Trigger Chart Animations
    // Use the high end of future valuation for scaling the 100% height limit
    let maxChartVal = data.future_valuation_high * 1.15;
    if (maxChartVal === 0) maxChartVal = 1;

    // Average the ranges for rendering the bar heights
    let avgCur = (data.current_valuation_low + data.current_valuation_high) / 2;
    let avgFut = (data.future_valuation_low + data.future_valuation_high) / 2;

    setTimeout(() => {
      barCurrent.style.height = Math.min((avgCur / maxChartVal) * 100, 100) + '%';
      barFuture.style.height = Math.min((avgFut / maxChartVal) * 100, 100) + '%';
      barAdded.style.height = Math.min((data.added_value_potential / maxChartVal) * 100, 100) + '%';
    }, 50);

    // Update Formspree Hidden Inputs
    hiddenIndustry.value = industryStr;
    hiddenCurrVal.value = curRangeStr;
    hiddenAddedVal.value = addValStr;
    hiddenFutureVal.value = futRangeStr;
    hiddenRedFlag.value = data.red_flag_insight;
  }

  // --- Modal Logic ---
  const modal = document.getElementById('lead-modal');
  const openBtn = document.getElementById('open-lead-btn');
  const closeBtn = document.getElementById('close-modal');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      modal.classList.add('show');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });

});
