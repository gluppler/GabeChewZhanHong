/**
 * HackTheBox Writeups Manager - Optimized Version
 * Author: Gabe Chew Zhan Hong
 * Description: Enhanced writeup display with better performance and error handling
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
    this.abortController = null;
    
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
    try {
      this.bindEvents();
      this.showLoading(true);
      await this.loadWriteupsIndex();
      this.initializeFilters();
      this.initializeSearch();
      this.initializeModal();
      this.applyFilters();
    } catch (error) {
      console.error('Failed to initialize writeups:', error);
      this.showError('Failed to initialize. Please refresh the page.');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Bind event listeners using event delegation
   */
  bindEvents() {
    // Use event delegation for better performance
    document.addEventListener('click', (e) => {
      // Filter buttons
      if (e.target.classList.contains('filter-btn')) {
        this.handleFilterClick(e);
      }
      
      // Writeup card clicks
      const card = e.target.closest('.writeup-card');
      if (card && card.dataset.writeupId) {
        this.openWriteup(card.dataset.writeupId);
      }
      
      // Load more button
      if (e.target.id === 'load-more-btn') {
        this.loadMoreWriteups();
      }
      
      // Modal close
      if (e.target.classList.contains('modal__backdrop') || 
          e.target.classList.contains('modal__close')) {
        this.closeModal();
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
      
      // Clear search on ESC
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          this.handleSearch({ target: { value: '' } });
          searchInput.blur();
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // ESC to close modal
      if (e.key === 'Escape' && this.isModalOpen()) {
        this.closeModal();
      }
      
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    });

    // Handle browser back button for modal
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.modalOpen) {
        this.openWriteup(e.state.writeupId, false);
      } else if (this.isModalOpen()) {
        this.closeModal(false);
      }
    });
  }

  /**
   * Load writeups index from JSON file
   */
  async loadWriteupsIndex() {
    try {
      // Cancel any pending requests
      if (this.abortController) {
        this.abortController.abort();
      }
      
      this.abortController = new AbortController();
      
      const response = await fetch('./writeups/index.json', {
        signal: this.abortController.signal,
        cache: 'no-cache' // Force fresh data
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    
      const data = await response.json();
      this.writeups = data.writeups || [];
      
      // Sort by date (newest first)
      this.writeups.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      this.updateStats();
      
      // Preload featured writeups
      this.preloadFeaturedWriteups();
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      
      console.error('Failed to load writeups:', error);
      
      // Try to load from cache or show sample data
      this.loadFallbackData();
    }
  }

  /**
   * Load fallback data if main request fails
   */
  loadFallbackData() {
    // Sample data for demonstration
    this.writeups = [
      {
        id: "htb-824",
        title: "Low Logic Challenge - HTB 824",
        description: "Solution walkthrough for HackTheBox challenge 824.",
        category: "hardware",
        platform: "HackTheBox",
        difficulty: "very-easy",
        date: "2025-08-23",
        tags: ["HackTheBox", "Hardware"],
        featured: false,
        markdownFile: "htb-824.md",
        htbUrl: "https://labs.hackthebox.com/achievement/challenge/2141842/824"
      }
    ];
    
    this.updateStats();
    this.showError('Using cached data. Some features may be limited.');
  }

  /**
   * Preload featured writeups for faster access
   */
  async preloadFeaturedWriteups() {
    const featured = this.writeups.filter(w => w.featured);
    
    for (const writeup of featured) {
      if (writeup.markdownFile) {
        // Preload in background
        requestIdleCallback(() => {
          this.loadMarkdownContent(`./writeups/${writeup.markdownFile}`)
            .catch(() => {}); // Silently fail
        });
      }
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
          <h3 style="color: var(--color-accent); margin-bottom: 1rem;">⚠️ Notice</h3>
          <p style="color: var(--color-text-secondary);">${message}</p>
          <button class="btn btn--primary" style="margin-top: 1rem;" onclick="location.reload()">
            Retry
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

    // Apply filters with animation
    this.applyFilters();
    
    // Update URL without reload
    const url = new URL(window.location);
    if (category === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', category);
    }
    window.history.pushState({}, '', url);
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
      'Press Ctrl+K to search'
    ];
    
    let placeholderIndex = 0;
    const changePlaceholder = () => {
      placeholderIndex = (placeholderIndex + 1) % placeholders.length;
      searchInput.placeholder = placeholders[placeholderIndex];
    };
    
    // Change placeholder every 4 seconds
    setInterval(changePlaceholder, 4000);
    
    // Load search from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
      searchInput.value = searchQuery;
      this.currentSearch = searchQuery.toLowerCase();
    }
  }

  /**
   * Handle search input
   */
  handleSearch(e) {
    this.currentSearch = e.target.value.toLowerCase().trim();
    this.currentPage = 1;
    this.applyFilters();
    
    // Update URL without reload
    const url = new URL(window.location);
    if (this.currentSearch) {
      url.searchParams.set('search', this.currentSearch);
    } else {
      url.searchParams.delete('search');
    }
    window.history.replaceState({}, '', url);
  }

  /**
   * Apply filters and search
   */
  applyFilters() {
    this.filteredWriteups = this.writeups.filter(writeup => {
      // Category filter
      const categoryMatch = this.currentCategory === 'all' || 
                           writeup.category === this.currentCategory;

      // Search filter (search in multiple fields)
      const searchMatch = !this.currentSearch || 
                         writeup.title.toLowerCase().includes(this.currentSearch) ||
                         writeup.description.toLowerCase().includes(this.currentSearch) ||
                         writeup.category.toLowerCase().includes(this.currentSearch) ||
                         writeup.platform.toLowerCase().includes(this.currentSearch) ||
                         writeup.difficulty.toLowerCase().includes(this.currentSearch) ||
                         (writeup.tags && writeup.tags.some(tag => 
                           tag.toLowerCase().includes(this.currentSearch)));

      return categoryMatch && searchMatch;
    });

    // Update UI
    this.renderWriteups();
    this.updateLoadMoreButton();
    this.showEmptyState(this.filteredWriteups.length === 0);
    
    // Update result count
    this.updateResultCount();
  }

  /**
   * Update result count display
   */
  updateResultCount() {
    const totalWriteupsEl = document.getElementById('total-writeups');
    if (totalWriteupsEl) {
      if (this.currentSearch || this.currentCategory !== 'all') {
        totalWriteupsEl.textContent = `${this.filteredWriteups.length} / ${this.writeups.length}`;
      } else {
        totalWriteupsEl.textContent = this.writeups.length;
      }
    }
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

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    // Render each writeup card
    writeupsToShow.forEach((writeup, index) => {
      const card = this.createWriteupCard(writeup, index);
      fragment.appendChild(card);
    });

    grid.appendChild(fragment);

    // Trigger staggered animations
    requestAnimationFrame(() => {
      const cards = grid.querySelectorAll('.writeup-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('animate');
        }, Math.min(index * 50, 300)); // Cap animation delay
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
    card.dataset.writeupId = writeup.id;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Read writeup: ${writeup.title}`);
    
    const categoryInfo = this.categories[writeup.category] || { 
      name: writeup.category, 
      icon: 'HTB', 
      color: '#ef4444' 
    };
    
    // Format difficulty for display
    const displayDifficulty = writeup.difficulty
      .replace('-', ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
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
        ${writeup.featured ? '<div class="writeup-card__featured">⭐ Featured</div>' : ''}
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
          <button class="btn btn--outline" onclick="event.stopPropagation(); window.writeupsManager.openWriteup('${writeup.id}')">
            Read Writeup
          </button>
          ${writeup.htbUrl ? 
            `<a href="${writeup.htbUrl}" target="_blank" rel="noopener" class="btn btn--secondary btn--sm" onclick="event.stopPropagation()">
              HTB Link ↗
            </a>` : ''}
          ${writeup.thmUrl ? 
            `<a href="${writeup.thmUrl}" target="_blank" rel="noopener" class="btn btn--secondary btn--sm" onclick="event.stopPropagation()">
              THM Link ↗
            </a>` : ''}
        </div>
      </div>
    `;

    // Add keyboard support
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openWriteup(writeup.id);
      }
    });

    return card;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Load more writeups
   */
  loadMoreWriteups() {
    this.currentPage++;
    this.renderWriteups();
    this.updateLoadMoreButton();
    
    // Smooth scroll to new content
    const newCards = document.querySelectorAll('.writeup-card:not(.animate)');
    if (newCards.length > 0) {
      setTimeout(() => {
        newCards[0].scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }, 100);
    }
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
        loadMoreBtn.textContent = `Load More (${toShow} of ${remaining})`;
        loadMoreBtn.setAttribute('aria-label', `Load ${toShow} more writeups`);
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
    }
    
    // Update category counts
    const categoryCounts = {};
    this.writeups.forEach(w => {
      categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;
    });
    
    // Update filter button counts
    document.querySelectorAll('.filter-btn').forEach(btn => {
      const category = btn.dataset.category;
      if (category && category !== 'all' && categoryCounts[category]) {
        const count = categoryCounts[category];
        const badge = document.createElement('span');
        badge.className = 'filter-btn__count';
        badge.textContent = count;
        badge.style.cssText = `
          margin-left: 0.5rem;
          padding: 0.125rem 0.375rem;
          background: var(--color-accent);
          color: white;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
        `;
        
        // Remove existing badge if any
        const existingBadge = btn.querySelector('.filter-btn__count');
        if (existingBadge) {
          existingBadge.remove();
        }
        
        btn.appendChild(badge);
      }
    });
  }

  /**
   * Initialize modal functionality
   */
  initializeModal() {
    const modal = document.getElementById('writeup-modal');
    if (!modal) return;

    // Trap focus in modal
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    });
  }

  /**
   * Check if modal is open
   */
  isModalOpen() {
    const modal = document.getElementById('writeup-modal');
    return modal && modal.classList.contains('active');
  }

  /**
   * Open writeup modal and load markdown content
   */
  async openWriteup(writeupId, pushState = true) {
    const writeup = this.writeups.find(w => w.id === writeupId);
    if (!writeup) {
      console.error('Writeup not found:', writeupId);
      return;
    }

    const modal = document.getElementById('writeup-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    if (!modal || !modalTitle || !modalBody) return;

    // Update modal title
    modalTitle.textContent = writeup.title;
    
    // Show modal
    modal.classList.add('active');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Update browser history
    if (pushState) {
      window.history.pushState(
        { modalOpen: true, writeupId }, 
        '', 
        `#writeup-${writeupId}`
      );
    }

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
      const htmlContent = await this.markdownToHtml(content);
      
      modalBody.innerHTML = `
        <div class="writeup-content">
          <div class="writeup-meta">
            <span class="writeup-category">${this.categories[writeup.category]?.name || writeup.category}</span>
            <span class="writeup-difficulty">${writeup.difficulty.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            <span class="writeup-date">${new Date(writeup.date).toLocaleDateString()}</span>
            ${writeup.htbUrl ? 
              `<a href="${writeup.htbUrl}" target="_blank" rel="noopener" class="writeup-htb-link">
                View on HackTheBox ↗
              </a>` : ''}
            ${writeup.thmUrl ? 
              `<a href="${writeup.thmUrl}" target="_blank" rel="noopener" class="writeup-thm-link">
                View on TryHackMe ↗
              </a>` : ''}
          </div>
          <div class="writeup-markdown-content">
            ${htmlContent}
          </div>
        </div>
      `;
      
      // Highlight code blocks if Prism.js is available
      if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
      }
      
    } catch (error) {
      console.error('Failed to load writeup content:', error);
      modalBody.innerHTML = `
        <div class="writeup-error">
          <h3>Content Not Available</h3>
          <p>This writeup is currently being prepared or there was an error loading the content.</p>
          <p><strong>Challenge:</strong> ${writeup.title}</p>
          <p><strong>Category:</strong> ${this.categories[writeup.category]?.name || writeup.category}</p>
          ${writeup.htbUrl ? 
            `<a href="${writeup.htbUrl}" target="_blank" rel="noopener" class="btn btn--primary">
              View Challenge on HackTheBox ↗
            </a>` : ''}
          ${writeup.thmUrl ? 
            `<a href="${writeup.thmUrl}" target="_blank" rel="noopener" class="btn btn--primary">
              View Challenge on TryHackMe ↗
            </a>` : ''}
        </div>
      `;
    }

    // Focus modal for accessibility
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
      const response = await fetch(filepath, {
        cache: 'force-cache' // Use cache when possible
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const content = await response.text();
      
      if (!content.trim()) {
        throw new Error('Empty file content');
      }
      
      // Cache the content
      this.markdownCache.set(filepath, content);
      return content;
      
    } catch (error) {
      console.error(`Failed to load ${filepath}:`, error);
      
      // Return fallback content
      return `# Writeup Coming Soon\n\nThis writeup is currently being prepared. Please check back later!`;
    }
  }

  /**
   * Close writeup modal
   */
  closeModal(popState = true) {
    const modal = document.getElementById('writeup-modal');
    if (modal && modal.classList.contains('active')) {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
      document.body.style.overflow = '';
      
      // Update browser history
      if (popState && window.location.hash.startsWith('#writeup-')) {
        window.history.back();
      }
    }
  }

  /**
   * Convert markdown to HTML
   */
  async markdownToHtml(markdown) {
    // Wait for marked.js to load
    if (typeof marked === 'undefined') {
      await this.loadMarkedLibrary();
    }
    
    if (typeof marked === 'undefined') {
      console.error('Marked.js library is not available');
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
        mangle: false,
        highlight: function(code, lang) {
          // Use Prism.js if available
          if (typeof Prism !== 'undefined' && Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang);
          }
          return code;
        }
      });

      // Remove frontmatter if present
      const contentWithoutFrontmatter = markdown
        .replace(/^---[\s\S]*?---\n?/, '')
        .trim();
      
      // Parse markdown to HTML
      const html = marked.parse(contentWithoutFrontmatter);
      
      return html;
      
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return `<p>Error parsing content: ${error.message}</p>`;
    }
  }

  /**
   * Load Marked.js library dynamically
   */
  async loadMarkedLibrary() {
    return new Promise((resolve, reject) => {
      if (typeof marked !== 'undefined') {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
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

    // Clear URL params
    window.history.replaceState({}, '', window.location.pathname);

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
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWriteups);
} else {
  initWriteups();
}

function initWriteups() {
  // Only initialize on writeups page
  if (window.location.pathname.includes('writeups')) {
    window.writeupsManager = new WriteupsManager();
    
    // Handle initial hash
    if (window.location.hash.startsWith('#writeup-')) {
      const writeupId = window.location.hash.replace('#writeup-', '');
      setTimeout(() => {
        window.writeupsManager.openWriteup(writeupId, false);
      }, 100);
    }
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WriteupsManager;
}