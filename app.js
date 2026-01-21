// ====== FIREBASE CONFIG (REPLACE WITH YOUR ACTUAL VALUES) ======
const firebaseConfig = {
  apiKey: "AIzaSyCRbvL-ukbI3F7et2eWzCYQ4lZ6d-u6WWc",
  authDomain: "confess-tg.firebaseapp.com",
  databaseURL: "https://confess-tg-default-rtdb.firebaseio.com/", // No spaces!
  projectId: "confess-tg",
  storageBucket: "confess-tg.firebasestorage.app",
  messagingSenderId: "360800512759",
  appId: "1:360800512759:web:53ffce65d5f910da1d41f2"
};

firebase.initializeApp(firebaseConfig);

// ====== MODERATION RULES ======
const MODERATION_CONFIG = {
  // Max submissions per session (in-memory)
  MAX_SUBMISSIONS_PER_SESSION: 3,
  
  // Minimum time between submissions (ms)
  MIN_SUBMIT_INTERVAL: 60 * 1000, // 1 minute

  // Banned phrases (case-insensitive, partial match)
  BANNED_PHRASES: [
    "kill",
    "bomb",
    "hack",
    "ddos",
    "suicide",
    "self harm",
    "racist",
    "nigga",
    "faggot",
    "slut",
    "whore",
    "porn",
    "http://",
    "https://",
    "www.",
    ".com",
    ".net",
    ".org",
    "click here",
    "free money",
    "earn cash",
    "subscribe",
    "follow me",
    "my channel",
    "t.me/",
    "telegram.me",
    "wa.me",
    "instagram.com",
    "facebook.com",
    "tiktok.com",
    "discord.gg",
    "onlyfans",
    "nude",
    "sex",
    "fuck",
    "bitch",
    "asshole",
    "cunt",
    "dick",
    "pussy"
  ],

  // Suspicious patterns
  SPAM_PATTERNS: [
    /(.)\1{4,}/,            // Repeated characters: aaaaa, 11111
    /\d{5,}/,               // Long number sequences
    /^[A-Z\s!?]+$/,         // ALL CAPS
    /(?:\s*\W\s*){10,}/,    // Excessive symbols
    /\b\w{1,2}\b.*\b\w{1,2}\b.*\b\w{1,2}\b/ // Too many 1-2 letter words (spammy)
  ]
};

// Session state (resets on page reload)
let submissionCount = 0;
let lastSubmitTime = 0;

// Normalize & clean text for analysis
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s\-\']+/g, ' ') // Keep letters, numbers, spaces, hyphens, apostrophes
    .replace(/\s+/g, ' ')
    .trim();
}

// Check for banned phrases
function containsBannedContent(text) {
  const normalized = normalizeText(text);
  return MODERATION_CONFIG.BANNED_PHRASES.some(phrase => 
    normalized.includes(phrase.toLowerCase())
  );
}

// Check for spammy patterns
function matchesSpamPattern(text) {
  return MODERATION_CONFIG.SPAM_PATTERNS.some(pattern => pattern.test(text));
}

// Rate limiting check
function isRateLimited() {
  const now = Date.now();
  if (submissionCount >= MODERATION_CONFIG.MAX_SUBMISSIONS_PER_SESSION) {
    return { blocked: true, reason: "You've reached the daily limit for confessions." };
  }
  if (now - lastSubmitTime < MODERATION_CONFIG.MIN_SUBMIT_INTERVAL) {
    const waitSecs = Math.ceil((MODERATION_CONFIG.MIN_SUBMIT_INTERVAL - (now - lastSubmitTime)) / 1000);
    return { blocked: true, reason: `Please wait ${waitSecs} more second(s) before submitting again.` };
  }
  return { blocked: false };
}

// Main validation with moderation
export async function validateConfession(text) {
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

  // Banned content
  if (containsBannedContent(text)) {
    Telegram.WebApp.showAlert('Your message contains prohibited content.');
    console.warn("Blocked submission: banned phrase detected");
    return false;
  }

  // Spam patterns
  if (matchesSpamPattern(text)) {
    Telegram.WebApp.showAlert('Your message looks like spam.');
    console.warn("Blocked submission: spam pattern detected");
    return false;
  }

  // Allow
  return true;
}

// ====== SUBMISSION HANDLER ======
export async function sendConfession(text) {
  try {
    const db = firebase.database();
    const newRef = db.ref('confessions').push();

    const user = Telegram.WebApp.initDataUnsafe?.user;
    await newRef.set({
      text: text.trim(),
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      tg_user_id: user?.id || null,
      tg_username: user?.username || null,
      // Optional: flag for manual review (if you add admin panel later)
      flagged: false
    });
  } catch (error) {
    console.error("Firebase save error:", error);
    throw error;
  }
}

// ====== ANIMATIONS (unchanged) ======
export function generateCity() {
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

export function generateStars() {
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

// ====== MAIN APP INIT ======
export function initConfessionApp() {
  if (typeof Telegram === 'undefined' || !Telegram.WebApp) {
    console.error("This app must be opened inside Telegram.");
    document.body.innerHTML = `<h2 style='color:white;text-align:center;margin-top:20vh;'>Open in Telegram!</h2>`;
    return;
  }

  Telegram.WebApp.ready();
  Telegram.WebApp.expand();

  const confessionInput = document.getElementById('confessionInput');
  const charCountEl = document.getElementById('charCount');
  const progressBar = document.getElementById('progressBar');
  const mainButton = Telegram.WebApp.MainButton;

  if (!confessionInput || !charCountEl || !mainButton) {
    console.error("Missing UI elements");
    return;
  }

  mainButton.setText('Submit Confession');
  mainButton.hide();

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

  mainButton.onClick(async () => {
    const confession = confessionInput.value;
    const isValid = await validateConfession(confession);
    if (!isValid) return;

    try {
      await sendConfession(confession);

      // Update session state
      submissionCount++;
      lastSubmitTime = Date.now();

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