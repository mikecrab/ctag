/* ============================================================
   CTAG — Script (Single-Screen)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Contact form handling
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('form-submit-btn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      try {
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          contactForm.style.display = 'none';
          document.querySelector('.form-subtitle').style.display = 'none';
          formSuccess.classList.add('show');
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        // Fallback — open mailto with form data
        const formData = new FormData(contactForm);
        const name = formData.get('name') || '';
        const email = formData.get('email') || '';
        const message = formData.get('message') || '';
        const company = formData.get('company') || '';
        const subject = encodeURIComponent(`CTAG Inquiry from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nCompany: ${company}\n\n${message}`);
        window.location.href = `mailto:mcrabtree@breakawayadvising.com?subject=${subject}&body=${body}`;
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // FEATURE FLAG — Secret Valuation Calculator
  const secretBanner = document.getElementById('secret-calculator-banner');
  const showSecret = () => {
    if (secretBanner && secretBanner.style.display === 'none') {
      secretBanner.style.display = 'block';
      secretBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // 1. Desktop: "up down left right" arrow keys
  const secretSequence = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  let keySequence = [];
  
  document.addEventListener('keydown', (e) => {
    keySequence.push(e.key);
    // Keep sequence restricted to length of secret array
    keySequence = keySequence.slice(-secretSequence.length);
    if (keySequence.join(',') === secretSequence.join(',')) {
      showSecret();
    }
  });

  // 2. Mobile: Tap logo 5 times quickly
  const logo = document.querySelector('.brand-logo');
  let tapCount = 0;
  let tapTimer;

  if (logo) {
    logo.addEventListener('click', () => {
      tapCount++;
      clearTimeout(tapTimer);
      if (tapCount >= 5) {
        showSecret();
        tapCount = 0;
      }
      tapTimer = setTimeout(() => { tapCount = 0; }, 800);
    });
  }

});
