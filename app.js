/* ==========================================================
   PERSONAI — Multi-Agent AI Workspace | Application Core
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Visit Count Tracking ──
  let visitCount = parseInt(localStorage.getItem('personai_visits') || '0', 10);
  visitCount++;
  localStorage.setItem('personai_visits', visitCount);

  fetch('/api/visits', { method: 'POST' })
    .then(res => {
      if (!res.ok) throw new Error('Database offline or unconfigured.');
      return res.json();
    })
    .then(data => {
      if (data && typeof data.visits === 'number') {
        visitCount = data.visits;
        localStorage.setItem('personai_visits', visitCount);
        refreshAdminStats();
      }
    })
    .catch(err => {
      console.warn('Using offline visits counter fallback:', err.message);
    });

  // ── 2. Subscriber Storage (Local Fallback) ──
  const getSubscribers = () =>
    JSON.parse(localStorage.getItem('personai_subscribers') || '[]');

  const saveSubscriber = (email) => {
    const subs = getSubscribers();
    if (!subs.some(sub => sub.email === email)) {
      subs.push({ email, timestamp: new Date().toISOString() });
      localStorage.setItem('personai_subscribers', JSON.stringify(subs));
    }
  };

  // ── 3. Form Submission Handler (Reusable for both forms) ──
  const showMessage = (el, text, type) => {
    if (!el) return;
    el.innerText = text;
    el.className = `form-message show ${type}`;
    if (type === 'error') {
      setTimeout(() => el.classList.remove('show'), 3500);
    }
  };

  const setupForm = (formId, emailId, submitId, msgId) => {
    const form = document.getElementById(formId);
    const emailInput = document.getElementById(emailId);
    const submitBtn = document.getElementById(submitId);
    const messageEl = document.getElementById(msgId);

    if (!form || !emailInput) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email) {
        showMessage(messageEl, 'Please enter your business email.', 'error');
        return;
      }

      if (!emailRegex.test(email)) {
        showMessage(messageEl, 'Please enter a valid email address.', 'error');
        return;
      }

      // Disable inputs during request
      if (submitBtn) submitBtn.disabled = true;
      emailInput.disabled = true;

      // Save locally first as fallback
      saveSubscriber(email);

      // Send to Vercel serverless API
      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      .then(res => {
        if (!res.ok) throw new Error('Server error');
        return res.json();
      })
      .then(() => {
        showMessage(messageEl, "Thank you! We'll be in touch shortly.", 'success');
        emailInput.value = '';
      })
      .catch(err => {
        console.warn('Using offline subscription fallback:', err.message);
        showMessage(messageEl, "Thank you! We'll be in touch shortly.", 'success');
        emailInput.value = '';
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
        emailInput.disabled = false;
        refreshAdminStats();
      });
    });
  };

  // Initialize both forms
  setupForm('hero-form', 'hero-email', 'hero-submit', 'hero-msg');
  setupForm('bottom-form', 'bottom-email', 'bottom-submit', 'bottom-msg');

  // ── 4. Secret Admin Console ──
  const adminBar = document.getElementById('admin-bar');
  const domainTrigger = document.querySelector('.domain-text');

  const fetchAdminStats = () => {
    fetch('/api/admin')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch admin statistics.');
        return res.json();
      })
      .then(data => {
        const visitsEl = document.getElementById('stat-visits');
        const subsEl = document.getElementById('stat-subscribers');

        if (visitsEl) visitsEl.innerText = data.visits;

        const subCount = Array.isArray(data.subscribers)
          ? data.subscribers.length
          : 0;
        if (subsEl) subsEl.innerText = subCount;

        adminBar.classList.add('visible');
      })
      .catch(err => {
        console.warn('Using offline admin fallback:', err.message);
        const visitsEl = document.getElementById('stat-visits');
        const subsEl = document.getElementById('stat-subscribers');
        if (visitsEl) visitsEl.innerText = visitCount;
        if (subsEl) subsEl.innerText = getSubscribers().length;
        adminBar.classList.add('visible');
      });
  };

  const refreshAdminStats = () => {
    if (adminBar && adminBar.classList.contains('visible')) {
      fetchAdminStats();
    }
  };

  const toggleAdminView = () => {
    if (!adminBar) return;
    if (adminBar.classList.contains('visible')) {
      adminBar.classList.remove('visible');
    } else {
      fetchAdminStats();
    }
  };

  // 5-click toggle on domain text
  if (domainTrigger) {
    let clickCount = 0;
    let clickTimer;

    domainTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      clickCount++;

      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 2000);

      if (clickCount >= 5) {
        toggleAdminView();
        clickCount = 0;
      }
    });
  }

  // ── 5. Scroll Reveal (IntersectionObserver) ──
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ── 6. Navbar Scroll Effect ──
  const navbar = document.getElementById('navbar');

  if (navbar) {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 60) {
            navbar.classList.add('nav-scrolled');
          } else {
            navbar.classList.remove('nav-scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on load in case page is already scrolled
    handleScroll();
  }

  // ── 7. Smooth Scroll for CTA Buttons ──
  document.querySelectorAll('[data-scroll-to]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-scroll-to');
      const target = document.getElementById(targetId);

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Focus the email input after scroll completes
        const emailInput = target.querySelector('input[type="email"]');
        if (emailInput) {
          setTimeout(() => emailInput.focus(), 700);
        }
      }
    });
  });

  // ── 8. Parallax orb effect on mouse move (desktop only) ──
  if (window.matchMedia('(min-width: 768px)').matches) {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      const orbs = heroSection.querySelectorAll('.hero-orb');

      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        orbs.forEach((orb, i) => {
          const intensity = (i + 1) * 12;
          requestAnimationFrame(() => {
            orb.style.transform = `translate(${x * intensity}px, ${y * intensity}px)`;
          });
        });
      });

      heroSection.addEventListener('mouseleave', () => {
        orbs.forEach(orb => {
          orb.style.transform = '';
        });
      });
    }
  }

});
