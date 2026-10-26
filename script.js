/**
 * IT FRESHERS PARTY 2026 — DIGITAL INVITATION EXPERIENCE
 * Government Polytechnic Lucknow | Department of Information Technology
 * Vanilla JavaScript (ES6+) · No external dependencies
 */

'use strict';

/* ==========================================================================
   1. MASTER EVENT CONFIGURATION
   ========================================================================== */
const EVENT_CONFIG = {
  institution: "Government Polytechnic Lucknow",
  department: "Information Technology",
  departmentShort: "IT",
  eventName: "IT Freshers Party",
  dateDisplay: "28 October 2026",
  timeDisplay: "11:00 AM – 5:00 PM",
  venue: "Electronics Department",
  venueInstitution: "Government Polytechnic Lucknow",
  audience: "First-year IT students",
  invitationFrom: "Final-Year IT Seniors",

  // ISO-8601 timestamps — Asia/Kolkata (IST: UTC+5:30)
  startDateTimeISO: "2026-10-28T11:00:00+05:30",
  endDateTimeISO: "2026-10-28T17:00:00+05:30",

  // Official Registration URL
  registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSf1VIHoS7k-38LfOPPzM8svDh7lfVgX0VPw1uuLWqMqcVFTVQ/viewform?usp=publish-editor",

  // Calendar metadata
  calendar: {
    title: "IT Freshers Party 2026 — GP Lucknow",
    description: "Official IT Freshers Party hosted by Final-Year IT Seniors for First-Year IT students at Government Polytechnic Lucknow.",
    location: "Electronics Department, Government Polytechnic Lucknow",
    utcStart: "20261028T053000Z",   // 11:00 AM IST = 05:30 UTC
    utcEnd: "20261028T113000Z"    // 05:00 PM IST = 11:30 UTC
  }
};

/* ==========================================================================
   2. SCENE NAVIGATION CONTROLLER
   Manages scene transitions, gestures, wheel, keyboard, and nav dots.
   ========================================================================== */
class SceneNavigator {
  constructor() {
    this.scenes = document.querySelectorAll('.scene');
    this.totalScenes = this.scenes.length;
    this.currentScene = 0;
    this.isTransitioning = false;
    this.cooldown = 650; // ms — prevents rapid multi-scene skips

    this.progressBar = document.getElementById('scene-progress-bar');
    this.navDots = document.querySelectorAll('.nav-dot');
    this.btnEnter = document.getElementById('btn-enter');
    this.btnRevisit = document.getElementById('btn-revisit');

    // Touch tracking
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.touchMinDelta = 50;

    this._init();
  }

  _init() {
    this._bindEvents();
    this._updateUI(0);
  }

  _bindEvents() {
    // Wheel (throttled)
    window.addEventListener('wheel', (e) => this._handleWheel(e), { passive: false });

    // Keyboard
    window.addEventListener('keydown', (e) => this._handleKeydown(e));

    // Touch swipe
    window.addEventListener('touchstart', (e) => this._handleTouchStart(e), { passive: true });
    window.addEventListener('touchend', (e) => this._handleTouchEnd(e), { passive: true });

    // Navigation dots
    this.navDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const target = parseInt(dot.getAttribute('data-scene'), 10);
        if (!isNaN(target)) this.goToScene(target);
      });
    });

    // In-scene "next" buttons
    document.querySelectorAll('.scene-next-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = parseInt(btn.getAttribute('data-goto'), 10);
        if (!isNaN(target)) {
          this.goToScene(target);
        } else {
          this._nextScene();
        }
      });
    });

    // Hero "EXPLORE" button → scene 1
    if (this.btnEnter) {
      this.btnEnter.addEventListener('click', () => this.goToScene(1));
    }

    // Finale "REVISIT" button → scene 0
    if (this.btnRevisit) {
      this.btnRevisit.addEventListener('click', () => this.goToScene(0));
    }
  }

  _handleWheel(e) {
    const activeEl = this.scenes[this.currentScene];
    const wrapper = activeEl ? activeEl.querySelector('.scene-wrapper') : null;

    if (wrapper && wrapper.scrollHeight > wrapper.clientHeight) {
      const atTop = wrapper.scrollTop <= 2;
      const atBottom = (wrapper.scrollHeight - wrapper.scrollTop - wrapper.clientHeight) <= 2;
      if (e.deltaY > 0 && !atBottom) return;
      if (e.deltaY < 0 && !atTop) return;
    }

    e.preventDefault();
    if (this.isTransitioning) return;

    if (e.deltaY > 20) this._nextScene();
    else if (e.deltaY < -20) this._prevScene();
  }

  _handleKeydown(e) {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        this._nextScene();
        break;
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        this._prevScene();
        break;
      case 'Home':
        e.preventDefault();
        this.goToScene(0);
        break;
      case 'End':
        e.preventDefault();
        this.goToScene(this.totalScenes - 1);
        break;
    }
  }

  _handleTouchStart(e) {
    if (e.touches.length === 1) {
      this.touchStartY = e.touches[0].clientY;
      this.touchStartX = e.touches[0].clientX;
    }
  }

  _handleTouchEnd(e) {
    if (e.changedTouches.length !== 1 || this.isTransitioning) return;
    const deltaY = this.touchStartY - e.changedTouches[0].clientY;
    const deltaX = this.touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > this.touchMinDelta) {
      if (deltaY > 0) this._nextScene();
      else this._prevScene();
    }
  }

  _nextScene() {
    if (this.currentScene < this.totalScenes - 1) {
      this.goToScene(this.currentScene + 1);
    }
  }

  _prevScene() {
    if (this.currentScene > 0) {
      this.goToScene(this.currentScene - 1);
    }
  }

  goToScene(targetIndex) {
    if (targetIndex === this.currentScene || this.isTransitioning) return;
    if (targetIndex < 0 || targetIndex >= this.totalScenes) return;

    this.isTransitioning = true;
    const prevIndex = this.currentScene;
    this.currentScene = targetIndex;

    this.scenes[prevIndex].classList.remove('scene-active');
    this.scenes[this.currentScene].classList.add('scene-active');

    // Reset scroll position of incoming scene
    const newWrapper = this.scenes[this.currentScene].querySelector('.scene-wrapper');
    if (newWrapper) newWrapper.scrollTop = 0;

    this._updateUI(this.currentScene);

    setTimeout(() => {
      this.isTransitioning = false;
    }, this.cooldown);
  }

  _updateUI(index) {
    document.body.setAttribute('data-active-scene', index);

    // Progress bar (6 scenes)
    if (this.progressBar) {
      const pct = ((index + 1) / this.totalScenes) * 100;
      this.progressBar.style.width = `${pct}%`;
    }

    // Nav dots
    this.navDots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'step');
      } else {
        dot.classList.remove('active');
        dot.removeAttribute('aria-current');
      }
    });
  }
}

/* ==========================================================================
   3. COUNTDOWN CLOCK — Asia/Kolkata timezone-aware
   ========================================================================== */
class EventCountdown {
  constructor() {
    this.daysEl = document.getElementById('cd-days');
    this.hoursEl = document.getElementById('cd-hours');
    this.minutesEl = document.getElementById('cd-minutes');
    this.secondsEl = document.getElementById('cd-seconds');
    this.statusEl = document.getElementById('countdown-status');

    this.targetDate = new Date(EVENT_CONFIG.startDateTimeISO).getTime();
    this.endDate = new Date(EVENT_CONFIG.endDateTimeISO).getTime();

    this._timerId = null;
    this._init();
  }

  _init() {
    this._update();
    this._timerId = setInterval(() => this._update(), 1000);

    // Pause when tab is hidden, resume when visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(this._timerId);
      } else {
        this._update();
        this._timerId = setInterval(() => this._update(), 1000);
      }
    });
  }

  _update() {
    const now = Date.now();
    const distToStart = this.targetDate - now;
    const distToEnd = this.endDate - now;

    // Event is live right now
    if (distToStart <= 0 && distToEnd > 0) {
      this._setValues(0, 0, 0, 0);
      if (this.statusEl) {
        this.statusEl.textContent = "🎉 THE CELEBRATION HAS STARTED — WELCOME JUNIORS!";
      }
      return;
    }

    // Event has ended
    if (distToEnd <= 0) {
      this._setValues(0, 0, 0, 0);
      if (this.statusEl) {
        this.statusEl.textContent = "✨ THANK YOU FOR BEING PART OF IT";
      }
      clearInterval(this._timerId);
      return;
    }

    // Future — show countdown
    const days = Math.floor(distToStart / 86400000);
    const hours = Math.floor((distToStart % 86400000) / 3600000);
    const minutes = Math.floor((distToStart % 3600000) / 60000);
    const seconds = Math.floor((distToStart % 60000) / 1000);

    this._setValues(days, hours, minutes, seconds);

    if (this.statusEl) {
      this.statusEl.textContent = `Target: ${EVENT_CONFIG.dateDisplay} · 11:00 AM IST`;
    }
  }

  _setValues(d, h, m, s) {
    const pad = (n) => String(n).padStart(2, '0');
    if (this.daysEl) this.daysEl.textContent = pad(d);
    if (this.hoursEl) this.hoursEl.textContent = pad(h);
    if (this.minutesEl) this.minutesEl.textContent = pad(m);
    if (this.secondsEl) this.secondsEl.textContent = pad(s);
  }
}

/* ==========================================================================
   4. CALENDAR EXPORT
   ========================================================================== */
class CalendarHandler {
  constructor() {
    this.saveBtn = document.getElementById('save-date-btn');
    this.dropdown = document.getElementById('calendar-dropdown');
    this.btnGoogle = document.getElementById('cal-google');
    this.btnIcs = document.getElementById('cal-ics');
    this._init();
  }

  _init() {
    if (!this.saveBtn || !this.dropdown) return;

    this.saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!this.dropdown.contains(e.target) && e.target !== this.saveBtn) {
        this.dropdown.classList.add('hidden');
      }
    });

    if (this.btnGoogle) {
      this.btnGoogle.addEventListener('click', () => this._addToGoogle());
    }
    if (this.btnIcs) {
      this.btnIcs.addEventListener('click', () => this._downloadIcs());
    }
  }

  _addToGoogle() {
    const { calendar: cal } = EVENT_CONFIG;
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', cal.title);
    url.searchParams.set('dates', `${cal.utcStart}/${cal.utcEnd}`);
    url.searchParams.set('details', cal.description);
    url.searchParams.set('location', cal.location);
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
    this.dropdown.classList.add('hidden');
  }

  _downloadIcs() {
    const { calendar: cal } = EVENT_CONFIG;
    const uid = `it-freshers-2026-${Date.now()}@gplucknow.edu.in`;
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Government Polytechnic Lucknow//IT Freshers 2026//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${cal.utcStart}`,
      `DTEND:${cal.utcEnd}`,
      `SUMMARY:${cal.title}`,
      `DESCRIPTION:${cal.description}`,
      `LOCATION:${cal.location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'IT_Freshers_Party_2026.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    this.dropdown.classList.add('hidden');
  }
}

/* ==========================================================================
   5. AMBIENT BACKGROUND CANVAS
   Subtle particle constellation — reduced count on mobile, visibility-aware.
   ========================================================================== */
class AmbientCanvas {
  constructor() {
    this.canvas = document.getElementById('ambient-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.particles = [];
    this.maxDistance = 110;
    this.mouseX = -1000;
    this.mouseY = -1000;
    this._rafId = null;
    this._paused = false;

    this._init();
  }

  _init() {
    this._resize();
    window.addEventListener('resize', () => this._resize(), { passive: true });

    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this._paused = true;
        cancelAnimationFrame(this._rafId);
      } else {
        this._paused = false;
        this._render();
      }
    });

    this._createParticles();
    this._render();
  }

  _resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this._particleCount = this.width < 768 ? 28 : 52;
    // Recreate particles on resize to fill new dimensions
    if (this.particles.length) this._createParticles();
  }

  _createParticles() {
    // Using a restrained 2-color palette matching the new design tokens
    const colors = ['#82E6FF', '#619BFF'];
    this.particles = Array.from({ length: this._particleCount }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.5 + 0.6,
      color: colors[Math.floor(Math.random() * colors.length)],
      baseAlpha: Math.random() * 0.35 + 0.12
    }));
  }

  _render() {
    if (this._paused) return;
    const { ctx, width, height, particles, maxDistance, mouseX, mouseY } = this;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Bounce
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Gentle mouse repulsion
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 90 && dist > 0) {
        const force = (90 - dist) / 90;
        p.x -= (dx / dist) * force * 1.0;
        p.y -= (dy / dist) * force * 1.0;
      }

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.baseAlpha;
      ctx.shadowBlur = 0;
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist2 < maxDistance) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = '#619BFF';
          ctx.globalAlpha = (1 - dist2 / maxDistance) * 0.12;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    this._rafId = requestAnimationFrame(() => this._render());
  }
}

/* ==========================================================================
   6. CARD TILT EFFECT (Desktop pointer-hover only)
   ========================================================================== */
class CardTiltController {
  constructor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (e) => this._onMove(e, card));
      card.addEventListener('mouseleave', () => this._onLeave(card));
    });
  }

  _onMove(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / rect.height) * -4;
    const rotateY = ((x - rect.width / 2) / rect.width) * 4;
    card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
  }

  _onLeave(card) {
    card.style.transform = '';
  }
}

/* ==========================================================================
   7. BOOTSTRAP
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  window.sceneNavigator = new SceneNavigator();
  window.eventCountdown = new EventCountdown();
  window.calendarHandler = new CalendarHandler();
  window.ambientCanvas = new AmbientCanvas();
  window.cardTiltController = new CardTiltController();

  // Console signature
  console.log(
    `%c IT FRESHERS PARTY 2026 %c Govt. Polytechnic Lucknow %c`,
    'background: #82E6FF; color: #0B1020; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
    'background: #111A2E; color: #82E6FF; font-family: monospace; padding: 4px 8px; border-radius: 0 4px 4px 0;',
    'background: transparent;'
  );
  console.log(
    `%cCrafted with ❤️ by Final-Year IT Seniors for First-Year IT Juniors.`,
    'color: #B5C1D8; font-style: italic; font-size: 11px;'
  );
});
