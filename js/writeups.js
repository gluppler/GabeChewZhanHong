/**
 * HackTheBox Writeups Manager - Enhanced Version
 * Author: Gabe Chew Zhan Hong
 * Description: Manages writeup display with improved error handling and functionality
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
    
    // HackTheBox categories mapping with updated colors
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
    try {
      this.bindEvents();
      this.showLoading(true);
      
      // Load marked.js library if not already loaded
      await this.loadMarkedLibrary();
      
      // Load writeups data
      await this.loadWriteupsIndex();
      
      this.showLoading(false);
      this.initializeFilters();
      this.initializeSearch();
      this.initializeModal();
      this.applyFilters();
    } catch (error) {
      console.error('Failed to initialize writeups:', error);
      this.showError('Failed to initialize writeups. Please refresh the page.');
      this.showLoading(false);
    }
  }

  /**
   * Load marked.js library dynamically
   */
  async loadMarkedLibrary() {
    if (typeof marked !== 'undefined') {
      console.log('Marked.js already loaded');
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
      script.async = true;
      script.onload = () => {
        console.log('Marked.js loaded successfully');
        // Configure marked
        if (typeof marked !== 'undefined') {
          marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: true,
            mangle: false,
            highlight: function(code, lang) {
              // Basic syntax highlighting
              return code;
            }
          });
        }
        resolve();
      };
      script.onerror = () => {
        console.error('Failed to load marked.js');
        reject(new Error('Failed to load markdown parser'));
      };
      document.head.appendChild(script);
    });
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
      if (e.key === 'Escape') {
        this.closeModal();
      }
      
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
   * Load writeups index from JSON file
   */
  async loadWriteupsIndex() {
    try {
      // Try multiple paths to ensure we find the file
      const possiblePaths = [
        './writeups/index.json',
        '/writeups/index.json',
        'writeups/index.json'
      ];
      
      let data = null;
      let successPath = null;
      
      for (const path of possiblePaths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            data = await response.json();
            successPath = path;
            break;
          }
        } catch (e) {
          console.log(`Failed to load from ${path}, trying next...`);
        }
      }
      
      if (!data) {
        throw new Error('Could not load writeups index from any path');
      }
      
      console.log(`Successfully loaded writeups from ${successPath}`);
      this.writeups = data.writeups || [];
      
      // Sort by date (newest first)
      this.writeups.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      this.updateStats();
      console.log(`Loaded ${this.writeups.length} writeups`);
    } catch (error) {
      console.error('Failed to load writeups:', error);
      // Use fallback data if loading fails
      this.loadFallbackData();
    }
  }

  /**
   * Load fallback data when JSON fails to load
   */
  loadFallbackData() {
    console.log('Loading fallback writeup data');
    this.writeups = [
      {
        id: 'htb-824',
        title: 'Low Logic Challenge - HTB 824',
        description: 'Solution walkthrough for HackTheBox challenge 824 involving digital logic and boolean operations.',
        category: 'hardware',
        platform: 'HackTheBox',
        difficulty: 'very-easy',
        date: '2025-08-23',
        tags: ['HackTheBox', 'Hardware', 'Logic Gates'],
        featured: false,
        markdownFile: 'htb-824.md',
        htbUrl: 'https://labs.hackthebox.com/achievement/challenge/2141842/824',
        readTime: '5 min'
      }
    ];
    this.updateStats();
  }

  /**
   * Show error message
   */
  showError(message) {
    const grid = document.getElementById('writeups-grid');
    if (grid) {
      grid.innerHTML = `
        <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <h3 style="color: var(--color-accent); margin-bottom: 1rem;">⚠️ Error</h3>
          <p style="color: var(--color-text-secondary);">${message}</p>
          <button class="btn btn--primary" style="margin-top: 1rem;" onclick="location.reload()">
            Reload Page
          </button>
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
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  /**
   * Handle filter button clicks
   */
  handleFilterClick(e) {
    const button = e.target;
    const category = button.dataset.category;

    // Update active button and ARIA states
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');

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
      'Search by title or tags...',
      'Find by difficulty level...'
    ];
    
    let placeholderIndex = 0;
    setInterval(() => {
      placeholderIndex = (placeholderIndex + 1) % placeholders.length;
      searchInput.setAttribute('placeholder', placeholders[placeholderIndex]);
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
                         writeup.difficulty.toLowerCase().includes(this.currentSearch) ||
                         (writeup.tags && writeup.tags.some(tag => 
                           tag.toLowerCase().includes(this.currentSearch)));

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

    if (writeupsToShow.length === 0 && this.filteredWriteups.length === 0) {
      return; // Empty state will be shown
    }

    // Render each writeup card
    writeupsToShow.forEach((writeup, index) => {
      const card = this.createWriteupCard(writeup, index);
      grid.appendChild(card);
    });

    // Trigger staggered animations
    requestAnimationFrame(() => {
      const cards = grid.querySelectorAll('.writeup-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('animate');
        }, index * 50);
      });
    });
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
    
    // Format date
    const formattedDate = new Date(writeup.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    card.innerHTML = `
      <div class="writeup-card__image" style="background: linear-gradient(135deg, ${categoryInfo.color}, #1a1a1a)">
        <div class="writeup-card__placeholder">${categoryInfo.icon}</div>
        <div class="writeup-card__difficulty">${displayDifficulty}</div>
        ${writeup.featured ? '<div class="writeup-card__featured">Featured</div>' : ''}
        ${writeup.readTime ? `<div class="writeup-card__readtime">${writeup.readTime}</div>` : ''}
      </div>
      <div class="writeup-card__content">
        <div class="writeup-card__meta">
          <span class="writeup-card__platform">${writeup.platform}</span>
          <span class="writeup-card__date">${formattedDate}</span>
        </div>
        <h3 class="writeup-card__title">${this.escapeHtml(writeup.title)}</h3>
        <p class="writeup-card__description">${this.escapeHtml(writeup.description)}</p>
        <div class="writeup-card__tags">
          ${(writeup.tags || []).map(tag => 
            `<span class="tag">${this.escapeHtml(tag)}</span>`
          ).join('')}
        </div>
        <div class="writeup-card__actions">
          <button class="btn btn--outline" onclick="window.writeupsManager.openWriteup('${writeup.id}')">
            Read Writeup
          </button>
          ${writeup.htbUrl ? `
            <a href="${writeup.htbUrl}" target="_blank" rel="noopener" class="btn btn--secondary btn--sm">
              View on HTB
            </a>
          ` : ''}
        </div>
      </div>
    `;

    // Add CSS variable for stagger animation
    card.style.setProperty('--index', index);

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
        loadMoreBtn.textContent = `Load More (${toShow} of ${remaining} remaining)`;
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
    
    if (loadMore && show) {
      loadMore.style.display = 'none';
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
      // Animate the number
      this.animateNumber(totalWriteupsEl, 0, this.writeups.length, 1000);
    }
  }

  /**
   * Animate number counting
   */
  animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const updateNumber = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };
    requestAnimationFrame(updateNumber);
  }

  /**
   * Initialize modal functionality
   */
  initializeModal() {
    const modal = document.getElementById('writeup-modal');
    if (!modal) return;

    // Make sure modal is hidden initially
    modal.style.display = 'none';
    modal.classList.remove('active');

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
    if (!writeup) {
      console.error(`Writeup with id ${writeupId} not found`);
      return;
    }

    const modal = document.getElementById('writeup-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    if (!modal || !modalTitle || !modalBody) {
      console.error('Modal elements not found');
      return;
    }

    // Update modal title
    modalTitle.textContent = writeup.title;
    
    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
    document.body.style.overflow = 'hidden';

    // Show loading state
    modalBody.innerHTML = `
      <div class="writeup-loading">
        <div class="loading-spinner"></div>
        <p>Loading writeup content...</p>
      </div>
    `;

    try {
      // Try to load the markdown content
      const content = await this.loadMarkdownContent(writeup.markdownFile);
      const htmlContent = this.parseMarkdown(content);
      
      // Format date
      const formattedDate = new Date(writeup.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      modalBody.innerHTML = `
        <div class="writeup-content">
          <div class="writeup-meta">
            <span class="writeup-category">${this.categories[writeup.category]?.name || writeup.category}</span>
            <span class="writeup-difficulty">${writeup.difficulty.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            <span class="writeup-date">${formattedDate}</span>
            ${writeup.readTime ? `<span class="writeup-readtime">📖 ${writeup.readTime}</span>` : ''}
            ${writeup.htbUrl ? `
              <a href="${writeup.htbUrl}" target="_blank" rel="noopener" class="writeup-htb-link">
                View on HackTheBox ↗
              </a>
            ` : ''}
          </div>
          <div class="writeup-markdown-content">
            ${htmlContent}
          </div>
        </div>
      `;
      
      // Scroll to top of modal content
      modalBody.scrollTop = 0;
      
    } catch (error) {
      console.error('Failed to load writeup content:', error);
      
      // Show a more helpful error message
      modalBody.innerHTML = `
        <div class="writeup-error">
          <h3>📄 Writeup Loading Error</h3>
          <p>We couldn't load the writeup content. This might be because:</p>
          <ul style="text-align: left; display: inline-block;">
            <li>The markdown file is still being prepared</li>
            <li>There was a network error</li>
            <li>The file path is incorrect</li>
          </ul>
          <div style="margin-top: 2rem;">
            <p><strong>Writeup:</strong> ${writeup.title}</p>
            <p><strong>Category:</strong> ${this.categories[writeup.category]?.name || writeup.category}</p>
            <p><strong>File:</strong> ${writeup.markdownFile}</p>
          </div>
          ${writeup.htbUrl ? `
            <a href="${writeup.htbUrl}" target="_blank" rel="noopener" class="btn btn--primary" style="margin-top: 2rem;">
              View Challenge on HackTheBox ↗
            </a>
          ` : ''}
          <button class="btn btn--outline" style="margin-top: 1rem;" onclick="window.writeupsManager.closeModal()">
            Close
          </button>
        </div>
      `;
    }

    // Focus trap for accessibility
    modal.focus();
  }

  /**
   * Load markdown content from file
   */
  async loadMarkdownContent(filename) {
    // Check cache first
    if (this.markdownCache.has(filename)) {
      console.log(`Loading ${filename} from cache`);
      return this.markdownCache.get(filename);
    }

    // Try multiple paths to ensure we find the file
    const possiblePaths = [
      `./writeups/${filename}`,
      `/writeups/${filename}`,
      `writeups/${filename}`,
      `./${filename}`,
      `/${filename}`,
      filename
    ];
    
    let content = null;
    let successPath = null;
    
    for (const path of possiblePaths) {
      try {
        console.log(`Trying to fetch from: ${path}`);
        const response = await fetch(path);
        
        if (response.ok) {
          content = await response.text();
          successPath = path;
          break;
        }
      } catch (e) {
        console.log(`Failed to load from ${path}`);
      }
    }
    
    if (!content) {
      // Try to generate placeholder content if file not found
      console.log('Using placeholder content for missing file');
      content = this.generatePlaceholderContent(filename);
    } else {
      console.log(`Successfully loaded from: ${successPath}`);
      // Cache the content
      this.markdownCache.set(filename, content);
    }
    
    return content;
  }

  /**
   * Generate placeholder content for missing writeups
   */
  generatePlaceholderContent(filename) {
    return `# Writeup In Progress

This writeup is currently being prepared and will be available soon.

## File Information
- **Requested File:** ${filename}
- **Status:** Content pending

Please check back later or visit the HackTheBox platform for more information about this challenge.

---

*Note: Writeups are added regularly as challenges are completed and documented.*`;
  }

  /**
   * Parse markdown to HTML
   */
  parseMarkdown(markdown) {
    if (typeof marked === 'undefined') {
      console.error('Marked.js is not loaded');
      return `<div class="error">
        <p>Markdown parser not available. Please refresh the page.</p>
        <pre style="background: var(--color-surface); padding: 1rem; border-radius: 8px; overflow-x: auto;">
          ${this.escapeHtml(markdown)}
        </pre>
      </div>`;
    }
    
    if (!markdown || !markdown.trim()) {
      return '<p>No content available.</p>';
    }

    try {
      // Remove frontmatter if present (YAML between --- markers)
      const contentWithoutFrontmatter = markdown.replace(/^---[\s\S]*?---\n?/m, '').trim();
      
      // Parse markdown to HTML
      const html = marked.parse(contentWithoutFrontmatter);
      
      return html;
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return `
        <div class="error">
          <p>Error parsing content: ${error.message}</p>
          <pre style="background: var(--color-surface); padding: 1rem; border-radius: 8px; overflow-x: auto;">
            ${this.escapeHtml(markdown)}
          </pre>
        </div>
      `;
    }
  }

  /**
   * Close writeup modal
   */
  closeModal() {
    const modal = document.getElementById('writeup-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
      document.body.style.overflow = '';
      
      // Clear modal content to free memory
      const modalBody = document.getElementById('modal-body');
      if (modalBody) {
        modalBody.innerHTML = '';
      }
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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
      btn.setAttribute('aria-pressed', 'false');
      if (btn.dataset.category === 'all') {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
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

window.retryLoadWriteups = function() {
  location.reload();
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Writeups Manager...');
  window.writeupsManager = new WriteupsManager();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WriteupsManager;
}