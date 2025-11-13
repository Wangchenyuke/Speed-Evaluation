// Literature data management using localStorage
const LiteratureData = {
  // Storage key
  STORAGE_KEY: 'speed_literature_data',

  // Default sample data
  defaultData: [
    {
      id: 1,
      title: "Test-Driven Development in Practice: A Controlled Experiment",
      author: "Johnson, A.; Lee, B.",
      year: 2024,
      practice: "TDD",
      conclusion: "Support",
      type: "Experiment",
      doi: "10.1000/example.2024.001",
      remark: "",
      submittedBy: null,
      submittedAt: null,
      status: "approved"
    },
    {
      id: 2,
      title: "The Impact of Pair Programming on Code Quality",
      author: "Martinez, C.; Patel, R.",
      year: 2022,
      practice: "Pair Programming",
      conclusion: "Support",
      type: "Case Study",
      doi: "10.1000/example.2022.002",
      remark: "",
      submittedBy: null,
      submittedAt: null,
      status: "approved"
    },
    {
      id: 3,
      title: "Continuous Integration Pitfalls in Large Enterprises",
      author: "Wang, X.; Smith, D.",
      year: 2021,
      practice: "Continuous Integration",
      conclusion: "Neutral",
      type: "Case Study",
      doi: "10.1000/example.2021.003",
      remark: "",
      submittedBy: null,
      submittedAt: null,
      status: "approved"
    },
    {
      id: 4,
      title: "Code Review Efficiency: A Systematic Review",
      author: "Nguyen, T.; Rossi, F.",
      year: 2020,
      practice: "Code Review",
      conclusion: "Oppose",
      type: "Review",
      doi: "10.1000/example.2020.004",
      remark: "",
      submittedBy: null,
      submittedAt: null,
      status: "approved"
    },
    {
      id: 5,
      title: "Tracking Defects: Empirical Insights",
      author: "Kim, Y.; Duarte, M.",
      year: 2019,
      practice: "Defect Tracking",
      conclusion: "Support",
      type: "Other",
      doi: "10.1000/example.2019.005",
      remark: "",
      submittedBy: null,
      submittedAt: null,
      status: "approved"
    },
    {
      id: 6,
      title: "Test-Driven Development and Team Productivity",
      author: "Garcia, L.; Chen, P.",
      year: 2023,
      practice: "TDD",
      conclusion: "Neutral",
      type: "Experiment",
      doi: "10.1000/example.2023.006",
      remark: "",
      submittedBy: null,
      submittedAt: null,
      status: "approved"
    }
  ],

  // Initialize data storage
  init() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      // Store default data with nextId counter
      const data = {
        items: this.defaultData,
        nextId: Math.max(...this.defaultData.map(item => item.id)) + 1
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }
  },

  // Get all literature items (approved only for public search)
  getAll(includePending = false) {
    this.init();
    const dataJson = localStorage.getItem(this.STORAGE_KEY);
    if (!dataJson) return [];
    
    const data = JSON.parse(dataJson);
    if (includePending) {
      return data.items;
    }
    // Return only approved items for public search
    return data.items.filter(item => item.status === 'approved');
  },

  // Get all items including pending (for admin view)
  getAllWithPending() {
    return this.getAll(true);
  },

  // Save all items
  saveAll(items, nextId) {
    const data = {
      items: items,
      nextId: nextId || this.getNextId()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },

  // Get next ID
  getNextId() {
    this.init();
    const dataJson = localStorage.getItem(this.STORAGE_KEY);
    if (!dataJson) return 1;
    const data = JSON.parse(dataJson);
    return data.nextId || 1;
  },

  // Increment and get next ID
  getAndIncrementNextId() {
    this.init();
    const dataJson = localStorage.getItem(this.STORAGE_KEY);
    let data = { items: this.defaultData, nextId: 1 };
    
    if (dataJson) {
      data = JSON.parse(dataJson);
    }
    
    const nextId = data.nextId || Math.max(...this.defaultData.map(item => item.id)) + 1;
    data.nextId = nextId + 1;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    
    return nextId;
  },

  // Add new literature item
  add(item) {
    this.init();
    const items = this.getAllWithPending();
    // Get current user if Auth is available
    let currentUser = null;
    if (typeof Auth !== 'undefined' && Auth.getCurrentUser) {
      currentUser = Auth.getCurrentUser();
    }
    
    const newItem = {
      id: this.getAndIncrementNextId(),
      title: item.title.trim(),
      author: item.author.trim(),
      year: parseInt(item.year, 10),
      practice: item.practice,
      conclusion: item.conclusion,
      type: item.type,
      doi: item.doi.trim(),
      remark: item.remark ? item.remark.trim() : "",
      submittedBy: currentUser ? currentUser.email : null,
      submittedAt: new Date().toISOString(),
      status: "submitted" // New submissions are pending review
    };

    items.push(newItem);
    this.saveAll(items);
    
    return {
      success: true,
      message: "Submission successful! Your literature is now visible in the search results.",
      item: newItem
    };
  },

  // Get pending (submitted) items
  getPending() {
    this.init();
    const dataJson = localStorage.getItem(this.STORAGE_KEY);
    if (!dataJson) return [];
    const data = JSON.parse(dataJson);
    return data.items.filter(item => item.status === 'submitted');
  },

  // Get pending count
  getPendingCount() {
    return this.getPending().length;
  },

  // Approve a submitted item by id
  approve(id, approver) {
    this.init();
    const dataJson = localStorage.getItem(this.STORAGE_KEY);
    if (!dataJson) return { success: false, message: 'No data' };
    const data = JSON.parse(dataJson);
    const idx = data.items.findIndex(it => it.id === Number(id));
    if (idx === -1) return { success: false, message: 'Item not found' };
    data.items[idx].status = 'approved';
    data.items[idx].approvedBy = approver || null;
    data.items[idx].approvedAt = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    return { success: true, item: data.items[idx] };
  },

  // Reject a submitted item by id with optional reason
  reject(id, reason, approver) {
    this.init();
    const dataJson = localStorage.getItem(this.STORAGE_KEY);
    if (!dataJson) return { success: false, message: 'No data' };
    const data = JSON.parse(dataJson);
    const idx = data.items.findIndex(it => it.id === Number(id));
    if (idx === -1) return { success: false, message: 'Item not found' };
    data.items[idx].status = 'rejected';
    data.items[idx].rejectedBy = approver || null;
    data.items[idx].rejectedAt = new Date().toISOString();
    data.items[idx].rejectReason = reason || '';
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    return { success: true, item: data.items[idx] };
  },

  // Check if DOI already exists
  doiExists(doi) {
    const items = this.getAllWithPending();
    return items.some(item => item.doi.toLowerCase() === doi.trim().toLowerCase());
  },

  // Search literature
  search(query, filters = {}) {
    let items = this.getAll(); // Only search approved items
    
    // Apply text search
    if (query && query.trim()) {
      const searchTerm = query.trim().toLowerCase();
      items = items.filter(item => {
        return (
          item.title.toLowerCase().includes(searchTerm) ||
          item.author.toLowerCase().includes(searchTerm) ||
          item.practice.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Apply year filter
    if (filters.yearRange && filters.yearRange !== "all") {
      const now = new Date();
      const years = parseInt(filters.yearRange, 10);
      items = items.filter(item => {
        return now.getFullYear() - item.year < years;
      });
    }

    // Apply conclusion filter
    if (filters.conclusions && filters.conclusions.size > 0) {
      items = items.filter(item => {
        return filters.conclusions.has(item.conclusion);
      });
    }

    // Apply research type filter
    if (filters.researchType && filters.researchType !== "all") {
      items = items.filter(item => {
        return item.type === filters.researchType;
      });
    }

    return items;
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  LiteratureData.init();
}

