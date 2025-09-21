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
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path === '/monthly-goal') return 'monthly-goal';
    if (path === '/daily-budget') return 'daily-budget';
    if (path === '/profile') return 'profile';
    return 'pet-selection';
  }

  navigate(page) {
    const pages = {
      'pet-selection': '/',
      'monthly-goal': '/monthly-goal',
      'daily-budget': '/daily-budget',
      'profile': '/profile'
    };
    window.location.href = pages[page];
  }

  // Pet Selection Page
  initPetSelection() {
    const pets = ['cat', 'dog', 'cow', 'pig'];
    const petNames = { cat: 'Whiskers', dog: 'Buddy', cow: 'Moobert', pig: 'Pinky' };
    
    pets.forEach(pet => {
      const card = document.querySelector(`[data-pet="${pet}"]`);
      if (card) {
        if (this.data.selectedPet === pet) {
          card.classList.add('selected');
        }
        
        card.addEventListener('click', () => {
          // Remove selected from all cards
          document.querySelectorAll('.pet-card').forEach(c => c.classList.remove('selected'));
          // Add selected to clicked card
          card.classList.add('selected');
          // Update data
          this.updateData({ selectedPet: pet });
          // Update continue button
          this.updateContinueButton();
        });
      }
    });

    this.updateContinueButton();
    
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        if (this.data.selectedPet) {
          this.navigate('monthly-goal');
        }
      });
    }

    // Update progress
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
      suggestionEl.textContent = `Based on your $${this.data.monthlyGoal}/month goal, we suggest $${suggestedBudget}/day`;
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
        btn.textContent = `$${amount}`;
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

    const petNames = { cat: 'Whiskers', dog: 'Buddy', cow: 'Moobert', pig: 'Pinky' };
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

    if (petImg) petImg.src = petImages[this.data.selectedPet];
    if (petName) petName.textContent = petNames[this.data.selectedPet];
    if (petType) petType.textContent = `Your ${this.data.selectedPet} companion`;

    // Update goal and budget
    const monthlyGoalEl = document.getElementById('monthly-goal-amount');
    const dailyBudgetEl = document.getElementById('daily-budget-amount');

    if (monthlyGoalEl) monthlyGoalEl.textContent = `$${this.data.monthlyGoal}`;
    if (dailyBudgetEl) dailyBudgetEl.textContent = `$${this.data.dailyBudget}`;

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