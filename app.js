/* ==========================================
   RUNIT WEBSITE - INTERACTIVITY SCRIPT (app.js)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     1. SCROLL-DRIVEN STEP SWITCH & TASKBAR FILL
     ========================================== */
  const howItWorksOuter = document.getElementById('how-it-works');
  const stepCards = document.querySelectorAll('.step-card');
  const taskbarFill = document.getElementById('taskbarFill');
  let currentStep = 1;

  function updateSteps(stepNumber) {
    if (stepNumber === currentStep) return;
    currentStep = stepNumber;

    stepCards.forEach((card) => {
      const cardStep = parseInt(card.getAttribute('data-step'), 10);
      if (cardStep === currentStep) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // Calculate Taskbar Fill percentage (25%, 50%, 75%, 100%)
    const fillPercent = (currentStep / 4) * 100;
    if (taskbarFill) {
      taskbarFill.style.width = `${fillPercent}%`;
    }
  }

  // Scroll Listener for Section 2
  window.addEventListener('scroll', () => {
    if (!howItWorksOuter) return;

    const rect = howItWorksOuter.getBoundingClientRect();
    const sectionHeight = howItWorksOuter.offsetHeight;
    const windowHeight = window.innerHeight;

    // Calculate how far user has scrolled into Section 2 (0 to 1)
    const scrolledDistance = windowHeight - rect.top;
    const scrollableDistance = sectionHeight;
    let progress = scrolledDistance / scrollableDistance;

    // Clamp progress between 0 and 1
    progress = Math.max(0, Math.min(1, progress));

    if (progress <= 0.25) {
      updateSteps(1);
    } else if (progress <= 0.50) {
      updateSteps(2);
    } else if (progress <= 0.75) {
      updateSteps(3);
    } else {
      updateSteps(4);
    }
  });

  // Direct Click on Step Cards
  stepCards.forEach((card) => {
    card.addEventListener('click', () => {
      const step = parseInt(card.getAttribute('data-step'), 10);
      updateSteps(step);
    });
  });


  /* ==========================================
     2. TRACK RECORDS CANVAS LINE CHART
     ========================================== */
  const canvas = document.getElementById('runChart');
  if (canvas) {
    const ctx = canvas.getContext('2d');

    function resizeAndDrawChart() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height - 40; // reserve space for bottom label

      const w = canvas.width;
      const h = canvas.height;
      const paddingLeft = 45;
      const paddingRight = 20;
      const paddingTop = 20;
      const paddingBottom = 35;

      const chartW = w - paddingLeft - paddingRight;
      const chartH = h - paddingTop - paddingBottom;

      ctx.clearRect(0, 0, w, h);

      // Y-Axis Scale Values: [45, 35, 25, 15, 5]
      const yLabels = [45, 35, 25, 15, 5];
      const ySteps = yLabels.length;

      // Draw Grid Lines & Y Labels
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#64748B';

      yLabels.forEach((val, i) => {
        const y = paddingTop + (i / (ySteps - 1)) * chartH;

        // Label
        ctx.fillText(val, paddingLeft - 12, y);

        // Dotted Line
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(w - paddingRight, y);
        ctx.stroke();
      });

      // Data Nodes (matching Image 4 graph points)
      // Range: Y values from 5 to 50
      const points = [
        { xRatio: 0.00, val: 8 },
        { xRatio: 0.12, val: 17 },
        { xRatio: 0.24, val: 2 },
        { xRatio: 0.36, val: 20 },
        { xRatio: 0.48, val: 32 },
        { xRatio: 0.60, val: 33 },
        { xRatio: 0.72, val: 47 },
        { xRatio: 0.84, val: 50 },
        { xRatio: 0.92, val: 37 },
        { xRatio: 1.00, val: 16 }
      ];

      function getYPixel(val) {
        // 45 is top, 5 is bottom
        const ratio = (val - 5) / (50 - 5);
        return (paddingTop + chartH) - (ratio * chartH);
      }

      function getXPixel(xRatio) {
        return paddingLeft + (xRatio * chartW);
      }

      // Draw Gradient Fill under line
      const fillGrad = ctx.createLinearGradient(0, paddingTop, 0, h - paddingBottom);
      fillGrad.addColorStop(0, 'rgba(0, 242, 254, 0.25)');
      fillGrad.addColorStop(1, 'rgba(0, 242, 254, 0.0)');

      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.moveTo(getXPixel(points[0].xRatio), getYPixel(points[0].val));

      points.forEach((p, i) => {
        if (i === 0) return;
        const prev = points[i - 1];
        const cx = (getXPixel(prev.xRatio) + getXPixel(p.xRatio)) / 2;
        ctx.bezierCurveTo(cx, getYPixel(prev.val), cx, getYPixel(p.val), getXPixel(p.xRatio), getYPixel(p.val));
      });

      ctx.lineTo(getXPixel(points[points.length - 1].xRatio), h - paddingBottom);
      ctx.lineTo(getXPixel(points[0].xRatio), h - paddingBottom);
      ctx.closePath();
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // Draw Main Curve Line
      ctx.beginPath();
      ctx.moveTo(getXPixel(points[0].xRatio), getYPixel(points[0].val));

      points.forEach((p, i) => {
        if (i === 0) return;
        const prev = points[i - 1];
        const cx = (getXPixel(prev.xRatio) + getXPixel(p.xRatio)) / 2;
        ctx.bezierCurveTo(cx, getYPixel(prev.val), cx, getYPixel(p.val), getXPixel(p.xRatio), getYPixel(p.val));
      });

      ctx.strokeStyle = '#00F2FE';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#00F2FE';
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Reset Shadow for Node Points
      ctx.shadowBlur = 0;

      // Draw Node Points
      points.forEach((p) => {
        const px = getXPixel(p.xRatio);
        const py = getYPixel(p.val);

        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#00F2FE';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      });
    }

    resizeAndDrawChart();
    window.addEventListener('resize', resizeAndDrawChart);
  }


  /* ==========================================
     3. FAQ ACCORDION EXPAND / COLLAPSE LOGIC
     ========================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    const chevronSvg = item.querySelector('.chevron-circle svg');

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other items (optional clean behavior)
      faqItems.forEach((other) => {
        other.classList.remove('open');
        const otherSvg = other.querySelector('.chevron-circle svg');
        if (otherSvg) {
          otherSvg.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';
        }
      });

      // Toggle current item
      if (!isOpen) {
        item.classList.add('open');
        if (chevronSvg) {
          chevronSvg.innerHTML = '<polyline points="18 15 12 9 6 15"></polyline>';
        }
      }
    });
  });


  /* ==========================================
     4. DOWNLOAD MODAL & SUPABASE EMAIL REGISTRATION
     ========================================== */
  // Supabase URL & Public Anon Key
  const SUPABASE_URL = 'https://anfiltmfkzyzuxbbpeks.supabase.co'; 
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuZmlsdG1ma3p5enV4YmJwZWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NDk0NDQsImV4cCI6MjEwMjAyNTQ0NH0.we6tpxvT0XSgXWRXW9r7CXtJrIF5VvRTF0rEZ8Z4r6Y';
  let supabaseClient = null;

  if (window.supabase && SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  const downloadModal = document.getElementById('downloadModal');
  const openDownloadBtn = document.getElementById('openDownloadBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const registerEmailTrigger = document.getElementById('registerEmailTrigger');
  const emailForm = document.getElementById('emailForm');
  const successMessage = document.getElementById('successMessage');
  const registeredEmailSpan = document.getElementById('registeredEmailSpan');

  function openModal() {
    if (downloadModal) downloadModal.classList.add('active');
  }

  function closeModal() {
    if (downloadModal) downloadModal.classList.remove('active');
  }

  if (openDownloadBtn) openDownloadBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (registerEmailTrigger) registerEmailTrigger.addEventListener('click', openModal);

  if (downloadModal) {
    downloadModal.addEventListener('click', (e) => {
      if (e.target === downloadModal) closeModal();
    });
  }

  if (emailForm) {
    emailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('userEmail');
      const email = emailInput ? emailInput.value.trim() : '';

      if (!email) return;

      const submitBtn = emailForm.querySelector('.btn-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      try {
        // If Supabase credentials are configured, save to User_Email table
        if (supabaseClient) {
          const { data, error } = await supabaseClient
            .from('User_Email')
            .insert([{ email: email }]);

          if (error) {
            console.error('Supabase Insert Error:', error);
            if (error.code === '23505') {
              alert('This email is already registered!');
            } else {
              alert('Failed to save email: ' + error.message);
            }
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Send Installation Link';
            }
            return;
          }
        } else {
          console.warn('Supabase credentials not configured in app.js yet. Showing success UI for demo.');
        }

        // Show Success UI
        if (registeredEmailSpan) registeredEmailSpan.textContent = email;
        emailForm.style.display = 'none';
        if (successMessage) successMessage.style.display = 'block';

      } catch (err) {
        console.error('Submission Error:', err);
        alert('An error occurred. Please try again.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Installation Link';
        }
      }
    });
  }

});
