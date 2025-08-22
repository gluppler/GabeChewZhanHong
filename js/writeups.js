/**
 * Writeups Page JavaScript
 * Author: Gabe Chew Zhan Hong
 * Description: Interactive functionality for writeups page
 */

class WriteupsManager {
  constructor() {
    this.writeups = [];
    this.filteredWriteups = [];
    this.currentCategory = 'all';
    this.currentSearch = '';
    this.currentPage = 1;
    this.writeupsPerPage = 6;
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadWriteups();
    this.initializeFilters();
    this.initializeSearch();
    this.initializeModal();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFilterClick(e));
    });

    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e));
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      });
    }

    // Load more button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => this.loadMoreWriteups());
    }

    // Modal close events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  /**
   * Load writeups data (simulate API call)
   */
  loadWriteups() {
    // Simulate loading from writeups.json
    this.writeups = [
      {
        id: 'example-1',
        title: 'Advanced ARM64 Binary Analysis',
        description: 'Deep dive into ARM64 assembly reverse engineering, exploring advanced anti-debugging techniques and custom exploit development for embedded systems.',
        category: 'reverse-engineering',
        platform: 'HackTheBox',
        date: 'March 2025',
        difficulty: 'hard',
        tags: ['ARM64', 'Assembly', 'Anti-Debug', 'Embedded'],
        featured: true,
        content: `
# Advanced ARM64 Binary Analysis

## Overview
This writeup covers an advanced reverse engineering challenge involving ARM64 architecture. The target binary implements several anti-debugging techniques and requires custom exploit development.

## Initial Analysis
First, let's examine the binary structure:

\`\`\`bash
file challenge_binary
objdump -d challenge_binary | head -50
\`\`\`

The binary is stripped and implements several protection mechanisms:
- Stack canaries
- ASLR (Address Space Layout Randomization)  
- Custom anti-debugging checks
- Encrypted string literals

## ARM64 Assembly Deep Dive
The main function contains interesting ARM64 instructions:

\`\`\`assembly
stp     x29, x30, [sp, #-16]!
mov     x29, sp
mov     w0, #0x1337
bl      check_debugger
cmp     w0, #0
bne     exit_program
\`\`\`

## Anti-Debugging Techniques
The binary implements multiple anti-debugging checks:

1. **PTRACE Detection**: Checks if a debugger is attached
2. **Timing Attacks**: Measures execution time to detect single-stepping
3. **Hardware Breakpoint Detection**: Monitors debug registers

## Exploitation Strategy
To bypass these protections, we need to:

1. Patch the anti-debugging checks
2. Extract encrypted strings
3. Identify the vulnerability
4. Develop a custom exploit

## Solution
The final exploit leverages a buffer overflow in the input validation routine...

[Content continues...]
        `
      },
      {
        id: 'example-2',
        title: 'IoT Device UART Exploitation',
        description: 'Complete hardware teardown and UART interface exploitation of a popular IoT device, including firmware extraction and privilege escalation.',
        category: 'hardware',
        platform: 'Independent',
        date: 'February 2025',
        difficulty: 'medium',
        tags: ['IoT', 'UART', 'Firmware', 'Hardware'],
        featured: false,
        content: `
# IoT Device UART Exploitation

## Hardware Analysis
This research focuses on exploiting UART interfaces in IoT devices to gain unauthorized access and extract firmware.

## Equipment Used
- Logic analyzer
- UART-to-USB converter
- Multimeter
- Soldering equipment
- Oscilloscope

## UART Interface Discovery
Lorem ipsum dolor sit amet, consectetur adipiscing elit...

[Detailed writeup content...]
        `
      },
      {
        id: 'example-3',
        title: 'Custom ROP Chain Exploitation',
        description: 'Advanced exploitation techniques using custom ROP chains to bypass modern protection mechanisms including ASLR, DEP, and stack canaries.',
        category: 'pwn',
        platform: 'HackTheBox',
        date: 'January 2025',
        difficulty: 'insane',
        tags: ['ROP', 'Binary Exploitation', 'ASLR Bypass', 'Stack'],
        featured: true,
        content: `
# Custom ROP Chain Exploitation

## Challenge Overview
This challenge presents a complex binary exploitation scenario requiring custom ROP chain construction to bypass multiple protection mechanisms.

## Protection Mechanisms
- ASLR (Address Space Layout Randomization)
- DEP/NX (Data Execution Prevention)
- Stack Canaries
- FORTIFY_SOURCE

## ROP Chain Construction
Building a reliable ROP chain requires careful gadget selection and stack layout planning...

[Detailed exploitation writeup...]
        `
      },
      {
        id: 'example-4',
        title: 'Adversarial ML Attack Vectors',
        description: 'Research into adversarial machine learning attacks, exploring poisoning techniques and model evasion strategies in production ML systems.',
        category: 'ai-ml',
        platform: 'Research',
        date: 'December 2024',
        difficulty: 'hard',
        tags: ['Machine Learning', 'Adversarial', 'Model Poisoning', 'Research'],
        featured: false,
        content: `
# Adversarial ML Attack Vectors

## Introduction
This research explores various attack vectors against machine learning systems in production environments.

## Attack Categories
1. **Evasion Attacks**: Manipulating input to fool trained models
2. **Poisoning Attacks**: Corrupting training data
3. **Model Extraction**: Stealing model parameters
4. **Membership Inference**: Determining if data was used in training

## Methodology
Our research methodology includes...

[Detailed research content...]
        `
      },
      {
        id: 'example-5',
        title: 'Android Application Security Analysis',
        description: 'Complete mobile application penetration testing workflow, from APK analysis to runtime manipulation and certificate pinning bypass.',
        category: 'mobile',
        platform: 'TryHackMe',
        date: 'November 2024',
        difficulty: 'medium',
        tags: ['Android', 'APK Analysis', 'Frida', 'SSL Pinning'],
        featured: false,
        content: `
# Android Application Security Analysis

## APK Analysis Workflow
This writeup demonstrates a comprehensive approach to Android application security testing.

## Tools Used
- APKTool
- Jadx
- Frida
- Burp Suite
- MobSF

## Static Analysis
First, we extract and analyze the APK:

\`\`\`bash
apktool d target_app.apk
jadx -d output target_app.apk
\`\`\`

## Dynamic Analysis
Using Frida for runtime manipulation:

\`\`\`javascript
Java.perform(function() {
    var SSLPinning = Java.use("com.example.SSLPinning");
    SSLPinning.checkCertificate.implementation = function() {
        console.log("[+] SSL Pinning bypassed");
        return true;
    };
});
\`\`\`

[Continued analysis...]
        `
      },
      {
        id: 'example-6',
        title: 'Advanced OSINT Reconnaissance Techniques',
        description: 'Comprehensive guide to open source intelligence gathering using modern tools and techniques for digital footprinting and reconnaissance.',
        category: 'osint',
        platform: 'TryHackMe',
        date: 'October 2024',
        difficulty: 'easy',
        tags: ['OSINT', 'Reconnaissance', 'Digital Footprint', 'Intelligence'],
        featured: false,
        content: `
# Advanced OSINT Reconnaissance Techniques

## OSINT Methodology
This writeup covers advanced techniques for gathering open source intelligence.

## Tools and Resources
- Maltego
- theHarvester
- Shodan
- Google Dorking
- Social Media Analysis

## Information Gathering Process
1. **Target Identification**
2. **Footprinting**
3. **Enumeration**
4. **Analysis and Correlation**

## Passive Reconnaissance
Starting with passive information gathering:

\`\`\`bash
theHarvester -d target.com -b google,bing,linkedin
nslookup target.com
whois target.com
\`\`\`

[Detailed OSINT techniques...]
        `
      }
    ];

    // Add more example writeups
    const additionalWriteups = [
      {
        id: 'example-7',
        title: 'Buffer Overflow Fundamentals',
        description: 'Introduction to stack-based buffer overflow exploitation with practical examples and mitigation techniques.',
        category: 'pwn',
        platform: 'TryHackMe',
        date: 'September 2024',
        difficulty: 'easy',
        tags: ['Buffer Overflow', 'Stack', 'Exploitation', 'Fundamentals'],
        featured: false,
        content: 'Detailed buffer overflow writeup content...'
      },
      {
        id: 'example-8',
        title: 'Wireless Protocol Analysis',
        description: 'Deep dive into wireless protocol security, including WiFi, Bluetooth, and Zigbee vulnerability assessment.',
        category: 'hardware',
        platform: 'Independent',
        date: 'August 2024',
        difficulty: 'hard',
        tags: ['Wireless', 'Protocol Analysis', 'WiFi', 'Bluetooth'],
        featured: false,
        content: 'Detailed wireless security writeup content...'
      }
    ];

    this.writeups = [...this.writeups, ...additionalWriteups];
    this.filteredWriteups = [...this.writeups];
    
    this.renderWriteups();
    this.updateStats();
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
    const button = e.currentTarget;
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
    
    // Debounce search input
    let searchTimeout;
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.handleSearch(e);
      }, 300);
    });
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

    // Trigger animations
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
    
    card.innerHTML = `
      <div class="writeup-card__image">
        <div class="writeup-card__placeholder">${this.getCategoryIcon(writeup.category)}</div>
        <div class="writeup-card__difficulty">${writeup.difficulty}</div>
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
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category) {
    const icons = {
      'reverse-engineering': 'REV',
      'pwn': 'PWN',
      'hardware': 'HW',
      'mobile': 'MOB',
      'ai-ml': 'AI',
      'osint': 'OSINT'
    };
    return icons[category] || 'SEC';
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
    const totalShown = this.currentPage * this.writeupsPerPage;
    
    if (loadMoreBtn) {
      if (totalShown >= this.filteredWriteups.length) {
        loadMoreBtn.style.display = 'none';
      } else {
        loadMoreBtn.style.display = 'inline-flex';
        loadMoreBtn.textContent = `Load More (${Math.min(this.writeupsPerPage, this.filteredWriteups.length - totalShown)} more)`;
      }
    }
  }

  /**
   * Show/hide empty state
   */
  showEmptyState(show) {
    const emptyState = document.getElementById('empty-state');
    const loadMore = document.querySelector('.load-more');
    
    if (emptyState) {
      emptyState.style.display = show ? 'block' : 'none';
    }
    
    if (loadMore) {
      loadMore.style.display = show ? 'none' : 'block';
    }
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
   * Open writeup modal
   */
  openWriteup(writeupId) {
    const writeup = this.writeups.find(w => w.id === writeupId);
    if (!writeup) return;

    const modal = document.getElementById('writeup-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    if (!modal || !modalTitle || !modalBody) return;

    // Update modal content
    modalTitle.textContent = writeup.title;
    
    // Convert markdown-like content to HTML
    const htmlContent = this.markdownToHtml(writeup.content);
    modalBody.innerHTML = `<div class="writeup-content">${htmlContent}</div>`;

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus trap for accessibility
    modal.focus();
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
   * Convert basic markdown to HTML
   */
  markdownToHtml(markdown) {
    if (!markdown) return '<p>Content not available.</p>';

    let html = markdown
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang || 'text'}">${this.escapeHtml(code.trim())}</code></pre>`;
      })
      
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      
      // Paragraphs
      .split('\n\n')
      .map(paragraph => {
        paragraph = paragraph.trim();
        if (!paragraph) return '';
        if (paragraph.startsWith('<h') || paragraph.startsWith('<pre') || paragraph.startsWith('<ul') || paragraph.startsWith('<ol')) {
          return paragraph;
        }
        return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
      })
      .join('\n');

    return html;
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
   * Get writeup by ID
   */
  getWriteup(id) {
    return this.writeups.find(writeup => writeup.id === id);
  }

  /**
   * Get writeups by category
   */
  getWriteupsByCategory(category) {
    return this.writeups.filter(writeup => writeup.category === category);
  }

  /**
   * Get featured writeups
   */
  getFeaturedWriteups() {
    return this.writeups.filter(writeup => writeup.featured);
  }

  /**
   * Search writeups
   */
  searchWriteups(query) {
    const lowercaseQuery = query.toLowerCase();
    return this.writeups.filter(writeup => 
      writeup.title.toLowerCase().includes(lowercaseQuery) ||
      writeup.description.toLowerCase().includes(lowercaseQuery) ||
      writeup.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      writeup.content.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Sort writeups
   */
  sortWriteups(sortBy = 'date', order = 'desc') {
    this.filteredWriteups.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'difficulty':
          const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3, 'insane': 4 };
          aValue = difficultyOrder[a.difficulty];
          bValue = difficultyOrder[b.difficulty];
          break;
        case 'platform':
          aValue = a.platform.toLowerCase();
          bValue = b.platform.toLowerCase();
          break;
        case 'date':
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
      }
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    this.renderWriteups();
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
      featured: writeup.featured
    }));

    let content, filename, mimeType;

    switch (format) {
      case 'csv':
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        data.forEach(row => {
          const values = headers.map(header => {
            const value = row[header];
            return Array.isArray(value) ? `"${value.join(', ')}"` : `"${value}"`;
          });
          csvRows.push(values.join(','));
        });
        content = csvRows.join('\n');
        filename = 'writeups.csv';
        mimeType = 'text/csv';
        break;
      
      case 'json':
      default:
        content = JSON.stringify(data, null, 2);
        filename = 'writeups.json';
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

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + K to focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.focus();
    }
  }
  
  // Escape to clear search
  if (e.key === 'Escape') {
    const searchInput = document.getElementById('search-input');
    if (searchInput && document.activeElement === searchInput) {
      searchInput.blur();
      searchInput.value = '';
      if (window.writeupsManager) {
        window.writeupsManager.handleSearch({ target: { value: '' } });
      }
    }
  }
});

// Add search placeholder animation
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    const placeholders = [
      'Search writeups...',
      'Try "ARM64", "hardware", "reverse engineering"...',
      'Filter by tags, titles, or descriptions...',
      'Search by difficulty or platform...'
    ];
    
    let currentIndex = 0;
    
    setInterval(() => {
      currentIndex = (currentIndex + 1) % placeholders.length;
      searchInput.setAttribute('placeholder', placeholders[currentIndex]);
    }, 3000);
  }
});