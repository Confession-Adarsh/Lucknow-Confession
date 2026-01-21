// ====== FIREBASE CONFIG (TOP OF FILE) ======
const firebaseConfig = {
  apiKey: "AIzaSyCRbvL-ukbI3F7et2eWzCYQ4lZ6d-u6WWc",
  authDomain: "confess-tg.firebaseapp.com",
  databaseURL: "https://confess-tg-default-rtdb.firebaseio.com/", // No spaces!
  projectId: "confess-tg",
  storageBucket: "confess-tg.firebasestorage.app",
  messagingSenderId: "360800512759",
  appId: "1:360800512759:web:53ffce65d5f910da1d41f2"
};

// Initialize Firebase (compat mode)
firebase.initializeApp(firebaseConfig);
// ==========================================

// ====== ANIMATION FUNCTIONS ======
function generateCity() {
  const container = document.getElementById('citySilhouette');
  if (!container) return;
  
  const width = container.offsetWidth;
  const buildingCount = Math.floor(width / 40);
  
  for (let i = 0; i < buildingCount; i++) {
    const building = document.createElement('div');
    building.className = 'building';
    
    const height = 80 + Math.random() * 120;
    const left = i * 40;
    
    building.style.height = `${height}px`;
    building.style.left = `${left}px`;
    
    // Add windows
    const windowCount = Math.floor(height / 20);
    for (let j = 0; j < windowCount; j++) {
      const window = document.createElement('div');
      window.className = 'window';
      
      const winWidth = 8 + Math.random() * 6;
      const winHeight = 8 + Math.random() * 6;
      const winLeft = 8 + Math.random() * 16;
      const winTop = 10 + j * 20;
      
      window.style.width = `${winWidth}px`;
      window.style.height = `${winHeight}px`;
      window.style.left = `${winLeft}px`;
      window.style.top = `${winTop}px`;
      window.style.animationDelay = `${Math.random() * 5}s`;
      
      building.appendChild(window);
    }
    
    container.appendChild(building);
  }
}

function generateStars() {
  const container = document.getElementById('stars');
  if (!container) return;
  
  const starCount = 150;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    const size = Math.random() * 3;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const duration = 2 + Math.random() * 8;
    const delay = Math.random() * 5;
    
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${posX}%`;
    star.style.top = `${posY}%`;
    star.style.setProperty('--duration', `${duration}s`);
    star.style.animationDelay = `${delay}s`;
    
    container.appendChild(star);
  }
}
// ================================

// ====== CONFESSION LOGIC ======
function initConfessionApp() {
  // Telegram setup
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
  
  const confessionInput = document.getElementById('confessionInput');
  const charCountEl = document.getElementById('charCount');
  const progressBar = document.getElementById('progressBar');
  
  if (!confessionInput || !charCountEl) return;
  
  const mainButton = Telegram.WebApp.MainButton;
  mainButton.setText('Submit Confession');
  mainButton.hide();
  
  const MAX_CHARS = 1000;
  
  confessionInput.addEventListener('input', () => {
    const text = confessionInput.value;
    const length = text.length;
    
    charCountEl.textContent = length;
    const progress = Math.min(100, (length / MAX_CHARS) * 100);
    if (progressBar) progressBar.style.width = `${progress}%`;
    
    if (length > MAX_CHARS) {
      confessionInput.value = text.slice(0, MAX_CHARS);
      charCountEl.textContent = MAX_CHARS;
      if (progressBar) progressBar.style.width = '100%';
    }
    
    if (length > 0 && length <= MAX_CHARS) {
      mainButton.show();
    } else {
      mainButton.hide();
    }
  });
  
  // Firebase save function
async function sendConfession(text) {
  try {
    const db = firebase.database();
    const newRef = db.ref('confessions').push();

    // Get user data from Telegram
    const user = Telegram.WebApp.initDataUnsafe?.user;
    const userId = user?.id;          // e.g., 123456789 (number)
    const username = user?.username;  // e.g., "john_doe" (string, may be undefined)

    await newRef.set({
      text: text,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      // ⚠️ Only add these if you accept the risks:
      tg_user_id: userId,
      tg_username: username // Could be null!
    });
  } catch (error) {
    console.error("Save failed:", error);
    throw error;
  }
}
  
  mainButton.onClick(() => {
    const confession = confessionInput.value.trim();
    if (!confession) return;
    
    sendConfession(confession)
      .then(() => {
        Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        Telegram.WebApp.showAlert('Your secret is safe with the city 🌃');
        confessionInput.value = '';
        charCountEl.textContent = '0';
        if (progressBar) progressBar.style.width = '0%';
        mainButton.hide();
      })
      .catch(() => {
        Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        Telegram.WebApp.showAlert('Failed to send. Try again.');
      });
  });
}
// ==============================

// ====== START EVERYTHING ON LOAD ======
window.addEventListener('load', () => {
  generateCity();
  generateStars();
  initConfessionApp();
});
// =====================================