// CoinCritters State Management
class CoinCritters {
  // Pass the supabase client and user object during initialization
  constructor(supabase, user) {
    this.supabase = supabase;
    this.user = user;
    this.data = {}; // Data will be loaded from the database
    this.petNames = { 
      cat: 'Whiskers the Cat', 
      turtle: 'Tortino The Turtle', 
      fox: 'Foxy', 
      axolotl: 'Axy' 
    };
  }

  // REPLACED: loadData now fetches from Supabase
  async loadData() {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', this.user.id)
      .single(); // .single() gets one row, or null if it doesn't exist

    if (error && error.code !== 'PGRST116') { // Ignore "row not found" error
      console.error("Error loading profile:", error);
    } else if (data) {
      this.data = data;
    }
    return data; // Return the loaded data
  }

  // REPLACED: updateData now saves to Supabase using upsert
  async updateData(newData) {
    this.data = { ...this.data, ...newData };
    
    const profileData = {
      id: this.user.id, // The user's ID is the primary key
      selected_pet: this.data.selectedPet,
      monthly_goal: this.data.monthlyGoal,
      daily_budget: this.data.dailyBudget,
      updated_at: new Date()
    };

    const { error } = await this.supabase
      .from('profiles')
      .upsert(profileData);

    if (error) {
      console.error("Error saving profile data:", error);
    }
  }

  isComplete() {
    return this.data.selected_pet && this.data.monthly_goal && this.data.daily_budget;
  }
  
  // The rest of your class methods (init, navigate, initPetSelection, etc.)
  // can remain mostly the same, as they call the new async updateData method.
  // The logic inside them doesn't need to change.
  
  // ... (Paste the rest of your CoinCritters class methods here, unchanged) ...
  // For example:
  getCurrentPage() {
    // ... same as before
  }
  navigate(page) {
    // ... same as before
  }
  initPetSelection() {
    // ... same as before
  }
  // ... etc. ...
  
  // UPDATED: initProfile now uses the data loaded from the DB
  initProfile() {
    if (!this.isComplete()) {
      // If setup is not complete, send them to the first step
      this.navigate('pet-selection');
      return;
    }
    
    // ... The rest of your initProfile function ...
    // Make sure it reads from this.data.selected_pet, etc.
  }
}


// --- MAJOR CHANGE: HOW THE SCRIPT IS INITIALIZED ---
document.addEventListener('DOMContentLoaded', () => {
  const SUPABASE_URL = 'https://vmeihwydhvvtjcmjwxzn.supabase.co';
  const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Use onAuthStateChange to get the user, THEN initialize the app
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (session && session.user) {
      // User is logged in. Initialize the app with their details.
      const app = new CoinCritters(supabaseClient, session.user);
      await app.loadData(); // Load their profile from the database
      app.init(); // Run the logic for the current page
      
      window.coinCritters = app; // Make it accessible globally if needed

    } else {
      // User is not logged in.
      const protectedPages = ['/profile', '/monthly-goal', '/daily-budget', '/select-pet'];
      if (protectedPages.includes(window.location.pathname)) {
        window.location.href = '/'; // Redirect to login if on a protected page
      }
    }
  });
});
