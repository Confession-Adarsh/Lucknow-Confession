// Generate city silhouette with buildings and windows
    function generateCity() {
      const container = document.getElementById('citySilhouette');
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
    
    // Generate stars
    function generateStars() {
      const container = document.getElementById('stars');
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
    
    // Initialize on load
    window.addEventListener('load', () => {
      generateCity();
      generateStars();
    });
    
    // Wait for Telegram WebApp to be ready
    Telegram.WebApp.ready();
    
    // DOM Elements
    const confessionInput = document.getElementById('confessionInput');
    const charCountEl = document.getElementById('charCount');
    const progressBar = document.getElementById('progressBar');
    const submitButton = document.getElementById('submitButton');
    const confessionCard = document.getElementById('confessionCard');
    
    const MAX_CHARS = 1000;
    
    // Character counter logic
    confessionInput.addEventListener('input', () => {
      const text = confessionInput.value;
      const length = text.length;
      
      // Update counter
      charCountEl.textContent = length;
      
      // Update progress bar
      const progress = Math.min(100, (length / MAX_CHARS) * 100);
      progressBar.style.width = `${progress}%`;
      
      // Enforce max length
      if (length > MAX_CHARS) {
        confessionInput.value = text.slice(0, MAX_CHARS);
        charCountEl.textContent = MAX_CHARS;
        progressBar.style.width = '100%';
      }
      
      // Show/hide submit button based on input
      if (length > 0 && length <= MAX_CHARS) {
        submitButton.classList.add('show');
        confessionCard.classList.add('active');
      } else {
        submitButton.classList.remove('show');
        confessionCard.classList.remove('active');
      }
    });
    
    // Handle submit button click
    submitButton.addEventListener('click', () => {
      const confession = confessionInput.value.trim();
      
      if (!confession) return;
      
      // Simulate sending to backend
      sendConfession(confession)
        .then(() => {
          Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          Telegram.WebApp.showAlert('Your confession has been shared anonymously.');
          
          // Reset UI
          confessionInput.value = '';
          charCountEl.textContent = '0';
          progressBar.style.width = '0%';
          submitButton.classList.remove('show');
          confessionCard.classList.remove('active');
        })
        .catch((error) => {
          Telegram.WebApp.HapticFeedback.notificationOccurred('error');
          Telegram.WebApp.showAlert('Failed to send. Please try again.');
          console.error('Send error:', error);
        });
    });
    
    // Mock backend function
    async function sendConfession(text) {
      // Replace this with real fetch() in production
      return new Promise((resolve) => setTimeout(resolve, 800));
    }
    
    // Add subtle hover effect to textarea
    confessionInput.addEventListener('focus', () => {
      confessionCard.style.transform = 'translateY(-5px)';
    });
    
    confessionInput.addEventListener('blur', () => {
      confessionCard.style.transform = 'translateY(0)';
    });