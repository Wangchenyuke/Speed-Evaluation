// Authentication management using localStorage
const Auth = {
  // Storage keys
  STORAGE_KEY_USERS: 'speed_users',
  STORAGE_KEY_CURRENT_USER: 'speed_current_user',
  STORAGE_KEY_REVIEWERS: 'speed_reviewers',

  // Initialize users storage if it doesn't exist
  init() {
    if (!localStorage.getItem(this.STORAGE_KEY_USERS)) {
      localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify([]));
    }
    // Initialize reviewers list if missing (demo purposes)
    if (!localStorage.getItem(this.STORAGE_KEY_REVIEWERS)) {
      // default reviewer for demo
      localStorage.setItem(this.STORAGE_KEY_REVIEWERS, JSON.stringify(["admin@speed.local"]));
    }
  },

  // Get all registered users
  getUsers() {
    const usersJson = localStorage.getItem(this.STORAGE_KEY_USERS);
    return usersJson ? JSON.parse(usersJson) : [];
  },

  // Save users array
  saveUsers(users) {
    localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(users));
  },

  // Register a new user
  register(name, email, password) {
    this.init();
    const users = this.getUsers();

    // Check if email already exists
    if (users.find(user => user.email.toLowerCase() === email.toLowerCase())) {
      return {
        success: false,
        message: 'This email is already registered. Please use a different email or login.'
      };
    }

    // Create new user object
    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password, // In production, this should be hashed
      registeredAt: new Date().toISOString()
    };

    // Add user to storage
    users.push(newUser);
    this.saveUsers(users);

    return {
      success: true,
      message: 'Registration successful! Please login.',
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    };
  },

  // Login user
  login(email, password) {
    this.init();
    const users = this.getUsers();

    // Find user by email
    const user = users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      };
    }

    // Check password
    if (user.password !== password) {
      return {
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      };
    }

    // Set current user (store only non-sensitive data)
    const currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(this.STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));

    return {
      success: true,
      message: 'Login successful!',
      user: currentUser
    };
  },

  // Logout user
  logout() {
    localStorage.removeItem(this.STORAGE_KEY_CURRENT_USER);
    return {
      success: true,
      message: 'Logged out successfully.'
    };
  },

  // Get current logged in user
  getCurrentUser() {
    const userJson = localStorage.getItem(this.STORAGE_KEY_CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
  },

  // Check if user is logged in
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  // Update navigation based on login status
  updateNavigation() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    const currentUser = this.getCurrentUser();
    
    if (currentUser) {
      // User is logged in - show user info and logout button
      navActions.innerHTML = `
        <a class="btn-primary" href="submission.html">Submit Literature</a>
        <span style="color: #334e68; padding: 10px 16px; font-size: 14px;">
          Welcome, ${currentUser.name}
        </span>
        <a class="btn-ghost" id="adminLink" href="admin_review.html" style="display:none; margin-right:8px;">Review <span id="pendingBadge" style="background:#ff4d4f;color:#fff;border-radius:10px;padding:2px 6px;font-size:12px;margin-left:6px;display:none;">0</span></a>
        <button class="btn-ghost" onclick="Auth.handleLogout()">Logout</button>
      `;
      // If user is reviewer show admin link
      if (this.isReviewer()) {
        const adminLink = document.getElementById('adminLink');
        if (adminLink) adminLink.style.display = 'inline-block';
      }
    } else {
      // User is not logged in - show register and login buttons
      navActions.innerHTML = `
        <a class="btn-primary" href="submission.html">Submit Literature</a>
        <button class="btn-primary" onclick="navigate('register')">Register</button>
        <button class="btn-primary" onclick="navigate('login')">Login</button>
      `;
    }
    // Update pending badge if possible
    this.updatePendingBadge();
  },

  // Check whether current user is in reviewers list
  isReviewer() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;
    const reviewersJson = localStorage.getItem(this.STORAGE_KEY_REVIEWERS);
    if (!reviewersJson) return false;
    const reviewers = JSON.parse(reviewersJson);
    return reviewers.includes(currentUser.email.toLowerCase());
  },

  // Update pending badge display (attempts to read from LiteratureData)
  updatePendingBadge() {
    setTimeout(() => {
      try {
        if (this.isReviewer() && typeof LiteratureData !== 'undefined' && LiteratureData.getPendingCount) {
          const count = LiteratureData.getPendingCount();
          const badge = document.getElementById('pendingBadge');
          if (badge) {
            if (count > 0) {
              badge.textContent = String(count);
              badge.style.display = 'inline-block';
            } else {
              badge.style.display = 'none';
            }
          }
        }
      } catch (e) {
        // ignore if LiteratureData not available yet
      }
    }, 200);
  },

  // Handle logout
  handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      this.logout();
      this.updateNavigation();
      window.location.href = 'index.html';
    }
  }
};

// Initialize auth on page load
if (typeof window !== 'undefined') {
  Auth.init();
  
  // Update navigation when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      Auth.updateNavigation();
    });
  } else {
    Auth.updateNavigation();
  }
}
