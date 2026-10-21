/**
 * HITESH CHOWDHARY — PORTFOLIO SCRIPT
 * 3D Scroll Frame Scrubbing, Responsive Navigation, Form & Resume Handlers
 */

const canvas = document.getElementById('scroll-canvas');
const ctx = canvas.getContext('2d', { alpha: false });

const TOTAL_FRAMES = 240;
const frames = new Array(TOTAL_FRAMES + 1);
let lastDrawnFrameIndex = -1;

// Get image path for a given frame index (1 to 240)
function getFrameSrc(index) {
  const padded = String(index).padStart(3, '0');
  return `frames/ezgif-frame-${padded}.jpg`;
}

// Adjust canvas resolution for retina displays and viewport size
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);

  if (lastDrawnFrameIndex !== -1) {
    const frame = getBestAvailableFrame(lastDrawnFrameIndex);
    if (frame) drawFrame(frame);
  }
}

// Draw the image centered with 'cover' aspect ratio
function drawFrame(img) {
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const cw = canvas.width;
  const ch = canvas.height;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  // Calculate cover ratio
  const ratio = Math.max(cw / iw, ch / ih);
  const nw = iw * ratio;
  const nh = ih * ratio;
  const offsetX = (cw - nw) / 2;
  const offsetY = (ch - nh) / 2;

  ctx.drawImage(img, 0, 0, iw, ih, offsetX, offsetY, nw, nh);
}

// Find closest loaded frame to avoid any black/white flickering
function getBestAvailableFrame(index) {
  if (frames[index] && frames[index].complete && frames[index].naturalWidth > 0) {
    return frames[index];
  }
  // Search backward
  for (let i = index - 1; i >= 1; i--) {
    if (frames[i] && frames[i].complete && frames[i].naturalWidth > 0) {
      return frames[i];
    }
  }
  // Search forward
  for (let i = index + 1; i <= TOTAL_FRAMES; i++) {
    if (frames[i] && frames[i].complete && frames[i].naturalWidth > 0) {
      return frames[i];
    }
  }
  return null;
}

// Preload all 240 frames
function preloadFrames() {
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = getFrameSrc(i);
    img.onload = () => {
      if (i === 1 && lastDrawnFrameIndex === -1) {
        lastDrawnFrameIndex = 1;
        drawFrame(img);
      }
    };
    frames[i] = img;
  }
}

// Scroll animation state
let targetProgress = 0;
let currentProgress = 0;
const LERP_FACTOR = 0.08;

// Navigation active state tracking
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNavLink() {
  let currentSectionId = '';
  const scrollPosition = window.scrollY + 220;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    if (scrollPosition >= top && scrollPosition < top + height) {
      currentSectionId = section.getAttribute('id');
    }
  });

  if (currentSectionId) {
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

function updateTargetProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll > 0) {
    targetProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  } else {
    targetProgress = 0;
  }
  updateActiveNavLink();
}

// Continuous requestAnimationFrame render loop with linear interpolation
function renderLoop() {
  currentProgress += (targetProgress - currentProgress) * LERP_FACTOR;

  const targetFrameIndex = Math.min(
    TOTAL_FRAMES,
    Math.max(1, Math.round(1 + currentProgress * (TOTAL_FRAMES - 1)))
  );

  if (targetFrameIndex !== lastDrawnFrameIndex) {
    const frame = getBestAvailableFrame(targetFrameIndex);
    if (frame) {
      drawFrame(frame);
      lastDrawnFrameIndex = targetFrameIndex;
    }
  }

  requestAnimationFrame(renderLoop);
}

// Mobile navigation toggle
const mobileToggle = document.getElementById('mobile-toggle');
const navLinksContainer = document.getElementById('main-nav');

if (mobileToggle && navLinksContainer) {
  mobileToggle.addEventListener('click', () => {
    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    mobileToggle.setAttribute('aria-expanded', !isExpanded);

    if (isExpanded) {
      navLinksContainer.style.display = 'none';
    } else {
      navLinksContainer.style.display = 'flex';
      navLinksContainer.style.flexDirection = 'column';
      navLinksContainer.style.position = 'absolute';
      navLinksContainer.style.top = '100%';
      navLinksContainer.style.left = '0';
      navLinksContainer.style.width = '100%';
      navLinksContainer.style.background = 'rgba(10, 5, 24, 0.98)';
      navLinksContainer.style.padding = '24px';
      navLinksContainer.style.borderBottom = '1px solid rgba(168, 85, 247, 0.3)';
    }
  });

  // Close mobile menu upon clicking a nav link
  navLinksContainer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        navLinksContainer.style.display = 'none';
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// Resume PDF verification & download modal handling
const resumeBtn = document.getElementById('resume-download-btn');
const resumeModal = document.getElementById('resume-modal');
const modalClose = document.getElementById('modal-close');
const modalDismiss = document.getElementById('modal-dismiss');

if (resumeBtn) {
  resumeBtn.addEventListener('click', async (e) => {
    try {
      const response = await fetch('resume.pdf', { method: 'HEAD' });
      if (!response.ok) {
        e.preventDefault();
        showResumeModal();
      }
      // If response is ok (file exists), normal download proceeds automatically
    } catch (err) {
      // Local file or network block, show modal if not accessible
      e.preventDefault();
      showResumeModal();
    }
  });
}

function showResumeModal() {
  if (resumeModal) {
    resumeModal.classList.add('active');
    resumeModal.setAttribute('aria-hidden', 'false');
  }
}

function closeResumeModal() {
  if (resumeModal) {
    resumeModal.classList.remove('active');
    resumeModal.setAttribute('aria-hidden', 'true');
  }
}

if (modalClose) modalClose.addEventListener('click', closeResumeModal);
if (modalDismiss) modalDismiss.addEventListener('click', closeResumeModal);
if (resumeModal) {
  resumeModal.addEventListener('click', (e) => {
    if (e.target === resumeModal) closeResumeModal();
  });
}

// Contact Form Handler — Direct mailto transmission with transparent user feedback
const contactForm = document.getElementById('contact-form');
const formFeedback = document.getElementById('form-feedback');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !subject || !message) {
      alert('Please fill out all fields before submitting.');
      return;
    }

    const emailBody = `Sender Name: ${name}\nSender Email: ${email}\n\nMessage:\n${message}`;
    const mailtoUrl = `mailto:hiteshe297@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    // Open user's email client
    window.location.href = mailtoUrl;

    if (formFeedback) {
      formFeedback.className = 'form-feedback-message success';
      formFeedback.innerHTML = `&#x2714; Launching your email client to send to <strong>hiteshe297@gmail.com</strong>. Please click "Send" in your email app.`;
    }
  });
}

// Window Event Listeners
window.addEventListener('resize', resizeCanvas);
window.addEventListener('scroll', updateTargetProgress, { passive: true });

// Initialize
resizeCanvas();
preloadFrames();
updateTargetProgress();
requestAnimationFrame(renderLoop);
