/**
 * Writeups Manager - Handles writeup display, filtering, and interactions
 * @author Gabe Chew Zhan Hong
 */

class WriteupsManager {
    constructor() {
        this.writeups = [
            {
                id: 1,
                title: "ARM64 Buffer Overflow Exploitation",
                description: "Deep dive into ARM64 architecture vulnerabilities, exploring stack-based buffer overflows and ROP chain construction in modern ARM64 systems. Covers bypass techniques for modern mitigations like ASLR and DEP.",
                date: "2024-12-15",
                difficulty: "Hard",
                tags: ["ARM64", "Buffer Overflow", "ROP", "Exploitation"],
                category: "hardware",
                featured: true,
                readTime: "15 min",
                slug: "arm64-buffer-overflow-exploitation"
            },
            {
                id: 2,
                title: "IoT Device Hardware Analysis",
                description: "Complete hardware teardown and security analysis of a popular IoT device. Covers firmware extraction, UART analysis, and discovering critical vulnerabilities in embedded systems.",
                date: "2024-11-28",
                difficulty: "Medium",
                tags: ["IoT", "Hardware", "Firmware", "UART", "Embedded"],
                category: "hardware",
                featured: true,
                readTime: "20 min",
                slug: "iot-device-hardware-analysis"
            },
            {
                id: 3,
                title: "HackTheBox: The Needle Writeup",
                description: "Complete walkthrough of HackTheBox's 'The Needle' machine, featuring advanced Active Directory exploitation, Kerberoasting, and privilege escalation techniques in a Windows enterprise environment.",
                date: "2024-11-10",
                difficulty: "Hard",
                tags: ["HackTheBox", "Active Directory", "Kerberoasting", "Windows"],
                category: "ctf",
                featured: false,
                readTime: "25 min",
                slug: "hackthebox-the-needle-writeup"
            },
            {
                id: 4,
                title: "Modern Web Application Security Testing",
                description: "Comprehensive guide to testing modern web applications for security vulnerabilities. Covers OWASP Top 10, advanced injection techniques, and client-side security assessment methodologies.",
                date: "2024-10-22",
                difficulty: "Medium",
                tags: ["Web Security", "OWASP", "Penetration Testing", "Burp Suite"],
                category: "web",
                featured: false,
                readTime: "18 min",
                slug: "modern-web-application-security-testing"
            },
            {
                id: 5,
                title: "Android Malware Reverse Engineering",
                description: "Step-by-step analysis of a sophisticated Android malware sample. Covers static and dynamic analysis techniques, unpacking, and understanding malicious behavior patterns.",
                date: "2024-10-05",
                difficulty: "Hard",
                tags: ["Android", "Malware", "Reverse Engineering", "Mobile Security"],
                category: "mobile",
                featured: true,
                readTime: "30 min",
                slug: "android-malware-reverse-engineering"
            },
            {
                id: 6,
                title: "Social Engineering OSINT Investigation",
                description: "Real-world case study of a comprehensive OSINT investigation for social engineering assessment. Demonstrates advanced reconnaissance techniques and information gathering methodologies.",
                date: "2024-09-18",
                difficulty: "Medium",
                tags: ["OSINT", "Social Engineering", "Reconnaissance", "Investigation"],
                category: "osint",
                featured: false,
                readTime: "22 min",
                slug: "social-engineering-osint-investigation"
            },
            {
                id: 7,
                title: "Machine Learning Model Poisoning Attack",
                description: "Exploring adversarial attacks against machine learning models. Demonstrates data poisoning techniques and their impact on model behavior in real-world AI systems.",
                date: "2024-09-03",
                difficulty: "Hard",
                tags: ["AI Security", "ML Poisoning", "Adversarial AI", "Model Security"],
                category: "ai-ml",
                featured: true,
                readTime: "28 min",
                slug: "machine-learning-model-poisoning-attack"
            },
            {
                id: 8,
                title: "Advanced Binary Exploitation Techniques",
                description: "Modern binary exploitation techniques including heap exploitation, format string vulnerabilities, and advanced ROP/JOP techniques. Covers modern mitigation bypasses.",
                date: "2024-08-15",
                difficulty: "Expert",
                tags: ["Binary Exploitation", "Heap", "ROP", "JOP", "Mitigations"],
                category: "reversing",
                featured: false,
                readTime: "35 min",
                slug: "advanced-binary-exploitation-techniques"
            }
        ];
        
        this.filteredWriteups = [...this.writeups];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.searchTimeout = null;
        
        // DOM element references
        this.elements = {};
        
        this.init();
    }

    /**
     * Initialize the writeups manager
     */
    init() {
        // Cache DOM elements
        this.cacheElements();
        
        // Setup event listeners and initial render
        this.setupEventListeners();
        this.renderWriteups();
        this.setupAnimations();
    }

    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        this.elements = {
            writeupsGrid: document.getElementById('writeups-grid'),
            emptyState: document.getElementById('empty-state'),
            searchInput: document.getElementById('search-input'),
            filterButtons: document.querySelectorAll('.filter-btn')
        };
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        this.setupFilters();
        this.setupSearch();
    }

    /**
     * Render writeups to the DOM
     */
    renderWriteups() {
        const { writeupsGrid, emptyState } = this.elements;

        if (!writeupsGrid || !emptyState) {
            console.error('Required DOM elements not found');
            return;
        }

        if (this.filteredWriteups.length === 0) {
            writeupsGrid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        writeupsGrid.style.display = 'grid';
        emptyState.style.display = 'none';

        const writeupsHTML = this.filteredWriteups.map((writeup, index) => 
            this.createWriteupCard(writeup, index)
        ).join('');

        writeupsGrid.innerHTML = writeupsHTML;
    }

    /**
     * Create HTML for a writeup card
     * @param {Object} writeup - Writeup data
     * @param {number} index - Index for animation delay
     * @returns {string} HTML string
     */
    createWriteupCard(writeup, index) {
        const difficultyIcon = this.getDifficultyIcon(writeup.difficulty);
        const tagsHTML = writeup.tags.map(tag => 
            `<span class="writeup-tag">${this.escapeHtml(tag)}</span>`
        ).join('');

        return `
            <div class="writeup-card reveal" style="animation-delay: ${index * 0.1}s">
                ${writeup.featured ? '<div class="featured-badge">Featured</div>' : ''}
                <div class="writeup-header">
                    <h3 class="writeup-title">${this.escapeHtml(writeup.title)}</h3>
                    <div class="writeup-meta">
                        <div class="writeup-date">
                            <i class="fas fa-calendar"></i>
                            <span>${this.formatDate(writeup.date)}</span>
                        </div>
                        <div class="writeup-difficulty">
                            <i class="fas fa-${difficultyIcon}"></i>
                            <span>${writeup.difficulty}</span>
                        </div>
                        <div class="writeup-difficulty">
                            <i class="fas fa-clock"></i>
                            <span>${writeup.readTime}</span>
                        </div>
                    </div>
                </div>
                <div class="writeup-content">
                    <p class="writeup-description">${this.escapeHtml(writeup.description)}</p>
                    <div class="writeup-tags">
                        ${tagsHTML}
                    </div>
                    <div class="writeup-actions">
                        <button class="writeup-btn writeup-btn-primary" 
                                onclick="window.writeupsManager.readWriteup('${writeup.slug}')"
                                data-slug="${writeup.slug}">
                            <i class="fas fa-book-open"></i>
                            Read Writeup
                        </button>
                        <button class="writeup-btn writeup-btn-secondary" 
                                onclick="window.writeupsManager.shareWriteup('${writeup.slug}')"
                                data-slug="${writeup.slug}">
                            <i class="fas fa-share"></i>
                            Share
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup filter functionality
     */
    setupFilters() {
        const { filterButtons } = this.elements;
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleFilterClick(button, filterButtons);
            });
        });
    }

    /**
     * Handle filter button click
     * @param {HTMLElement} clickedButton - The clicked filter button
     * @param {NodeList} allButtons - All filter buttons
     */
    handleFilterClick(clickedButton, allButtons) {
        // Update active state
        allButtons.forEach(btn => btn.classList.remove('active'));
        clickedButton.classList.add('active');
        
        // Update filter and re-render
        this.currentFilter = clickedButton.dataset.filter;
        this.filterWriteups();
    }

    /**
     * Setup search functionality
     */
    setupSearch() {
        const { searchInput } = this.elements;
        
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.searchTerm = e.target.value.toLowerCase().trim();
                this.filterWriteups();
            }, 300);
        });

        // Handle search on Enter key
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(this.searchTimeout);
                this.searchTerm = e.target.value.toLowerCase().trim();
                this.filterWriteups();
            }
        });
    }

    /**
     * Filter writeups based on current filter and search term
     */
    filterWriteups() {
        this.filteredWriteups = this.writeups.filter(writeup => {
            const matchesFilter = this.currentFilter === 'all' || writeup.category === this.currentFilter;
            const matchesSearch = this.matchesSearchTerm(writeup);
            
            return matchesFilter && matchesSearch;
        });

        this.renderWriteups();
        this.setupAnimations();
    }

    /**
     * Check if writeup matches search term
     * @param {Object} writeup - Writeup to check
     * @returns {boolean} True if matches search
     */
    matchesSearchTerm(writeup) {
        if (!this.searchTerm) return true;

        const searchFields = [
            writeup.title,
            writeup.description,
            ...writeup.tags,
            writeup.difficulty
        ];

        return searchFields.some(field => 
            field.toLowerCase().includes(this.searchTerm)
        );
    }

    /**
     * Setup animations for writeup cards
     */
    setupAnimations() {
        const cards = document.querySelectorAll('.writeup-card');
        
        cards.forEach(card => {
            // Remove existing event listeners to prevent duplicates
            card.removeEventListener('mouseenter', this.handleCardMouseEnter);
            card.removeEventListener('mouseleave', this.handleCardMouseLeave);
            
            // Add new event listeners
            card.addEventListener('mouseenter', this.handleCardMouseEnter);
            card.addEventListener('mouseleave', this.handleCardMouseLeave);
        });
    }

    /**
     * Handle card mouse enter
     * @param {Event} e - Mouse event
     */
    handleCardMouseEnter(e) {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
    }

    /**
     * Handle card mouse leave
     * @param {Event} e - Mouse event
     */
    handleCardMouseLeave(e) {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
    }

    /**
     * Format date string to readable format
     * @param {string} dateString - Date string to format
     * @returns {string} Formatted date
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    }

    /**
     * Get difficulty icon based on difficulty level
     * @param {string} difficulty - Difficulty level
     * @returns {string} Font Awesome icon name
     */
    getDifficultyIcon(difficulty) {
        const iconMap = {
            'Easy': 'signal',
            'Medium': 'signal',
            'Hard': 'signal',
            'Expert': 'fire'
        };
        return iconMap[difficulty] || 'signal';
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Handle reading a writeup
     * @param {string} slug - Writeup slug
     */
    readWriteup(slug) {
        const writeup = this.writeups.find(w => w.slug === slug);
        if (!writeup) {
            console.error('Writeup not found:', slug);
            return;
        }

        // In production, this would navigate to the writeup page
        // For demo purposes, show a modal
        this.showWriteupModal(writeup);
    }

    /**
     * Show writeup modal (demo functionality)
     * @param {Object} writeup - Writeup data
     */
    showWriteupModal(writeup) {
        const modal = this.createModal(writeup);
        document.body.appendChild(modal);

        // Focus management
        modal.focus();
        
        // Close on escape key
        const closeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
                document.removeEventListener('keydown', closeHandler);
            }
        };
        document.addEventListener('keydown', closeHandler);

        // Auto-remove after animation
        setTimeout(() => {
            if (modal.parentNode) {
                modal.classList.add('fade-in');
            }
        }, 10);
    }

    /**
     * Create modal element
     * @param {Object} writeup - Writeup data
     * @returns {HTMLElement} Modal element
     */
    createModal(writeup) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'modal-title');
        modal.setAttribute('tabindex', '-1');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modal-title">${this.escapeHtml(writeup.title)}</h2>
                    <button class="modal-close" aria-label="Close modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="writeup-preview">
                        <div class="writeup-meta-full">
                            <span><i class="fas fa-calendar"></i> ${this.formatDate(writeup.date)}</span>
                            <span><i class="fas fa-signal"></i> ${writeup.difficulty}</span>
                            <span><i class="fas fa-clock"></i> ${writeup.readTime}</span>
                        </div>
                        <p>${this.escapeHtml(writeup.description)}</p>
                        <div class="writeup-tags">
                            ${writeup.tags.map(tag => `<span class="writeup-tag">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                        <div class="placeholder-content">
                            <h3>Writeup Content</h3>
                            <p>This is a placeholder for the writeup content. In a real implementation, this would load the full writeup content from:</p>
                            <code>writeups/${writeup.slug}.md</code>
                            <p>The writeup would include detailed technical analysis, code examples, screenshots, and step-by-step explanations.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupModalStyles(modal);
        this.setupModalEvents(modal);

        return modal;
    }

    /**
     * Setup modal styles
     * @param {HTMLElement} modal - Modal element
     */
    setupModalStyles(modal) {
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(10px);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: var(--surface-color);
            border-radius: var(--border-radius-xl);
            padding: var(--spacing-2xl);
            max-height: 80vh;
            max-width: 800px;
            width: 90%;
            overflow-y: auto;
            box-shadow: var(--shadow-xl);
            border: 1px solid var(--border-color);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        `;
    }

    /**
     * Setup modal event listeners
     * @param {HTMLElement} modal - Modal element
     */
    setupModalEvents(modal) {
        const closeButton = modal.querySelector('.modal-close');
        
        closeButton.addEventListener('click', () => this.closeModal(modal));
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
    }

    /**
     * Close modal with animation
     * @param {HTMLElement} modal - Modal element to close
     */
    closeModal(modal) {
        modal.style.opacity = '0';
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    }

    /**
     * Handle sharing a writeup
     * @param {string} slug - Writeup slug
     */
    shareWriteup(slug) {
        const writeup = this.writeups.find(w => w.slug === slug);
        if (!writeup) {
            console.error('Writeup not found:', slug);
            return;
        }

        const url = `${window.location.origin}/writeups/${slug}`;
        const text = `Check out this writeup: ${writeup.title}`;

        if (navigator.share && navigator.canShare) {
            navigator.share({
                title: writeup.title,
                text: text,
                url: url
            }).catch(error => {
                console.log('Error sharing:', error);
                this.fallbackShare(text, url);
            });
        } else {
            this.fallbackShare(text, url);
        }
    }

    /**
     * Fallback share method using clipboard
     * @param {string} text - Text to share
     * @param {string} url - URL to share
     */
    fallbackShare(text, url) {
        const shareText = `${text} - ${url}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareText)
                .then(() => this.showToast('Link copied to clipboard!'))
                .catch(() => this.showToast('Unable to copy link'));
        } else {
            // Even more fallback for older browsers
            this.legacyCopyToClipboard(shareText);
        }
    }

    /**
     * Legacy clipboard copy for older browsers
     * @param {string} text - Text to copy
     */
    legacyCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '-1000px';
        textArea.style.left = '-1000px';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Link copied to clipboard!');
        } catch (error) {
            this.showToast('Unable to copy link');
        }
        
        document.body.removeChild(textArea);
    }

    /**
     * Show toast notification
     * @param {string} message - Message to show
     * @param {number} duration - Duration in milliseconds
     */
    showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = 'toast-notification';
        
        toast.style.cssText = `
            position: fixed;
            bottom: var(--spacing-xl);
            right: var(--spacing-xl);
            background: var(--primary-color);
            color: white;
            padding: var(--spacing-md) var(--spacing-lg);
            border-radius: var(--border-radius-lg);
            z-index: 1000;
            box-shadow: var(--shadow-lg);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, duration);
    }

    /**
     * Get writeup by slug
     * @param {string} slug - Writeup slug
     * @returns {Object|null} Writeup object or null
     */
    getWriteup(slug) {
        return this.writeups.find(w => w.slug === slug) || null;
    }

    /**
     * Add new writeup (for dynamic content)
     * @param {Object} writeup - Writeup data
     */
    addWriteup(writeup) {
        if (!writeup.id) {
            writeup.id = Math.max(...this.writeups.map(w => w.id)) + 1;
        }
        
        this.writeups.push(writeup);
        this.filterWriteups();
    }

    /**
     * Remove writeup by ID
     * @param {number} id - Writeup ID
     */
    removeWriteup(id) {
        this.writeups = this.writeups.filter(w => w.id !== id);
        this.filterWriteups();
    }

    /**
     * Update writeup
     * @param {number} id - Writeup ID
     * @param {Object} updates - Updates to apply
     */
    updateWriteup(id, updates) {
        const index = this.writeups.findIndex(w => w.id === id);
        if (index !== -1) {
            this.writeups[index] = { ...this.writeups[index], ...updates };
            this.filterWriteups();
        }
    }
}

// Initialize writeups manager when DOM is loaded
let writeupsManager = null;

document.addEventListener('DOMContentLoaded', () => {
    writeupsManager = new WriteupsManager();
    
    // Make available globally for onclick handlers
    window.writeupsManager = writeupsManager;
});

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WriteupsManager;
}