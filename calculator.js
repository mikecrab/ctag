document.addEventListener('DOMContentLoaded', () => {

  // --- Inputs ---
  const revInput = document.getElementById('rev-input');
  
  // As-Is Sliders
  const marginSlider = document.getElementById('margin-slider');
  const multipleSlider = document.getElementById('multiple-slider');
  
  // Accelerator Sliders
  const efficiencySlider = document.getElementById('efficiency-slider');
  const riskSlider = document.getElementById('risk-slider');

  // --- Displays ---
  const marginVal = document.getElementById('margin-val');
  const multipleVal = document.getElementById('multiple-val');
  const ebitdaDisplay = document.getElementById('ebitda-display');
  const currentValDisplay = document.getElementById('current-val-display');

  const efficiencyVal = document.getElementById('efficiency-val');
  const riskVal = document.getElementById('risk-val');
  const newEbitdaDisplay = document.getElementById('new-ebitda-display');
  const newMultipleDisplay = document.getElementById('new-multiple-display');

  // --- Chart Elements ---
  const barCurrent = document.getElementById('bar-current');
  const barAdded = document.getElementById('bar-added');
  const barFuture = document.getElementById('bar-future');

  const labelCurrent = document.getElementById('chart-val-current');
  const labelAdded = document.getElementById('chart-val-added');
  const labelFuture = document.getElementById('chart-val-future');

  // --- Hidden Form Inputs ---
  const hiddenCurrVal = document.getElementById('hidden-curr-val');
  const hiddenAddedVal = document.getElementById('hidden-added-val');
  const hiddenFutureVal = document.getElementById('hidden-future-val');

  // Formatting utils
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  const formatShortCurrency = (num) => {
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return '$' + (num / 1e3).toFixed(0) + 'K';
    return '$' + num;
  };

  const parseNumber = (str) => {
    return parseFloat(str.replace(/[^0-9.-]+/g, "")) || 0;
  };

  // --- Core Math Engine ---
  const calculateBridge = () => {
    // 1. Get Values
    let revRaw = revInput.value;
    let rev = parseNumber(revRaw);
    
    // Reformat revenue input nicely
    revInput.value = new Intl.NumberFormat('en-US').format(rev);

    let marginPct = parseFloat(marginSlider.value) / 100;
    let multiple = parseFloat(multipleSlider.value);

    let efficiencyPct = parseFloat(efficiencySlider.value) / 100;
    let riskMult = parseFloat(riskSlider.value);

    // 2. Compute As-Is
    let currentEbitda = rev * marginPct;
    let currentVal = currentEbitda * multiple;

    // 3. Compute Future
    let newEbitda = rev * (marginPct + efficiencyPct);
    let newMultiple = multiple + riskMult;
    let futureVal = newEbitda * newMultiple;

    // 4. Compute Gap
    let valueAdded = futureVal - currentVal;

    // --- Update Text Displays ---
    marginVal.textContent = marginSlider.value + '%';
    multipleVal.textContent = multiple.toFixed(1) + 'x';
    ebitdaDisplay.textContent = formatCurrency(currentEbitda);
    currentValDisplay.textContent = formatCurrency(currentVal);

    efficiencyVal.textContent = '+' + efficiencySlider.value + '%';
    riskVal.textContent = '+' + riskMult.toFixed(1) + 'x';
    newEbitdaDisplay.textContent = formatCurrency(newEbitda);
    newMultipleDisplay.textContent = newMultiple.toFixed(1) + 'x';

    labelCurrent.textContent = formatShortCurrency(currentVal);
    labelAdded.textContent = '+' + formatShortCurrency(valueAdded);
    labelFuture.textContent = formatShortCurrency(futureVal);

    // --- Update Hidden Form Inputs ---
    hiddenCurrVal.value = formatCurrency(currentVal);
    hiddenAddedVal.value = formatCurrency(valueAdded);
    hiddenFutureVal.value = formatCurrency(futureVal);

    // --- Animate CSS Bars ---
    // Create a dynamic max bound so the highest bar is around 90% of the track height
    let maxChartVal = futureVal * 1.15;
    if (maxChartVal === 0) maxChartVal = 1; // prevent divide by zero

    let currentHeightPct = Math.min((currentVal / maxChartVal) * 100, 100);
    let futureHeightPct = Math.min((futureVal / maxChartVal) * 100, 100);
    // Let the gap bar start from zero up to its absolute value
    let addedHeightPct = Math.min((valueAdded / maxChartVal) * 100, 100);

    // Apply heights
    barCurrent.style.height = currentHeightPct + '%';
    barFuture.style.height = futureHeightPct + '%';
    barAdded.style.height = addedHeightPct + '%';
  };

  // --- Attach Event Listeners ---
  const inputs = [revInput, marginSlider, multipleSlider, efficiencySlider, riskSlider];
  inputs.forEach(input => {
    input.addEventListener('input', calculateBridge);
  });

  // Run initial calculation
  calculateBridge();


  // --- Modal Logic ---
  const modal = document.getElementById('lead-modal');
  const openBtn = document.getElementById('open-lead-btn');
  const closeBtn = document.getElementById('close-modal');

  openBtn.addEventListener('click', () => {
    modal.classList.add('show');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
  });

  // Close on outside click
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });

});
