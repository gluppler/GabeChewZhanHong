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
      'ai-ml': { name: 'AI/ML', icon: 'AI', color: '#ff6b6b' },
      'reversing': { name: 'Reversing', icon: 'REV', color: '#4ecdc4' },
      'pwn': { name: 'Pwn', icon: 'PWN', color: '#45b7d1' },
      'hardware': { name: 'Hardware', icon: 'HW', color: '#96ceb4' },
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
      const response = await fetch('writeups/index.json');
      if (!response.ok) {
        throw new Error('Failed to load writeups index');
      }
    
      const data = await response.json();
      this.writeups = data.writeups || [];
      this.updateStats();
    } catch (error) {
      console.error('Failed to load writeups:', error);
      // Fallback to generated data if index.json doesn't exist
      this.writeups = await this.generateWriteupsFromSolvedChallenges();
    }
  }

  /**
   * Generate writeups data from solved challenges
   * This simulates loading from markdown files in a writeups/ directory
   */
  async generateWriteupsFromSolvedChallenges() {
    // Based on your solved challenges, create writeup entries
    const solvedChallenges = [
      { id: 824, name: 'Challenge 824', category: 'reversing', difficulty: 'Hard' },
      { id: 220, name: 'Challenge 220', category: 'pwn', difficulty: 'Medium' },
      { id: 207, name: 'Challenge 207', category: 'crypto', difficulty: 'Easy' },
      { id: 221, name: 'Challenge 221', category: 'misc', difficulty: 'Medium' },
      { id: 223, name: 'Challenge 223', category: 'osint', difficulty: 'Easy' },
      { id: 194, name: 'Challenge 194', category: 'hardware', difficulty: 'Hard' }
    ];

    return solvedChallenges.map(challenge => ({
      id: `htb-${challenge.id}`,
      title: this.generateChallengeTitle(challenge.category, challenge.id),
      description: this.generateChallengeDescription(challenge.category),
      category: challenge.category,
      platform: 'HackTheBox',
      date: this.generateRandomDate(),
      difficulty: challenge.difficulty.toLowerCase(),
      tags: this.generateTags(challenge.category),
      featured: Math.random() > 0.7,
      markdownFile: `writeups/htb-${challenge.id}.md`,
      htbUrl: `https://labs.hackthebox.com/achievement/challenge/2141842/${challenge.id}`
    }));
  }

  /**
   * Generate challenge titles based on category
   */
  generateChallengeTitle(category, id) {
    const titles = {
      'reversing': ['Binary Analysis Deep Dive', 'Reverse Engineering Mastery', 'Dissecting the Binary'],
      'pwn': ['Buffer Overflow Exploitation', 'Stack Smashing Techniques', 'Memory Corruption Attack'],
      'crypto': ['Cryptographic Analysis', 'Breaking the Cipher', 'Cryptanalysis Walkthrough'],
      'misc': ['Miscellaneous Challenge Solution', 'Creative Problem Solving', 'Unique Challenge Approach'],
      'osint': ['Open Source Intelligence', 'Information Gathering', 'Digital Forensics'],
      'hardware': ['Hardware Exploitation', 'Embedded System Analysis', 'IoT Security Research']
    };
    
    const categoryTitles = titles[category] || ['Challenge Solution'];
    const baseTitle = categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
    return `${baseTitle} - HTB ${id}`;
  }

  /**
   * Generate challenge descriptions based on category
   */
  generateChallengeDescription(category) {
    const descriptions = {
      'reversing': 'Detailed reverse engineering analysis including disassembly, debugging techniques, and exploit development strategies.',
      'pwn': 'Binary exploitation walkthrough covering vulnerability discovery, payload crafting, and successful exploitation.',
      'crypto': 'Cryptographic challenge solution with mathematical analysis, cipher breaking techniques, and key recovery methods.',
      'misc': 'Creative problem-solving approach for this unique challenge, demonstrating lateral thinking and technical skills.',
      'osint': 'Open source intelligence gathering techniques, digital footprinting, and information correlation methods.',
      'hardware': 'Hardware security analysis including firmware extraction, circuit analysis, and physical exploitation techniques.'
    };
    
    return descriptions[category] || 'Comprehensive solution walkthrough for this HackTheBox challenge.';
  }

  /**
   * Generate tags based on category
   */
  generateTags(category) {
    const tagMap = {
      'reversing': ['IDA Pro', 'Ghidra', 'Assembly', 'Debugging'],
      'pwn': ['Buffer Overflow', 'ROP', 'Shellcode', 'GDB'],
      'crypto': ['RSA', 'AES', 'Hash Functions', 'Mathematics'],
      'misc': ['Forensics', 'Steganography', 'Programming', 'Logic'],
      'osint': ['Google Dorking', 'Social Media', 'Metadata', 'Research'],
      'hardware': ['Arduino', 'UART', 'SPI', 'Firmware']
    };
    
    return tagMap[category] || ['HackTheBox', 'Security'];
  }

  /**
   * Generate random date within the last 6 months
   */
  generateRandomDate() {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
    const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
    return new Date(randomTime).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
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
                         writeup.tags.some(tag => tag.toLowerCase().includes(this.currentSearch));

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
    
    card.innerHTML = `
      <div class="writeup-card__image" style="background: linear-gradient(135deg, ${categoryInfo.color}, #1a1a1a)">
        <div class="writeup-card__placeholder">${categoryInfo.icon}</div>
        <div class="writeup-card__difficulty">${writeup.difficulty}</div>
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
          ${writeup.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="writeup-card__actions">
          <button class="btn btn--outline" onclick="writeupsManager.openWriteup('${writeup.id}')">
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
      // Load markdown content
      const content = await this.loadMarkdownContent(writeup.markdownFile);
      const htmlContent = this.markdownToHtml(content);
      
      modalBody.innerHTML = `
        <div class="writeup-content">
          <div class="writeup-meta">
            <span class="writeup-category">${this.categories[writeup.category]?.name || writeup.category}</span>
            <span class="writeup-difficulty">${writeup.difficulty}</span>
            <span class="writeup-date">${writeup.date}</span>
            ${writeup.htbUrl ? `<a href="${writeup.htbUrl}" target="_blank" class="writeup-htb-link">View on HackTheBox</a>` : ''}
          </div>
          ${htmlContent}
        </div>
      `;
    } catch (error) {
      console.error('Failed to load writeup content:', error);
      modalBody.innerHTML = `
        <div class="writeup-error">
          <h3>Content Not Available</h3>
          <p>This writeup is currently being prepared. Please check back later.</p>
          <p><strong>Challenge:</strong> ${writeup.title}</p>
          <p><strong>Category:</strong> ${this.categories[writeup.category]?.name || writeup.category}</p>
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
      const response = await fetch(filepath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const content = await response.text();
      this.markdownCache.set(filepath, content);
      return content;
    } catch (error) {
      console.error(`Failed to load ${filepath}:`, error);
      throw new Error(`Failed to load ${filepath}: ${error.message}`);
    }
  }

  /**
   * Generate placeholder content for writeups
   */
  generatePlaceholderContent(filepath) {
    const challengeId = filepath.match(/htb-(\d+)\.md/)?.[1] || 'unknown';
    
    return `# HackTheBox Challenge ${challengeId}

## Overview
This writeup covers the solution for HackTheBox challenge ${challengeId}. The challenge involves various security concepts and requires a methodical approach to solve.

## Initial Reconnaissance
First, let's analyze what we're working with:

\`\`\`bash
# Initial enumeration commands
nmap -sC -sV target_ip
gobuster dir -u http://target_ip -w wordlist.txt
\`\`\`

## Analysis
After the initial reconnaissance, we discovered several interesting points:

1. **Service Enumeration**: Multiple services are running on the target
2. **Web Application**: A web interface is available for testing
3. **Potential Vulnerabilities**: Several attack vectors identified

## Exploitation
The exploitation process involved the following steps:

\`\`\`python
# Example exploit code
import requests
import base64

target_url = "http://target_ip"
payload = "malicious_payload_here"

response = requests.post(target_url, data={"input": payload})
print(response.text)
\`\`\`

## Solution Steps
1. **Vulnerability Discovery**: Identified the main weakness
2. **Payload Development**: Crafted the appropriate exploit
3. **Execution**: Successfully exploited the vulnerability
4. **Flag Extraction**: Retrieved the challenge flag

## Key Takeaways
- Always start with thorough enumeration
- Understanding the underlying technology is crucial
- Persistence and methodical approach are essential

## Tools Used
- Burp Suite
- Python scripts
- Command line utilities
- Custom exploitation tools

*Note: This is a placeholder writeup. The actual detailed writeup for challenge ${challengeId} is being prepared.*`;
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
    if (!markdown) return '<p>Content not available.</p>';

    // Remove frontmatter before parsing
    const contentWithoutFrontmatter = markdown.replace(/---[\s\S]*?---/, '').trim();
    
    return marked.parse(contentWithoutFrontmatter);
  }

  /**
   * Escape HTML characters
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    // Reset category filter
    this.currentCategory = 'all';
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.category === 'all') {
        btn.classList.add('active');
      }
    });

    // Reset search
    this.currentSearch = '';
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = '';
    }

    // Reset page
    this.currentPage = 1;

    // Apply filters
    this.applyFilters();
  }

  /**
   * Add new writeup (for easy addition of new posts)
   */
  addWriteup(writeupData) {
    const newWriteup = {
      id: writeupData.id || `htb-${Date.now()}`,
      title: writeupData.title,
      description: writeupData.description,
      category: writeupData.category,
      platform: writeupData.platform || 'HackTheBox',
      date: writeupData.date || new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      }),
      difficulty: writeupData.difficulty || 'medium',
      tags: writeupData.tags || [],
      featured: writeupData.featured || false,
      markdownFile: writeupData.markdownFile || `writeups/${writeupData.id}.md`,
      htbUrl: writeupData.htbUrl
    };

    this.writeups.unshift(newWriteup);
    this.updateStats();
    this.applyFilters();
    
    return newWriteup;
  }

  /**
   * Remove writeup
   */
  removeWriteup(writeupId) {
    this.writeups = this.writeups.filter(w => w.id !== writeupId);
    this.updateStats();
    this.applyFilters();
  }

  /**
   * Get writeup statistics
   */
  getStats() {
    const stats = {
      total: this.writeups.length,
      byCategory: {},
      byDifficulty: {},
      featured: this.writeups.filter(w => w.featured).length
    };

    this.writeups.forEach(writeup => {
      // Count by category
      stats.byCategory[writeup.category] = (stats.byCategory[writeup.category] || 0) + 1;
      
      // Count by difficulty
      stats.byDifficulty[writeup.difficulty] = (stats.byDifficulty[writeup.difficulty] || 0) + 1;
    });

    return stats;
  }

  /**
   * Export writeups data
   */
  exportWriteups(format = 'json') {
    const data = this.writeups.map(writeup => ({
      id: writeup.id,
      title: writeup.title,
      description: writeup.description,
      category: writeup.category,
      platform: writeup.platform,
      date: writeup.date,
      difficulty: writeup.difficulty,
      tags: writeup.tags,
      featured: writeup.featured,
      markdownFile: writeup.markdownFile,
      htbUrl: writeup.htbUrl
    }));

    let content, filename, mimeType;

    switch (format) {
      case 'csv':
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        data.forEach(row => {
          const values = headers.map(header => {
            const value = row[header];
            return Array.isArray(value) ? `"${value.join(', ')}"` : `"${value || ''}"`;
          });
          csvRows.push(values.join(','));
        });
        content = csvRows.join('\n');
        filename = 'htb-writeups.csv';
        mimeType = 'text/csv';
        break;
      
      case 'json':
      default:
        content = JSON.stringify(data, null, 2);
        filename = 'htb-writeups.json';
        mimeType = 'application/json';
        break;
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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