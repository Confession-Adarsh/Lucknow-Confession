// ====== FIREBASE CONFIGURATION ======
// Replace with your actual Firebase config from console
const firebaseConfig = {
  apiKey: "AIzaSyCRbvL-ukbI3F7et2eWzCYQ4lZ6d-u6WWc",
  authDomain: "confess-tg.firebaseapp.com",
  databaseURL: "https://confess-tg-default-rtdb.firebaseio.com/", // No spaces!
  projectId: "confess-tg",
  storageBucket: "confess-tg.firebasestorage.app",
  messagingSenderId: "360800512759",
  appId: "1:360800512759:web:53ffce65d5f910da1d41f2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// ===================================

// ====== ANTI-ABUSE CONFIGURATION ======
const MODERATION_CONFIG = {
  MAX_SUBMISSIONS_PER_SESSION: 3,
  MIN_SUBMIT_INTERVAL: 60 * 1000, // 1 minute between submissions
  BANNED_PHRASES: [
    "kill", "bomb", "hack", "ddos", "suicide", "self harm", "racist",
    "nigga", "faggot", "slut", "whore", "porn", "nude", "sex",
    "fuck", "bitch", "asshole", "cunt", "dick", "pussy",
    "http://", "https://", "www.", ".com", ".net", ".org",
    "click here", "free money", "earn cash", "subscribe", "follow me",
    "my channel", "t.me/", "wa.me", "instagram.com", "facebook.com",
    "tiktok.com", "discord.gg", "onlyfans"
  ],
  SPAM_PATTERNS: [
    /(.)\1{4,}/,            // Repeated chars: aaaaa
    /\d{5,}/,               // Long numbers
    /^[A-Z\s!?]+$/,         // ALL CAPS
    /(?:\s*\W\s*){10,}/     // Excessive symbols
  ]
};

// Session state (resets on page reload)
let submissionCount = 0;
let lastSubmitTime = 0;
// =====================================

// ====== TEXT ANALYSIS FUNCTIONS ======
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s\-\']+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsBannedContent(text) {
  const normalized = normalizeText(text);
  return MODERATION_CONFIG.BANNED_PHRASES.some(phrase => 
    normalized.includes(phrase.toLowerCase())
  );
}

function matchesSpamPattern(text) {
  return MODERATION_CONFIG.SPAM_PATTERNS.some(pattern => pattern.test(text));
}

function isRateLimited() {
  const now = Date.now();
  if (submissionCount >= MODERATION_CONFIG.MAX_SUBMISSIONS_PER_SESSION) {
    return { blocked: true, reason: "Daily confession limit reached." };
  }
  if (now - lastSubmitTime < MODERATION_CONFIG.MIN_SUBMIT_INTERVAL) {
    const waitSecs = Math.ceil((MODERATION_CONFIG.MIN_SUBMIT_INTERVAL - (now - lastSubmitTime)) / 1000);
    return { blocked: true, reason: `Wait ${waitSecs} second${waitSecs !== 1 ? 's' : ''} before submitting again.` };
  }
  return { blocked: false };
}
// =====================================

// ====== VALIDATION FUNCTION ======
async function validateConfession(text) {
  if (!text || text.trim().length === 0) {
    Telegram.WebApp.showAlert('Your confession is empty.');
    return false;
  }

  if (text.length > 1000) {
    Telegram.WebApp.showAlert('Confession too long (max 1000 characters).');
    return false;
  }

  // Rate limiting
  const rateCheck = isRateLimited();
  if (rateCheck.blocked) {
    Telegram.WebApp.showAlert(rateCheck.reason);
    return false;
  }

  // Content checks
  if (containsBannedContent(text)) {
    Telegram.WebApp.showAlert('Your message contains prohibited content.');
    return false;
  }

  if (matchesSpamPattern(text)) {
    Telegram.WebApp.showAlert('Your message looks like spam.');
    return false;
  }

  return true;
}
// =================================

// ====== FIREBASE SAVE FUNCTION ======
async function sendConfession(text) {
  try {
    const db = firebase.database();
    const newRef = db.ref('confessions').push();

    // Get Telegram user data (for moderation only)
    const user = Telegram.WebApp.initDataUnsafe?.user;
    
    const userData = {
      text: text.trim(),
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      tg_user_id: user?.id || null,
      tg_username: user?.username || null, // ← Username (e.g., "john_doe")
      tg_first_name: user?.first_name || null,
      tg_last_name: user?.last_name || null
    };

    await newRef.set(userData);
  } catch (error) {
    console.error("Firebase save error:", error);
    throw error;
  }
}
// ===================================

// ====== ANIMATION FUNCTIONS ======
function generateCity() {
  const container = document.getElementById('citySilhouette');
  if (!container) return;

  const width = container.offsetWidth || window.innerWidth;
  const buildingCount = Math.floor(width / 40);

  for (let i = 0; i < buildingCount; i++) {
    const building = document.createElement('div');
    building.className = 'building';
    const height = 80 + Math.random() * 120;
    building.style.height = `${height}px`;
    building.style.left = `${i * 40}px`;

    const windowCount = Math.floor(height / 20);
    for (let j = 0; j < windowCount; j++) {
      const win = document.createElement('div');
      win.className = 'window';
      const w = 8 + Math.random() * 6;
      const h = 8 + Math.random() * 6;
      const l = 8 + Math.random() * 16;
      const t = 10 + j * 20;
      win.style.width = `${w}px`;
      win.style.height = `${h}px`;
      win.style.left = `${l}px`;
      win.style.top = `${t}px`;
      win.style.animationDelay = `${Math.random() * 5}s`;
      building.appendChild(win);
    }
    container.appendChild(building);
  }
}

function generateStars() {
  const container = document.getElementById('stars');
  if (!container) return;

  for (let i = 0; i < 150; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 3;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty('--duration', `${2 + Math.random() * 8}s`);
    star.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(star);
  }
}
// =================================

// ====== MAIN APP INITIALIZATION ======
function initConfessionApp() {
  // Safety check
  if (typeof Telegram === 'undefined' || !Telegram.WebApp) {
    console.error("This app must be opened inside Telegram.");
    document.body.innerHTML = `<h2 style='color:white;text-align:center;margin-top:20vh;'>Open in Telegram!</h2>`;
    return;
  }

  Telegram.WebApp.ready();
  Telegram.WebApp.expand();

  // DOM elements
  const confessionInput = document.getElementById('confessionInput');
  const charCountEl = document.getElementById('charCount');
  const progressBar = document.getElementById('progressBar');
  const mainButton = Telegram.WebApp.MainButton;

  if (!confessionInput || !charCountEl || !mainButton) {
    console.error("Missing UI elements");
    return;
  }

  // Configure Telegram button
  mainButton.setText('Submit Confession');
  mainButton.hide();

  // Input handler
  const MAX_CHARS = 1000;
  confessionInput.addEventListener('input', () => {
    let text = confessionInput.value;
    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS);
      confessionInput.value = text;
    }

    charCountEl.textContent = text.length;
    const progress = Math.min(100, (text.length / MAX_CHARS) * 100);
    if (progressBar) progressBar.style.width = `${progress}%`;

    if (text.length > 0 && text.length <= MAX_CHARS) {
      mainButton.show();
    } else {
      mainButton.hide();
    }
  });

  // Submit handler
  mainButton.onClick(async () => {
    const confession = confessionInput.value;
    const isValid = await validateConfession(confession);
    if (!isValid) return;

    try {
      await sendConfession(confession);

      // Update session state
      submissionCount++;
      lastSubmitTime = Date.now();

      // Success feedback
      Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      Telegram.WebApp.showAlert('Your secret is safe with the city 🌃');

      // Reset UI
      confessionInput.value = '';
      charCountEl.textContent = '0';
      if (progressBar) progressBar.style.width = '0%';
      mainButton.hide();
    } catch (error) {
      Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      Telegram.WebApp.showAlert('Failed to send. Try again.');
      console.error("Submission failed:", error);
    }
  });
}
// ===================================

// ====== START APP ON LOAD ======
document.addEventListener('DOMContentLoaded', () => {
  generateCity();
  generateStars();
  initConfessionApp();
});
// ===============================