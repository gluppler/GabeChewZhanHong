/**
 * HackTheBox Writeups Manager
 * Author: Gabe Chew Zhan Hong
 * Description: Manages writeup display and interaction with markdown files
 */

class WriteupsManager {
  constructor() {
    this.writeups = [];
    this.filteredWriteups = [];
    this.currentCategory = 'all';
    this.currentSearch = '';
    this.currentPage = 1;
    this.writeupsPerPage = 6;
    this.markdownCache = new Map();
    this.isLoading = false;
    
    // HackTheBox categories mapping
    this.categories = {
      'hardware': { name: 'Hardware', icon: 'HW', color: '#96ceb4' },
      'ai-ml': { name: 'AI/ML', icon: 'AI', color: '#ff6b6b' },
      'reversing': { name: 'Reversing', icon: 'REV', color: '#4ecdc4' },
      'pwn': { name: 'Pwn', icon: 'PWN', color: '#45b7d1' },
      'ics': { name: 'ICS', icon: 'ICS', color: '#feca57' },
      'secure-coding': { name: 'Secure Coding', icon: 'SEC', color: '#ff9ff3' },
      'mobile': { name: 'Mobile', icon: 'MOB', color: '#54a0ff' },
      'misc': { name: 'Misc', icon: 'MISC', color: '#5f27cd' },
      'osint': { name: 'OSINT', icon: 'OSINT', color: '#00d2d3' },
      'coding': { name: 'Coding', icon: 'CODE', color: '#ff9f43' },
      'blockchain': { name: 'Blockchain', icon: 'BC', color: '#10ac84' },
      'crypto': { name: 'Crypto', icon: 'CRYPTO', color: '#ee5a24' }
    };
    
    this.init();
  }

  async init() {
    this.bindEvents();
    this.showLoading(true);
    await this.loadWriteupsIndex();
    this.showLoading(false);
    this.initializeFilters();
    this.initializeSearch();
    this.initializeModal();
    this.applyFilters();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Filter buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
        this.handleFilterClick(e);
      }
    });

    // Search input with debouncing
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.handleSearch(e);
        }, 300);
      });
    }

    // Load more button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => this.loadMoreWriteups());
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape to close modal
      if (e.key === 'Escape') {
        this.closeModal();
      }
      
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    });
  }

  /**
   * Load writeups index from markdown files
   */
  async loadWriteupsIndex() {
    try {
      // Load from index.json file
      const response = await fetch('./writeups/index.json');
      if (!response.ok) {
        throw new Error(`Failed to load writeups index: ${response.status}`);
      }
    
      const data = await response.json();
      this.writeups = data.writeups || [];
      this.updateStats();
    } catch (error) {
      console.error('Failed to load writeups:', error);
      // Show error message to user
      this.showError('Failed to load writeups. Please try again later.');
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const grid = document.getElementById('writeups-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <h3 style="color: var(--color-accent); margin-bottom: 1rem;">Error Loading Writeups</h3>
          <p style="color: var(--color-text-secondary);">${message}</p>
        </div>
      `;
    }
  }

  /**
   * Initialize filter functionality
   */
  initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      if (btn.dataset.category === 'all') {
        btn.classList.add('active');
      }
    });
  }

  /**
   * Handle filter button clicks
   */
  handleFilterClick(e) {
    const button = e.target;
    const category = button.dataset.category;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    button.classList.add('active');

    // Update current category
    this.currentCategory = category;
    this.currentPage = 1;

    // Apply filters
    this.applyFilters();
  }

  /**
   * Initialize search functionality
   */
  initializeSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    // Animated placeholder
    const placeholders = [
      'Search writeups...',
      'Try "pwn", "crypto", "reversing"...',
      'Search by title or description...',
      'Filter by difficulty or tags...'
    ];
    
    let placeholderIndex = 0;
    setInterval(() => {
      placeholderIndex = (placeholderIndex + 1) % placeholders.length;
      searchInput.placeholder = placeholders[placeholderIndex];
    }, 3000);
  }

  /**
   * Handle search input
   */
  handleSearch(e) {
    this.currentSearch = e.target.value.toLowerCase().trim();
    this.currentPage = 1;
    this.applyFilters();
  }

  /**
   * Apply filters and search
   */
  applyFilters() {
    this.filteredWriteups = this.writeups.filter(writeup => {
      // Category filter
      const categoryMatch = this.currentCategory === 'all' || 
                           writeup.category === this.currentCategory;

      // Search filter
      const searchMatch = !this.currentSearch || 
                         writeup.title.toLowerCase().includes(this.currentSearch) ||
                         writeup.description.toLowerCase().includes(this.currentSearch) ||
                         writeup.category.toLowerCase().includes(this.currentSearch) ||
                         (writeup.tags && writeup.tags.some(tag => tag.toLowerCase().includes(this.currentSearch)));

      return categoryMatch && searchMatch;
    });

    this.renderWriteups();
    this.updateLoadMoreButton();
    this.showEmptyState(this.filteredWriteups.length === 0);
  }

  /**
   * Render writeups to the grid
   */
  renderWriteups() {
    const grid = document.getElementById('writeups-grid');
    if (!grid) return;

    // Clear existing cards
    grid.innerHTML = '';

    // Calculate writeups to show
    const endIndex = this.currentPage * this.writeupsPerPage;
    const writeupsToShow = this.filteredWriteups.slice(0, endIndex);

    // Render each writeup card
    writeupsToShow.forEach((writeup, index) => {
      const card = this.createWriteupCard(writeup, index);
      grid.appendChild(card);
    });

    // Trigger staggered animations
    setTimeout(() => {
      const cards = grid.querySelectorAll('.writeup-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('animate');
        }, index * 100);
      });
    }, 50);
  }

  /**
   * Create writeup card element
   */
  createWriteupCard(writeup, index) {
    const card = document.createElement('article');
    card.className = 'writeup-card animate-on-scroll scale-up';
    card.dataset.category = writeup.category;
    card.dataset.difficulty = writeup.difficulty;
    
    const categoryInfo = this.categories[writeup.category] || { 
      name: writeup.category, 
      icon: 'HTB', 
      color: '#ef4444' 
    };
    
    // Format difficulty for display
    const displayDifficulty = writeup.difficulty.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    card.innerHTML = `
      <div class="writeup-card__image" style="background: linear-gradient(135deg, ${categoryInfo.color}, #1a1a1a)">
        <div class="writeup-card__placeholder">${categoryInfo.icon}</div>
        <div class="writeup-card__difficulty">${displayDifficulty}</div>
        ${writeup.featured ? '<div class="writeup-card__featured">Featured</div>' : ''}
      </div>
      <div class="writeup-card__content">
        <div class="writeup-card__meta">
          <span class="writeup-card__platform">${writeup.platform}</span>
          <span class="writeup-card__date">${writeup.date}</span>
        </div>
        <h3 class="writeup-card__title">${writeup.title}</h3>
        <p class="writeup-card__description">${writeup.description}</p>
        <div class="writeup-card__tags">
          ${(writeup.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="writeup-card__actions">
          <button class="btn btn--outline" onclick="window.writeupsManager.openWriteup('${writeup.id}')">
            Read Writeup
          </button>
          ${writeup.htbUrl ? `<a href="${writeup.htbUrl}" target="_blank" class="btn btn--secondary btn--sm">HTB Link</a>` : ''}
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Load more writeups
   */
  loadMoreWriteups() {
    this.currentPage++;
    this.renderWriteups();
    this.updateLoadMoreButton();
  }

  /**
   * Update load more button visibility
   */
  updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadMoreSection = document.getElementById('load-more-section');
    const totalShown = this.currentPage * this.writeupsPerPage;
    
    if (loadMoreBtn && loadMoreSection) {
      if (totalShown >= this.filteredWriteups.length) {
        loadMoreSection.style.display = 'none';
      } else {
        loadMoreSection.style.display = 'block';
        const remaining = this.filteredWriteups.length - totalShown;
        const toShow = Math.min(this.writeupsPerPage, remaining);
        loadMoreBtn.textContent = `Load More (${toShow} more)`;
      }
    }
  }

  /**
   * Show/hide empty state
   */
  showEmptyState(show) {
    const emptyState = document.getElementById('empty-state');
    const loadMore = document.getElementById('load-more-section');
    
    if (emptyState) {
      emptyState.style.display = show ? 'block' : 'none';
    }
    
    if (loadMore) {
      loadMore.style.display = show ? 'none' : 'block';
    }
  }

  /**
   * Show/hide loading state
   */
  showLoading(show) {
    const loadingState = document.getElementById('loading-state');
    const writeupsGrid = document.getElementById('writeups-grid');
    
    if (loadingState) {
      loadingState.style.display = show ? 'block' : 'none';
    }
    
    if (writeupsGrid) {
      writeupsGrid.style.display = show ? 'none' : 'grid';
    }
    
    this.isLoading = show;
  }

  /**
   * Update statistics
   */
  updateStats() {
    const totalWriteupsEl = document.getElementById('total-writeups');
    if (totalWriteupsEl) {
      totalWriteupsEl.textContent = this.writeups.length;
    }
  }

  /**
   * Initialize modal functionality
   */
  initializeModal() {
    const modal = document.getElementById('writeup-modal');
    if (!modal) return;

    // Close modal when clicking backdrop
    const backdrop = modal.querySelector('.modal__backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeModal());
    }

    // Close modal with close button
    const closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }
  }

  /**
   * Open writeup modal and load markdown content
   */
  async openWriteup(writeupId) {
    const writeup = this.writeups.find(w => w.id === writeupId);
    if (!writeup) return;

    const modal = document.getElementById('writeup-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    if (!modal || !modalTitle || !modalBody) return;

    // Update modal title
    modalTitle.textContent = writeup.title;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Show loading state
    modalBody.innerHTML = `
      <div class="writeup-loading">
        <div class="loading-spinner"></div>
        <p>Loading writeup content...</p>
      </div>
    `;

    try {
      // Construct the correct path to the markdown file
      const markdownPath = `./writeups/${writeup.markdownFile}`;
      
      console.log(`Loading writeup from: ${markdownPath}`);
      
      const content = await this.loadMarkdownContent(markdownPath);
      const htmlContent = this.markdownToHtml(content);
      
      modalBody.innerHTML = `
        <div class="writeup-content">
          <div class="writeup-meta">
            <span class="writeup-category">${this.categories[writeup.category]?.name || writeup.category}</span>
            <span class="writeup-difficulty">${writeup.difficulty.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            <span class="writeup-date">${writeup.date}</span>
            ${writeup.htbUrl ? `<a href="${writeup.htbUrl}" target="_blank" class="writeup-htb-link">View on HackTheBox</a>` : ''}
          </div>
          <div class="writeup-markdown-content">
            ${htmlContent}
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Failed to load writeup content:', error);
      modalBody.innerHTML = `
        <div class="writeup-error">
          <h3>Content Not Available</h3>
          <p>This writeup is currently being prepared or there was an error loading the content.</p>
          <p><strong>Challenge:</strong> ${writeup.title}</p>
          <p><strong>Category:</strong> ${this.categories[writeup.category]?.name || writeup.category}</p>
          <p><strong>Error:</strong> ${error.message}</p>
          ${writeup.htbUrl ? `<a href="${writeup.htbUrl}" target="_blank" class="btn btn--primary">View Challenge on HackTheBox</a>` : ''}
        </div>
      `;
    }

    // Focus trap for accessibility
    modal.focus();
  }

  /**
   * Load markdown content from file
   */
  async loadMarkdownContent(filepath) {
    // Check cache first
    if (this.markdownCache.has(filepath)) {
      return this.markdownCache.get(filepath);
    }

    try {
      console.log(`Fetching content from: ${filepath}`);
      const response = await fetch(filepath);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const content = await response.text();
      
      if (!content.trim()) {
        throw new Error('Empty file content');
      }
      
      this.markdownCache.set(filepath, content);
      return content;
    } catch (error) {
      console.error(`Failed to load ${filepath}:`, error);
      throw new Error(`Failed to load writeup: ${error.message}`);
    }
  }

  /**
   * Close writeup modal
   */
  closeModal() {
    const modal = document.getElementById('writeup-modal');
    if (modal && modal.classList.contains('active')) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  /**
   * Convert markdown to HTML using the Marked.js library
   */
  markdownToHtml(markdown) {
    if (typeof marked === 'undefined') {
      console.error('Marked.js library is not loaded.');
      return '<p>Error: Markdown parser not available.</p>';
    }
    
    if (!markdown || !markdown.trim()) {
      return '<p>No content available.</p>';
    }

    try {
      // Configure marked with options
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false
      });

      // Remove frontmatter if present
      const contentWithoutFrontmatter = markdown.replace(/^---[\s\S]*?---\n?/, '').trim();
      
      // Parse markdown to HTML
      const html = marked.parse(contentWithoutFrontmatter);
      
      return html;
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return `<p>Error parsing content: ${error.message}</p>`;
    }
  }

  /**
   * Clear all filters and search
   */
  clearFilters() {
    // Reset filters
    this.currentCategory = 'all';
    this.currentSearch = '';
    this.currentPage = 1;

    // Reset UI
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.category === 'all') {
        btn.classList.add('active');
      }
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = '';
    }

    // Apply filters
    this.applyFilters();
  }
}

// Global functions for onclick handlers
window.openWriteup = function(id) {
  if (window.writeupsManager) {
    window.writeupsManager.openWriteup(id);
  }
};

window.closeWriteupModal = function() {
  if (window.writeupsManager) {
    window.writeupsManager.closeModal();
  }
};

window.clearFilters = function() {
  if (window.writeupsManager) {
    window.writeupsManager.clearFilters();
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.writeupsManager = new WriteupsManager();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WriteupsManager;
}