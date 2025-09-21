// CoinCritters State Management
class CoinCritters {
  constructor() {
    this.data = this.loadData();
    this.init();
  }

  loadData() {
    const saved = localStorage.getItem('coincritters-data');
    return saved ? JSON.parse(saved) : {
      selectedPet: null,
      monthlyGoal: null,
      dailyBudget: null
    };
  }

  saveData() {
    localStorage.setItem('coincritters-data', JSON.stringify(this.data));
  }

  updateData(newData) {
    this.data = { ...this.data, ...newData };
    this.saveData();
  }

  isComplete() {
    return this.data.selectedPet && this.data.monthlyGoal && this.data.dailyBudget;
  }

  init() {
    // Initialize based on current page
    const page = this.getCurrentPage();
    
    if (page === 'pet-selection') {
      this.initPetSelection();
    } else if (page === 'monthly-goal') {
      this.initMonthlyGoal();
    } else if (page === 'daily-budget') {
      this.initDailyBudget();
    } else if (page === 'profile') {
      this.initProfile();
    }

    // If on pet-selection page, wire the continue button (keeps this scope)
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        if (this.data.selectedPet) {
          this.navigate('monthly-goal');
        }
      });
    }

    // Update progress (default to step 1 of 3 unless pages override)
    this.updateProgress(1, 3);
  }

  updateContinueButton() {
    const continueBtn = document.getElementById('continue-btn');
    const petNames = { cat: 'Whiskers', dog: 'Buddy', cow: 'Moobert', pig: 'Pinky' };
    
    if (continueBtn) {
      if (this.data.selectedPet) {
        continueBtn.disabled = false;
        continueBtn.textContent = `Continue with ${petNames[this.data.selectedPet]}`;
      } else {
        continueBtn.disabled = true;
        continueBtn.textContent = 'Continue with Pet';
      }
    }
  }

  // Monthly Goal Page
  initMonthlyGoal() {
    const goalInput = document.getElementById('monthly-goal');
    const form = document.getElementById('goal-form');
    const errorEl = document.getElementById('error');

    if (goalInput && this.data.monthlyGoal) {
      goalInput.value = this.data.monthlyGoal;
    }

    // Quick amount buttons
    document.querySelectorAll('[data-amount]').forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = btn.getAttribute('data-amount');
        if (goalInput) {
          goalInput.value = amount;
          errorEl.textContent = '';
        }
      });
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const goalAmount = parseFloat(goalInput.value);
        
        if (!goalAmount || goalAmount <= 0) {
          errorEl.textContent = 'Please enter a valid amount';
          return;
        }
        
        if (goalAmount > 10000) {
          errorEl.textContent = "That's quite ambitious! Try a smaller goal to start";
          return;
        }

        this.updateData({ monthlyGoal: goalAmount });
        this.navigate('daily-budget');
      });
    }

    if (goalInput) {
      goalInput.addEventListener('input', () => {
        errorEl.textContent = '';
      });
    }

    this.updateProgress(2, 3);
  }

  // Daily Budget Page
  initDailyBudget() {
    const budgetInput = document.getElementById('daily-budget');
    const form = document.getElementById('budget-form');
    const errorEl = document.getElementById('error');
    const suggestionEl = document.getElementById('suggestion');

    const suggestedBudget = this.data.monthlyGoal ? Math.round((this.data.monthlyGoal / 30) * 10) / 10 : 0;
    
    if (budgetInput && this.data.dailyBudget) {
      budgetInput.value = this.data.dailyBudget;
    }

    if (suggestionEl && suggestedBudget > 0) {
      suggestionEl.textContent = `Based on your ₹${this.data.monthlyGoal}/month goal, we suggest ₹${suggestedBudget}/day`;
    }

    // Quick amount buttons
    const amounts = [10, 25, 50, suggestedBudget].filter(a => a > 0);
    const buttonContainer = document.getElementById('amount-buttons');
    if (buttonContainer) {
      buttonContainer.innerHTML = '';
      amounts.forEach(amount => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-outline btn-sm';
        btn.textContent = `₹${amount}`;
        btn.addEventListener('click', () => {
          if (budgetInput) {
            budgetInput.value = amount;
            errorEl.textContent = '';
          }
        });
        buttonContainer.appendChild(btn);
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const budgetAmount = parseFloat(budgetInput.value);
        
        if (!budgetAmount || budgetAmount <= 0) {
          errorEl.textContent = 'Please enter a valid amount';
          return;
        }
        
        if (budgetAmount > 500) {
          errorEl.textContent = "That's quite a lot for daily spending! Consider a smaller budget";
          return;
        }

        this.updateData({ dailyBudget: budgetAmount });
        this.navigate('profile');
      });
    }

    if (budgetInput) {
      budgetInput.addEventListener('input', () => {
        errorEl.textContent = '';
      });
    }

    this.updateProgress(3, 3);
  }

  // Profile Page
  initProfile() {
    if (!this.isComplete()) {
        this.navigate('pet-selection');
        return;
    }

    // Pet data
    const petNames = { cat: 'Whiskers', dog: 'Buddy', cow: 'Moobert', pig: 'Pinky' };
    const petTypes = { cat: 'cat', dog: 'dog', cow: 'cow', pig: 'pig' };
    const petImages = { 
        cat: 'cat-pet.jpg', 
        dog: 'dog-pet.jpg', 
        cow: 'cow-pet.jpg', 
        pig: 'pig-pet.jpg' 
    };

    // Update pet info
    const petImg = document.getElementById('pet-image');
    const petName = document.getElementById('pet-name');
    const petType = document.getElementById('pet-type');

    if (petImg && this.data.selectedPet) {
        petImg.src = `/static/${petImages[this.data.selectedPet]}`;
        petImg.alt = `Your ${petTypes[this.data.selectedPet]} companion`;
    }
    if (petName && this.data.selectedPet) {
        petName.textContent = petNames[this.data.selectedPet];
    }
    if (petType && this.data.selectedPet) {
        petType.textContent = `Your ${petTypes[this.data.selectedPet]} companion`;
    }

    // Update goal and budget
    const monthlyGoalEl = document.getElementById('monthly-goal-amount');
    const dailyBudgetEl = document.getElementById('daily-budget-amount');

    if (monthlyGoalEl) monthlyGoalEl.textContent = `₹${this.data.monthlyGoal}`;
    if (dailyBudgetEl) dailyBudgetEl.textContent = `₹${this.data.dailyBudget}`;

    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            this.navigate('pet-selection');
        });
    }
  }

  updateProgress(current, total) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar) {
      const percentage = (current / total) * 100;
      progressBar.style.width = `${percentage}%`;
    }
    
    if (progressText) {
      progressText.textContent = `Step ${current} of ${total}`;
    }
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.coinCritters = new CoinCritters();
});

/* Modular Spin Wheel Implementation */
;(function(global){
  // default sectors (accessories)
  const DEFAULT_SECTORS = [
    { label: 'Bow', name: 'bow' },
    { label: 'Hat', name: 'hat' },
    { label: 'Sun', name: 'sun' },
    { label: 'Sunglasses', name: 'sunglasses' }
  ];

  function renderLabels(wheelEl, sectors){
    // remove existing labels container
    let labelsWrap = wheelEl.querySelector('.wheel-labels');
    if (labelsWrap) labelsWrap.remove();
    labelsWrap = document.createElement('div');
    labelsWrap.className = 'wheel-labels';
    wheelEl.appendChild(labelsWrap);

    const slice = 360 / sectors.length;
    const size = wheelEl.clientWidth || parseInt(getComputedStyle(wheelEl).getPropertyValue('--size')) || 320;
    const radius = size / 2;
    const distance = Math.round(radius * 0.48);

    sectors.forEach((s, i) => {
      const angle = (i * slice) + (slice / 2);
      const label = document.createElement('div');
      label.className = 'wheel-label';
      label.style.left = '50%';
      label.style.top = '50%';
      label.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-${distance}px)`;

      const span = document.createElement('span');
      span.textContent = s.label;
      label.appendChild(span);
      labelsWrap.appendChild(label);
    });
  }

  function initWheel(config = {}){
    const wheelId = config.wheelId || 'wheel';
    const spinBtnId = config.spinBtnId || 'spin-btn';
    const resultId = config.resultId || 'wheel-result';
    const sectors = config.sectors || DEFAULT_SECTORS;

    const wheel = document.getElementById(wheelId);
    const spinBtn = document.getElementById(spinBtnId);
    const resultEl = document.getElementById(resultId);
    if (!wheel || !spinBtn || !resultEl) return null;

    renderLabels(wheel, sectors);

    let spinning = false;

    function pickSector(){
      return Math.floor(Math.random() * sectors.length);
    }

    function displayResultSector(sector){
      resultEl.innerHTML = '';
      const title = document.createElement('div');
      title.textContent = `You won: ${sector.label}`;
      title.className = 'font-bold mb-2';
      const img = document.createElement('img');
      img.src = `/static/accessories/${sector.name}`;
      img.alt = sector.label;
      img.style.width = '120px';
      img.style.display = 'block';
      img.style.margin = '8px auto 0';
      resultEl.appendChild(title);
      resultEl.appendChild(img);
    }

    function spinTo(index){
      const sectorsCount = sectors.length;
      const degreesPerSector = 360 / sectorsCount;
      const fullSpins = 5;
      const target = fullSpins * 360 + index * degreesPerSector + degreesPerSector / 2;
      wheel.style.transition = 'transform 4s cubic-bezier(0.33, 1, 0.68, 1)';
      wheel.style.transform = `rotate(${target}deg)`;
      setTimeout(() => {
        displayResultSector(sectors[index]);
        spinning = false;
        spinBtn.disabled = false;
      }, 4200);
    }

    // wire button
    spinBtn.addEventListener('click', () => {
      if (spinning) return;
      spinning = true;
      spinBtn.disabled = true;
      resultEl.textContent = '';
      const idx = pickSector();
      spinTo(idx);
    });

    // expose a simple API
    return { wheel, spinBtn, resultEl, renderLabels: () => renderLabels(wheel, sectors) };
  }

  // expose globally
  global.initWheel = initWheel;
  global.wheelSectors = DEFAULT_SECTORS;

  // Auto-init on shop page if elements exist
  document.addEventListener('DOMContentLoaded', () => {
    initWheel();
  });
})(window);