/**
 * IT FRESHERS PARTY 2026 — DIGITAL INVITATION EXPERIENCE
 * Government Polytechnic Lucknow | Department of Information Technology
 * Built with Vanilla JavaScript (HTML5 / CSS3 / Web Audio / Canvas)
 */

'use strict';

/* ==========================================================================
   1. MASTER EVENT CONFIGURATION OBJECT
   All event details are maintained here for immediate updates.
   ========================================================================== */
const EVENT_CONFIG = {
  institution: "Government Polytechnic Lucknow",
  department: "Information Technology",
  departmentShort: "IT",
  eventName: "IT Freshers Party",
  eventTagline: "A New Chapter Begins",
  dateDisplay: "28 October 2026",
  timeDisplay: "11:00 AM – 5:00 PM",
  venue: "Electronics Department",
  venueInstitution: "Government Polytechnic Lucknow",
  audience: "First-year IT students",
  invitationFrom: "Final-Year IT Seniors",

  // Accurate ISO-8601 timestamps in Asia/Kolkata (IST: UTC+5:30)
  startDateTimeISO: "2026-10-28T11:00:00+05:30",
  endDateTimeISO: "2026-10-28T17:00:00+05:30",

  // Official Registration URL
  registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSf1VIHoS7k-38LfOPPzM8svDh7lfVgX0VPw1uuLWqMqcVFTVQ/viewform?usp=publish-editor",

  // Google Calendar / iCal metadata
  calendar: {
    title: "IT Freshers Party 2026 — GP Lucknow",
    description: "Official IT Freshers Party hosted by Final-Year IT Seniors for First-Year IT students at Government Polytechnic Lucknow.",
    location: "Electronics Department, Government Polytechnic Lucknow",
    // 11:00 AM IST = 05:30 UTC | 05:00 PM IST = 11:30 UTC
    utcStart: "20261028T053000Z",
    utcEnd: "20261028T113000Z"
  }
};

/* ==========================================================================
   2. SCENE NAVIGATION CONTROLLER
   Manages 100svh transitions, gestures, wheel throttling, keyboard, and dots.
   ========================================================================== */
class SceneNavigator {
  constructor() {
    this.scenes = document.querySelectorAll('.scene');
    this.totalScenes = this.scenes.length;
    this.currentScene = 0;
    this.isTransitioning = false;
    this.transitionCooldown = 650; // ms to prevent rapid-fire scroll skips

    // DOM Elements
    this.progressBar = document.getElementById('scene-progress-bar');
    this.counterCurrent = document.getElementById('counter-current');
    this.counterTotal = document.getElementById('counter-total');
    this.navDots = document.querySelectorAll('.nav-dot');
    this.btnPrev = document.getElementById('btn-prev');
    this.btnNext = document.getElementById('btn-next');
    this.nextCtrlLabel = document.getElementById('next-ctrl-label');
    this.btnEnter = document.getElementById('btn-enter');
    this.btnRevisit = document.getElementById('btn-revisit');

    // Touch gesture tracking
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.touchMinDelta = 50; // minimum pixels to count as swipe

    this.init();
  }

  init() {
    if (this.counterTotal) {
      this.counterTotal.textContent = String(this.totalScenes).padStart(2, '0');
    }

    this.bindEvents();
    this.updateUI(0);
  }

  bindEvents() {
    // Wheel scroll navigation (throttled)
    window.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => this.handleKeydown(e));

    // Touch swipe navigation
    window.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    window.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

    // Bottom Navigation Buttons
    if (this.btnPrev) {
      this.btnPrev.addEventListener('click', () => this.prevScene());
    }
    if (this.btnNext) {
      this.btnNext.addEventListener('click', () => {
        if (this.currentScene === this.totalScenes - 1) {
          window.open(EVENT_CONFIG.registrationUrl, '_blank', 'noopener,noreferrer');
        } else {
          this.nextScene();
        }
      });
    }

    // Side Navigation Dots
    this.navDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const targetScene = parseInt(dot.getAttribute('data-scene'), 10);
        if (!isNaN(targetScene)) {
          this.goToScene(targetScene);
        }
      });
    });

    // In-Scene Contextual Next Buttons
    document.querySelectorAll('.scene-next-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = parseInt(btn.getAttribute('data-goto'), 10);
        if (!isNaN(target)) {
          this.goToScene(target);
        } else {
          this.nextScene();
        }
      });
    });

    // Scene 01 "ENTER THE EXPERIENCE" button
    if (this.btnEnter) {
      this.btnEnter.addEventListener('click', () => this.goToScene(1));
    }

    // Scene 07 "REVISIT THE INVITATION" button
    if (this.btnRevisit) {
      this.btnRevisit.addEventListener('click', () => this.goToScene(0));
    }
  }

  handleWheel(e) {
    // If the user is hovering inside an element that can scroll and isn't at the top/bottom, allow native scrolling
    const activeSceneEl = this.scenes[this.currentScene];
    const scrollWrapper = activeSceneEl ? activeSceneEl.querySelector('.scene-wrapper') : null;

    if (scrollWrapper && scrollWrapper.scrollHeight > scrollWrapper.clientHeight) {
      const isAtTop = scrollWrapper.scrollTop <= 2;
      const isAtBottom = (scrollWrapper.scrollHeight - scrollWrapper.scrollTop - scrollWrapper.clientHeight) <= 2;
      
      if (e.deltaY > 0 && !isAtBottom) return; // allow scrolling down
      if (e.deltaY < 0 && !isAtTop) return;    // allow scrolling up
    }

    e.preventDefault();

    if (this.isTransitioning) return;

    if (e.deltaY > 20) {
      this.nextScene();
    } else if (e.deltaY < -20) {
      this.prevScene();
    }
  }

  handleKeydown(e) {
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      e.preventDefault();
      this.nextScene();
    } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      e.preventDefault();
      this.prevScene();
    } else if (e.key === 'Home') {
      e.preventDefault();
      this.goToScene(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      this.goToScene(this.totalScenes - 1);
    }
  }

  handleTouchStart(e) {
    if (e.touches.length === 1) {
      this.touchStartY = e.touches[0].clientY;
      this.touchStartX = e.touches[0].clientX;
    }
  }

  handleTouchEnd(e) {
    if (e.changedTouches.length === 1 && !this.isTransitioning) {
      const deltaY = this.touchStartY - e.changedTouches[0].clientY;
      const deltaX = this.touchStartX - e.changedTouches[0].clientX;

      // Ensure vertical swipe is predominant
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > this.touchMinDelta) {
        if (deltaY > 0) {
          this.nextScene();
        } else {
          this.prevScene();
        }
      }
    }
  }

  nextScene() {
    if (this.currentScene < this.totalScenes - 1) {
      this.goToScene(this.currentScene + 1);
    }
  }

  prevScene() {
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

    // Switch scenes
    this.scenes[prevIndex].classList.remove('scene-active');
    this.scenes[this.currentScene].classList.add('scene-active');

    // Reset scroll of wrapper in newly active scene
    const newWrapper = this.scenes[this.currentScene].querySelector('.scene-wrapper');
    if (newWrapper) {
      newWrapper.scrollTop = 0;
    }

    this.updateUI(this.currentScene);

    // Trigger subtle sound effect if synthesizer is on
    if (window.soundSynthesizer && window.soundSynthesizer.isEnabled) {
      window.soundSynthesizer.playChime();
    }

    setTimeout(() => {
      this.isTransitioning = false;
    }, this.transitionCooldown);
  }

  updateUI(index) {
    document.body.setAttribute('data-active-scene', index);

    // Update Counter
    if (this.counterCurrent) {
      this.counterCurrent.textContent = String(index + 1).padStart(2, '0');
    }

    // Update Top Progress Bar
    if (this.progressBar) {
      const percentage = ((index + 1) / this.totalScenes) * 100;
      this.progressBar.style.width = `${percentage}%`;
    }

    // Update Navigation Dots
    this.navDots.forEach((dot, dotIdx) => {
      if (dotIdx === index) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'step');
      } else {
        dot.classList.remove('active');
        dot.removeAttribute('aria-current');
      }
    });

    // Update Footer Prev/Next Controls
    if (this.btnPrev) {
      this.btnPrev.disabled = (index === 0);
    }

    if (this.btnNext && this.nextCtrlLabel) {
      if (index === this.totalScenes - 1) {
        this.nextCtrlLabel.textContent = "REGISTER NOW";
      } else {
        this.nextCtrlLabel.textContent = "NEXT SCENE";
      }
    }
  }
}

/* ==========================================================================
   3. TIMEZONE-AWARE LIVE COUNTDOWN CLOCK (ASIA/KOLKATA)
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

    this.timerId = null;
    this.init();
  }

  init() {
    this.update();
    this.timerId = setInterval(() => this.update(), 1000);
  }

  update() {
    const now = Date.now();
    const distanceToStart = this.targetDate - now;
    const distanceToEnd = this.endDate - now;

    // Check if event is currently in progress
    if (distanceToStart <= 0 && distanceToEnd > 0) {
      this.setValues(0, 0, 0, 0);
      if (this.statusEl) {
        this.statusEl.textContent = "🎉 THE FRESHERS CELEBRATION IS LIVE RIGHT NOW! WELCOME JUNIORS!";
      }
      return;
    }

    // Check if event has concluded
    if (distanceToEnd <= 0) {
      this.setValues(0, 0, 0, 0);
      if (this.statusEl) {
        this.statusEl.textContent = "✨ Event concluded. Welcome to the IT Family!";
      }
      clearInterval(this.timerId);
      return;
    }

    // Event is in the future
    const days = Math.floor(distanceToStart / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distanceToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distanceToStart % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distanceToStart % (1000 * 60)) / 1000);

    this.setValues(days, hours, minutes, seconds);

    if (this.statusEl) {
      this.statusEl.textContent = `Target: ${EVENT_CONFIG.dateDisplay} at 11:00 AM IST (Electronics Dept.)`;
    }
  }

  setValues(d, h, m, s) {
    if (this.daysEl) this.daysEl.textContent = String(d).padStart(2, '0');
    if (this.hoursEl) this.hoursEl.textContent = String(h).padStart(2, '0');
    if (this.minutesEl) this.minutesEl.textContent = String(m).padStart(2, '0');
    if (this.secondsEl) this.secondsEl.textContent = String(s).padStart(2, '0');
  }
}

/* ==========================================================================
   4. CALENDAR EXPORT & SAVE THE DATE
   Generates Google Calendar direct URL & downloadable .ics file.
   ========================================================================== */
class CalendarHandler {
  constructor() {
    this.saveBtn = document.getElementById('save-date-btn');
    this.dropdown = document.getElementById('calendar-dropdown');
    this.btnGoogle = document.getElementById('cal-google');
    this.btnIcs = document.getElementById('cal-ics');

    this.init();
  }

  init() {
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
      this.btnGoogle.addEventListener('click', () => this.addToGoogleCalendar());
    }

    if (this.btnIcs) {
      this.btnIcs.addEventListener('click', () => this.downloadIcsFile());
    }
  }

  addToGoogleCalendar() {
    const cal = EVENT_CONFIG.calendar;
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', cal.title);
    url.searchParams.set('dates', `${cal.utcStart}/${cal.utcEnd}`);
    url.searchParams.set('details', cal.description);
    url.searchParams.set('location', cal.location);

    window.open(url.toString(), '_blank', 'noopener,noreferrer');
    this.dropdown.classList.add('hidden');
  }

  downloadIcsFile() {
    const cal = EVENT_CONFIG.calendar;
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Government Polytechnic Lucknow//IT Freshers 2026//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:it-freshers-2026-${Date.now()}@gplucknow.ac.in`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${cal.utcStart}`,
      `DTEND:${cal.utcEnd}`,
      `SUMMARY:${cal.title}`,
      `DESCRIPTION:${cal.description}`,
      `LOCATION:${cal.location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'IT_Freshers_Party_2026.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);

    this.dropdown.classList.add('hidden');
  }
}

/* ==========================================================================
   5. INTERACTIVE AMBIENT BACKGROUND CANVAS
   Renders particle constellations, subtle luminous lines, and tech stardust.
   ========================================================================== */
class AmbientCanvas {
  constructor() {
    this.canvas = document.getElementById('ambient-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.particles = [];
    this.particleCount = window.innerWidth < 768 ? 32 : 64;
    this.maxDistance = 120;
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.animationFrameId = null;
    this.isPaused = false;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isPaused = true;
      } else {
        this.isPaused = false;
        this.render();
      }
    });

    this.createParticles();
    this.render();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.particleCount = this.width < 768 ? 32 : 64;
  }

  createParticles() {
    this.particles = [];
    const colors = ['#8B5CF6', '#22D3EE', '#F472B6', '#F5D6A0'];

    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.8 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.5 + 0.2
      });
    }
  }

  render() {
    if (this.isPaused) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Bounce at boundary
      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;

      // Mouse repulsion
      const dx = this.mouseX - p.x;
      const dy = this.mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        p.x -= (dx / dist) * force * 1.2;
        p.y -= (dy / dist) * force * 1.2;
      }

      // Draw particle dot
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.baseAlpha;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();

      // Connect with close neighbours
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const distP = Math.hypot(p.x - p2.x, p.y - p2.y);

        if (distP < this.maxDistance) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = '#8B5CF6';
          this.ctx.globalAlpha = (1 - distP / this.maxDistance) * 0.15;
          this.ctx.shadowBlur = 0;
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }
    }

    this.ctx.globalAlpha = 1;
    this.animationFrameId = requestAnimationFrame(() => this.render());
  }
}

/* ==========================================================================
   6. 3D CARD TILT ON POINTER MOVE
   ========================================================================== */
class CardTiltController {
  constructor() {
    this.cards = document.querySelectorAll('[data-tilt]');
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      this.init();
    }
  }

  init() {
    this.cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => this.onMove(e, card));
      card.addEventListener('mouseleave', () => this.onLeave(card));
    });
  }

  onMove(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
  }

  onLeave(card) {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  }
}

/* ==========================================================================
   7. CUSTOM CINEMATIC CURSOR (DESKTOP FINE POINTER ONLY)
   ========================================================================== */
class CustomCursor {
  constructor() {
    this.cursor = document.getElementById('custom-cursor');
    if (!this.cursor || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }

    this.mouseX = -100;
    this.mouseY = -100;
    this.currentX = -100;
    this.currentY = -100;

    this.init();
  }

  init() {
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }, { passive: true });

    // Interactive elements trigger scale & glow
    const interactives = document.querySelectorAll('button, a, .nav-dot, .feature-card, .event-tile, .etiquette-card');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    this.render();
  }

  render() {
    this.currentX += (this.mouseX - this.currentX) * 0.18;
    this.currentY += (this.mouseY - this.currentY) * 0.18;

    this.cursor.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;
    requestAnimationFrame(() => this.render());
  }
}

/* ==========================================================================
   8. AMBIENT AUDIO SYNTHESIZER (WEB AUDIO API — NO EXTERNAL FILES REQUIRED)
   OFF by default. Generates gentle celestial harmonic drones & soft chimes.
   ========================================================================== */
class AmbientAudioSynthesizer {
  constructor() {
    this.btn = document.getElementById('sound-toggle');
    this.audioCtx = null;
    this.masterGain = null;
    this.oscillators = [];
    this.isEnabled = false;

    this.init();
  }

  init() {
    if (!this.btn) return;

    this.btn.addEventListener('click', () => {
      this.toggleAudio();
    });
  }

  toggleAudio() {
    if (!this.isEnabled) {
      this.startAudio();
    } else {
      this.stopAudio();
    }
  }

  startAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.08, this.audioCtx.currentTime + 3);
      this.masterGain.connect(this.audioCtx.destination);

      // Low pass filter for warm, celestial timbre
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.audioCtx.currentTime);
      filter.connect(this.masterGain);

      // Harmonic frequencies: F, C, A, C (peaceful ambient chord)
      const frequencies = [87.31, 130.81, 174.61, 220.00];
      this.oscillators = frequencies.map((freq) => {
        const osc = this.audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        osc.connect(filter);
        osc.start();
        return osc;
      });

      this.isEnabled = true;
      this.btn.classList.add('is-active');
      this.btn.setAttribute('title', 'Ambient Audio: Playing');
      this.btn.setAttribute('aria-label', 'Ambient Audio is On. Click to mute.');
    } catch (err) {
      console.warn("Web Audio API not supported or blocked:", err);
    }
  }

  stopAudio() {
    if (!this.audioCtx || !this.masterGain) return;

    this.masterGain.gain.linearRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1);
    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      this.oscillators = [];
      this.isEnabled = false;
      this.btn.classList.remove('is-active');
      this.btn.setAttribute('title', 'Ambient Audio: Off');
      this.btn.setAttribute('aria-label', 'Ambient Audio is Off. Click to enable.');
    }, 1000);
  }

  playChime() {
    if (!this.isEnabled || !this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const chimeOsc = this.audioCtx.createOscillator();
      const chimeGain = this.audioCtx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(523.25, now); // C5
      chimeOsc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

      chimeGain.gain.setValueAtTime(0.04, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.audioCtx.destination);

      chimeOsc.start(now);
      chimeOsc.stop(now + 0.85);
    } catch (e) {}
  }
}

/* ==========================================================================
   9. APPLICATION BOOTSTRAP
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Expose global navigator and audio instance
  window.sceneNavigator = new SceneNavigator();
  window.eventCountdown = new EventCountdown();
  window.calendarHandler = new CalendarHandler();
  window.ambientCanvas = new AmbientCanvas();
  window.cardTiltController = new CardTiltController();
  window.customCursor = new CustomCursor();
  window.soundSynthesizer = new AmbientAudioSynthesizer();

  // Console Welcome Signature
  console.log(
    `%c IT FRESHERS PARTY 2026 %c Government Polytechnic Lucknow %c`,
    'background: #8B5CF6; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
    'background: #11132B; color: #22D3EE; font-family: monospace; padding: 4px 8px; border-radius: 0 4px 4px 0;',
    'background: transparent;'
  );
  console.log(
    `%cCrafted with ❤️ by Final-Year IT Seniors for First-Year IT Juniors.`,
    'color: #F5D6A0; font-style: italic; font-size: 11px;'
  );
});
