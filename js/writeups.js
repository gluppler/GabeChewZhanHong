// ===== WRITEUPS PAGE FUNCTIONALITY =====
class WriteupManager {
    constructor() {
        this.writeups = [];
        this.filteredWriteups = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.modal = null;
        
        this.init();
    }
    
    async init() {
        this.setupDOM();
        this.setupEventListeners();
        await this.loadWriteups();
        this.setupSearch();
        this.setupFilters();
        this.setupModal();
        this.handleDeepLinks();
    }
    
    setupDOM() {
        this.elements = {
            grid: document.getElementById('writeups-grid'),
            loading: document.getElementById('loading-container'),
            noResults: document.getElementById('no-results'),
            searchInput: document.getElementById('searchInput'),
            filterTags: document.getElementById('filterTags'),
            modal: document.getElementById('writeup-modal'),
            modalTitle: document.getElementById('modal-title'),
            modalBody: document.getElementById('modal-body'),
            modalClose: document.getElementById('modal-close'),
            modalOverlay: document.getElementById('modal-overlay'),
            totalWriteups: document.getElementById('totalWriteups'),
            totalViews: document.getElementById('totalViews'),
            avgReadTime: document.getElementById('avgReadTime')
        };
    }
    
    setupEventListeners() {
        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        newsletterForm?.addEventListener('submit', this.handleNewsletterSubmit.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }
    
    async loadWriteups() {
        try {
            const response = await fetch('./writeups/writeups.json');
            if (!response.ok) throw new Error('Failed to load writeups');
            
            const data = await response.json();
            this.writeups = data.writeups || this.generatePlaceholderWriteups();
            
        } catch (error) {
            console.warn('Could not load writeups JSON, using placeholders:', error);
            this.writeups = this.generatePlaceholderWriteups();
        }
        
        this.filteredWriteups = [...this.writeups];
        this.updateStats();
        this.renderWriteups();
        this.hideLoading();
    }
    
    generatePlaceholderWriteups() {
        return [
            {
                slug: "example-1",
                title: "Building a Comprehensive Hardware Exploitation Framework",
                date: "August 20, 2025",
                description: "A deep dive into creating a modular framework for hardware security assessment, covering firmware analysis, JTAG debugging, and embedded system exploitation techniques.",
                tags: ["hardware", "security", "exploitation", "firmware"],
                featured: true,
                readTime: 12,
                views: 2847
            },
            {
                slug: "rf-signal-analysis-sdr",
                title: "Advanced RF Signal Analysis with Software-Defined Radio",
                date: "August 18, 2025",
                description: "Exploring SDR techniques for analyzing and exploiting wireless protocols, including Bluetooth Low Energy, WiFi, and proprietary RF communications.",
                tags: ["rf", "sdr", "wireless", "security"],
                featured: true,
                readTime: 15,
                views: 3421
            },
            {
                slug: "physical-pentest-methodology",
                title: "Modern Physical Penetration Testing Methodology",
                date: "August 15, 2025",
                description: "A comprehensive guide to physical security assessments, covering lock picking, RFID cloning, social engineering, and covert entry techniques.",
                tags: ["physical", "security", "pentest", "methodology"],
                featured: true,
                readTime: 10,
                views: 1932
            },
            {
                slug: "firmware-reverse-engineering",
                title: "Firmware Reverse Engineering: From Binary to Vulnerability",
                date: "August 12, 2025",
                description: "Step-by-step process of reverse engineering embedded firmware, identifying vulnerabilities, and developing proof-of-concept exploits.",
                tags: ["firmware", "reverse-engineering", "exploitation", "security"],
                featured: false,
                readTime: 18,
                views: 2156
            },
            {
                slug: "iot-device-security-assessment",
                title: "IoT Device Security Assessment Framework",
                date: "August 10, 2025",
                description: "Systematic approach to evaluating IoT device security, including network analysis, firmware extraction, and hardware-based attacks.",
                tags: ["iot", "security", "hardware", "assessment"],
                featured: false,
                readTime: 8,
                views: 1678
            },
            {
                slug: "social-engineering-physical-access",
                title: "Social Engineering for Physical Access Control",
                date: "August 8, 2025",
                description: "Advanced social engineering techniques specifically designed for gaining physical access to restricted areas during security assessments.",
                tags: ["social-engineering", "physical", "security", "access-control"],
                featured: false,
                readTime: 6,
                views: 987
            },
            {
                slug: "bluetooth-le-exploitation",
                title: "Bluetooth Low Energy Security: Attacks and Defenses",
                date: "August 5, 2025",
                description: "Comprehensive analysis of BLE security mechanisms, common attack vectors, and practical exploitation techniques.",
                tags: ["bluetooth", "wireless", "security", "exploitation"],
                featured: false,
                readTime: 11,
                views: 1543
            },
            {
                slug: "embedded-linux-rootkit",
                title: "Developing Embedded Linux Rootkits for Red Team Operations",
                date: "August 2, 2025",
                description: "Creating persistent access mechanisms in embedded Linux systems through kernel-level rootkit development.",
                tags: ["linux", "rootkit", "embedded", "red-team"],
                featured: false,
                readTime: 14,
                views: 2089
            }
        ];
    }
    
    updateStats() {
        const totalViews = this.writeups.reduce((sum, w) => sum + (w.views || 0), 0);
        const avgReadTime = Math.round(this.writeups.reduce((sum, w) => sum + (w.readTime || 8), 0) / this.writeups.length);
        
        this.animateCounter(this.elements.totalWriteups, this.writeups.length);
        this.animateCounter(this.elements.totalViews, totalViews, (num) => this.formatNumber(num));
        this.animateCounter(this.elements.avgReadTime, avgReadTime);
    }
    
    animateCounter(element, target, formatter = (n) => n) {
        if (!element) return;
        
        let current = 0;
        const increment = target / 30;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = formatter(Math.floor(current));
        }, 50);
    }
    
    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    setupSearch() {
        this.elements.searchInput?.addEventListener('input', 
            this.debounce((e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.applyFilters();
            }, 300)
        );
    }
    
    setupFilters() {
        const filterButtons = this.elements.filterTags?.querySelectorAll('.filter-tag');
        filterButtons?.forEach(button => {
            button.addEventListener('click', () => {
                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Apply filter
                this.currentFilter = button.dataset.filter;
                this.applyFilters();
            });
        });
    }
    
    applyFilters() {
        this.filteredWriteups = this.writeups.filter(writeup => {
            const matchesSearch = this.searchQuery === '' || 
                writeup.title.toLowerCase().includes(this.searchQuery) ||
                writeup.description.toLowerCase().includes(this.searchQuery) ||
                writeup.tags.some(tag => tag.toLowerCase().includes(this.searchQuery));
            
            const matchesFilter = this.currentFilter === 'all' || 
                writeup.tags.includes(this.currentFilter);
            
            return matchesSearch && matchesFilter;
        });
        
        this.renderWriteups();
    }
    
    renderWriteups() {
        if (!this.elements.grid) return;
        
        if (this.filteredWriteups.length === 0) {
            this.elements.grid.innerHTML = '';
            this.elements.noResults.style.display = 'block';
            return;
        }
        
        this.elements.noResults.style.display = 'none';
        
        this.elements.grid.innerHTML = this.filteredWriteups.map((writeup, index) => `
            <article class="writeup-card reveal" data-aos="fade-up" data-aos-delay="${index * 50}">
                <div class="writeup-header">
                    <div class="writeup-meta">
                        <span class="writeup-date">
                            <i class="fas fa-calendar"></i>
                            ${writeup.date}
                        </span>
                        <span class="writeup-read-time">
                            <i class="fas fa-clock"></i>
                            ${writeup.readTime || 8} min read
                        </span>
                        ${writeup.views ? `
                            <span class="writeup-views">
                                <i class="fas fa-eye"></i>
                                ${this.formatNumber(writeup.views)}
                            </span>
                        ` : ''}
                    </div>
                    ${writeup.featured ? '<span class="writeup-featured">Featured</span>' : ''}
                </div>
                
                <h3 class="writeup-title">${writeup.title}</h3>
                <p class="writeup-description">${writeup.description}</p>
                
                <div class="writeup-tags">
                    ${writeup.tags.map(tag => `
                        <span class="writeup-tag" data-tag="${tag}">${tag}</span>
                    `).join('')}
                </div>
                
                <div class="writeup-footer">
                    <button class="writeup-read-btn" data-slug="${writeup.slug}">
                        Read Full Article <i class="fas fa-arrow-right"></i>
                    </button>
                    <div class="writeup-actions">
                        <button class="writeup-action" data-action="share" data-slug="${writeup.slug}" aria-label="Share">
                            <i class="fas fa-share-alt"></i>
                        </button>
                        <button class="writeup-action" data-action="bookmark" data-slug="${writeup.slug}" aria-label="Bookmark">
                            <i class="fas fa-bookmark"></i>
                        </button>
                    </div>
                </div>
            </article>
        `).join('');
        
        // Add event listeners to new elements
        this.setupWriteupCardListeners();
        
        // Trigger animations
        this.triggerAnimations();
    }
    
    setupWriteupCardListeners() {
        // Read buttons
        document.querySelectorAll('.writeup-read-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slug = e.target.dataset.slug;
                this.openWriteup(slug);
            });
        });
        
        // Tag filters
        document.querySelectorAll('.writeup-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const tagValue = e.target.dataset.tag;
                this.setFilter(tagValue);
            });
        });
        
        // Action buttons
        document.querySelectorAll('.writeup-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = e.target.closest('.writeup-action').dataset.action;
                const slug = e.target.closest('.writeup-action').dataset.slug;
                this.handleWriteupAction(action, slug);
            });
        });
    }
    
    setFilter(tag) {
        // Update filter UI
        const filterButtons = this.elements.filterTags?.querySelectorAll('.filter-tag');
        filterButtons?.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === tag);
        });
        
        this.currentFilter = tag;
        this.applyFilters();
    }
    
    setupModal() {
        // Close modal listeners
        this.elements.modalClose?.addEventListener('click', () => this.closeModal());
        this.elements.modalOverlay?.addEventListener('click', () => this.closeModal());
        
        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }
    
    async openWriteup(slug) {
        const writeup = this.writeups.find(w => w.slug === slug);
        if (!writeup) return;
        
        // Update URL
        window.history.pushState({writeup: slug}, '', `#${slug}`);
        
        // Show modal
        this.elements.modal.classList.add('active');
        this.elements.modalTitle.textContent = writeup.title;
        this.elements.modalBody.innerHTML = '<div class="loading-spinner"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div>';
        
        document.body.style.overflow = 'hidden';
        
        try {
            // Try to load markdown file
            const response = await fetch(`./writeups/${slug}.md`);
            if (response.ok) {
                const markdown = await response.text();
                const html = marked.parse(markdown);
                this.elements.modalBody.innerHTML = html;
            } else {
                // Fallback to generated content
                this.elements.modalBody.innerHTML = this.generateWriteupContent(writeup);
            }
            
            // Highlight code blocks
            if (typeof Prism !== 'undefined') {
                Prism.highlightAllUnder(this.elements.modalBody);
            }
            
        } catch (error) {
            console.error('Error loading writeup:', error);
            this.elements.modalBody.innerHTML = this.generateWriteupContent(writeup);
        }
    }
    
    generateWriteupContent(writeup) {
        return `
            <div class="writeup-content">
                <div class="writeup-meta-full">
                    <span class="writeup-date">${writeup.date}</span>
                    <span class="writeup-read-time">${writeup.readTime || 8} min read</span>
                    ${writeup.views ? `<span class="writeup-views">${this.formatNumber(writeup.views)} views</span>` : ''}
                </div>
                
                <div class="writeup-tags-full">
                    ${writeup.tags.map(tag => `<span class="writeup-tag">${tag}</span>`).join('')}
                </div>
                
                <div class="writeup-body">
                    <h2>Overview</h2>
                    <p>${writeup.description}</p>
                    
                    <h2>Technical Details</h2>
                    <p>This is a placeholder for the full technical write-up. In a real implementation, this content would be loaded from markdown files or a content management system.</p>
                    
                    <h3>Key Findings</h3>
                    <ul>
                        <li>Detailed analysis of security vulnerabilities</li>
                        <li>Proof-of-concept exploit development</li>
                        <li>Recommendations for remediation</li>
                        <li>Impact assessment and risk analysis</li>
                    </ul>
                    
                    <h3>Code Example</h3>
                    <pre><code class="language-python">
# Example security assessment script
import socket
import sys

def scan_target(host, port):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception as e:
        return False

# Usage example
if __name__ == "__main__":
    target_host = "192.168.1.100"
    target_port = 22
    
    if scan_target(target_host, target_port):
        print(f"Port {target_port} is open on {target_host}")
    else:
        print(f"Port {target_port} is closed on {target_host}")
                    </code></pre>
                    
                    <h2>Conclusion</h2>
                    <p>This research demonstrates the importance of comprehensive security assessment methodologies in identifying and mitigating potential vulnerabilities in modern systems.</p>
                    
                    <div class="writeup-footer-full">
                        <div class="writeup-author">
                            <strong>Author:</strong> Gabe Chew Zhan Hong<br>
                            <strong>Published:</strong> ${writeup.date}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    closeModal() {
        this.elements.modal?.classList.remove('active');
        document.body.style.overflow = '';
        
        // Update URL
        window.history.pushState({}, '', window.location.pathname);
    }
    
    handleWriteupAction(action, slug) {
        switch (action) {
            case 'share':
                this.shareWriteup(slug);
                break;
            case 'bookmark':
                this.bookmarkWriteup(slug);
                break;
        }
    }
    
    shareWriteup(slug) {
        const url = `${window.location.origin}${window.location.pathname}#${slug}`;
        
        if (navigator.share) {
            const writeup = this.writeups.find(w => w.slug === slug);
            navigator.share({
                title: writeup?.title || 'Technical Write-up',
                text: writeup?.description || 'Security research by Gabe Chew Zhan Hong',
                url: url
            });
        } else {
            navigator.clipboard.writeText(url).then(() => {
                this.showToast('Link copied to clipboard!');
            }).catch(() => {
                this.showToast('Unable to copy link');
            });
        }
    }
    
    bookmarkWriteup(slug) {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarked-writeups') || '[]');
        const isBookmarked = bookmarks.includes(slug);
        
        if (isBookmarked) {
            const index = bookmarks.indexOf(slug);
            bookmarks.splice(index, 1);
            this.showToast('Removed from bookmarks');
        } else {
            bookmarks.push(slug);
            this.showToast('Added to bookmarks');
        }
        
        localStorage.setItem('bookmarked-writeups', JSON.stringify(bookmarks));
        this.updateBookmarkIcons();
    }
    
    updateBookmarkIcons() {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarked-writeups') || '[]');
        document.querySelectorAll('.writeup-action[data-action="bookmark"]').forEach(btn => {
            const slug = btn.dataset.slug;
            const icon = btn.querySelector('i');
            if (bookmarks.includes(slug)) {
                icon.className = 'fas fa-bookmark';
                btn.classList.add('active');
            } else {
                icon.className = 'far fa-bookmark';
                btn.classList.remove('active');
            }
        });
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
    
    handleDeepLinks() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            // Wait for writeups to load, then open the specified one
            setTimeout(() => {
                this.openWriteup(hash);
            }, 500);
        }
    }
    
    handleNewsletterSubmit(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        
        // Simulate newsletter signup
        this.showToast('Thanks for subscribing! You\'ll receive updates on new write-ups.');
        e.target.reset();
        
        // In a real implementation, this would make an API call
        console.log('Newsletter signup:', email);
    }
    
    handleKeydown(e) {
        // Keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    this.elements.searchInput?.focus();
                    break;
            }
        }
    }
    
    hideLoading() {
        this.elements.loading?.style.setProperty('display', 'none');
    }
    
    triggerAnimations() {
        // Trigger reveal animations for new elements
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new WriteupManager());
} else {
    new WriteupManager();
}

// Additional CSS for writeups page functionality
const writeupStyles = `
.writeups-hero {
    padding: calc(80px + 4rem) 0 4rem;
    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
    text-align: center;
}

.writeups-hero-title {
    font-size: var(--text-5xl);
    font-weight: 800;
    margin-bottom: var(--space-6);
    background: linear-gradient(135deg, var(--text-primary), var(--color-primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.writeups-hero-description {
    font-size: var(--text-lg);
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto var(--space-12);
    line-height: 1.6;
}

.writeups-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-8);
    max-width: 500px;
    margin: 0 auto;
}

.writeups-filters {
    padding: var(--space-8) 0;
    background-color: var(--bg-secondary);
    border-bottom: var(--border-width) solid var(--border-color);
}

.filters-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--space-8);
    align-items: center;
}

.filter-search {
    position: relative;
}

.search-input {
    width: 100%;
    padding: var(--space-3) var(--space-4) var(--space-3) var(--space-12);
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-size: var(--text-base);
    transition: all var(--transition-base);
}

.search-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.search-icon {
    position: absolute;
    left: var(--space-4);
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    font-size: var(--text-sm);
}

.filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    justify-content: flex-end;
}

.filter-tag {
    padding: var(--space-2) var(--space-4);
    background-color: var(--bg-primary);
    color: var(--text-secondary);
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.filter-tag:hover,
.filter-tag.active {
    background-color: var(--color-primary);
    color: var(--color-white);
    border-color: var(--color-primary);
}

.writeups-content {
    padding: var(--space-16) 0;
}

.writeup-card {
    background-color: var(--bg-secondary);
    border-radius: var(--border-radius-xl);
    padding: var(--space-6);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-base);
    height: fit-content;
}

.writeup-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
}

.writeup-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-4);
}

.writeup-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    font-size: var(--text-xs);
    color: var(--text-muted);
}

.writeup-meta span {
    display: flex;
    align-items: center;
    gap: var(--space-1);
}

.writeup-featured {
    padding: var(--space-1) var(--space-3);
    background-color: var(--color-primary);
    color: var(--color-white);
    font-size: var(--text-xs);
    font-weight: 600;
    border-radius: var(--border-radius);
}

.writeup-title {
    font-size: var(--text-xl);
    font-weight: 700;
    margin-bottom: var(--space-3);
    color: var(--text-primary);
    line-height: 1.3;
}

.writeup-description {
    color: var(--text-secondary);
    margin-bottom: var(--space-6);
    line-height: 1.6;
}

.writeup-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
}

.writeup-tag {
    padding: var(--space-1) var(--space-2);
    background-color: var(--bg-tertiary);
    color: var(--text-muted);
    font-size: var(--text-xs);
    font-weight: 500;
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.writeup-tag:hover {
    background-color: var(--color-primary);
    color: var(--color-white);
}

.writeup-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.writeup-read-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background-color: var(--color-primary);
    color: var(--color-white);
    border: none;
    border-radius: var(--border-radius);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.writeup-read-btn:hover {
    background-color: var(--color-primary-dark);
    transform: translateX(2px);
}

.writeup-actions {
    display: flex;
    gap: var(--space-2);
}

.writeup-action {
    width: 36px;
    height: 36px;
    background-color: transparent;
    color: var(--text-muted);
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.writeup-action:hover,
.writeup-action.active {
    background-color: var(--color-primary);
    color: var(--color-white);
    border-color: var(--color-primary);
}

.loading-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--grid-gap);
}

.writeup-card-skeleton {
    height: 300px;
    border-radius: var(--border-radius-xl);
}

.no-results {
    text-align: center;
    padding: var(--space-16) 0;
}

.no-results-icon {
    font-size: var(--text-6xl);
    color: var(--text-muted);
    margin-bottom: var(--space-6);
}

.no-results h3 {
    font-size: var(--text-2xl);
    margin-bottom: var(--space-4);
}

.no-results p {
    color: var(--text-secondary);
}

.newsletter-section {
    background-color: var(--bg-secondary);
    padding: var(--space-16) 0;
    border-top: var(--border-width) solid var(--border-color);
}

.newsletter-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--grid-gap);
    align-items: center;
    max-width: 800px;
    margin: 0 auto;
}

.newsletter-text h3 {
    font-size: var(--text-2xl);
    font-weight: 700;
    margin-bottom: var(--space-4);
}

.newsletter-text p {
    color: var(--text-secondary);
}

.newsletter-input-group {
    display: flex;
    gap: var(--space-3);
}

.newsletter-input {
    flex: 1;
    padding: var(--space-3) var(--space-4);
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-size: var(--text-base);
}

.newsletter-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: var(--z-modal);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-base);
}

.modal.active {
    opacity: 1;
    visibility: visible;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
}

.modal-content {
    position: relative;
    width: 90%;
    max-width: 800px;
    max-height: 90%;
    background-color: var(--bg-primary);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--shadow-xl);
    overflow: hidden;
    transform: scale(0.9);
    transition: transform var(--transition-base);
}

.modal.active .modal-content {
    transform: scale(1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-6);
    border-bottom: var(--border-width) solid var(--border-color);
}

.modal-title {
    font-size: var(--text-2xl);
    font-weight: 700;
    margin: 0;
}

.modal-close {
    width: 40px;
    height: 40px;
    background-color: transparent;
    color: var(--text-muted);
    border: none;
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.modal-close:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
}

.modal-body {
    padding: var(--space-6);
    max-height: calc(90vh - 120px);
    overflow-y: auto;
}

.writeup-content h2,
.writeup-content h3 {
    color: var(--text-primary);
    margin-top: var(--space-8);
    margin-bottom: var(--space-4);
}

.writeup-content pre {
    background-color: var(--bg-tertiary);
    padding: var(--space-4);
    border-radius: var(--border-radius);
    overflow-x: auto;
    margin: var(--space-6) 0;
}

.writeup-content code {
    background-color: var(--bg-tertiary);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--border-radius-sm);
    font-family: var(--font-family-mono);
    font-size: var(--text-sm);
}

.writeup-content pre code {
    background-color: transparent;
    padding: 0;
}

.writeup-meta-full {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    font-size: var(--text-sm);
    color: var(--text-muted);
    margin-bottom: var(--space-6);
    padding-bottom: var(--space-4);
    border-bottom: var(--border-width) solid var(--border-color);
}

.writeup-tags-full {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-8);
}

.writeup-footer-full {
    margin-top: var(--space-8);
    padding-top: var(--space-6);
    border-top: var(--border-width) solid var(--border-color);
}

.writeup-author {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.6;
}

.toast {
    position: fixed;
    bottom: var(--space-6);
    right: var(--space-6);
    background-color: var(--color-primary);
    color: var(--color-white);
    padding: var(--space-4) var(--space-6);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-lg);
    z-index: var(--z-tooltip);
    transform: translateY(100px);
    opacity: 0;
    transition: all var(--transition-base);
}

.toast.show {
    transform: translateY(0);
    opacity: 1;
}

@media (max-width: 768px) {
    .writeups-hero-title {
        font-size: var(--text-4xl);
    }
    
    .writeups-stats {
        grid-template-columns: 1fr;
        gap: var(--space-4);
    }
    
    .filters-container {
        grid-template-columns: 1fr;
        gap: var(--space-4);
    }
    
    .filter-tags {
        justify-content: flex-start;
    }
    
    .newsletter-content {
        grid-template-columns: 1fr;
        text-align: center;
    }
    
    .newsletter-input-group {
        flex-direction: column;
    }
    
    .modal-content {
        width: 95%;
    }
    
    .writeup-footer {
        flex-direction: column;
        gap: var(--space-4);
        align-items: stretch;
    }
    
    .writeup-actions {
        justify-content: center;
    }
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = writeupStyles;
document.head.appendChild(styleSheet);