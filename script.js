// Blog posts manager
class BlogManager {
    constructor() {
        this.posts = [];
        this.postsDirectory = './posts/';
    }

    // Load posts from posts.json manifest
    async loadPosts() {
        try {
            const response = await fetch('./posts/posts.json');
            const postsManifest = await response.json();
            this.posts = postsManifest.posts || [];
            return this.posts;
        } catch (error) {
            console.error('Error loading posts manifest:', error);
            // Fallback to hardcoded posts if manifest fails
            this.posts = this.getFallbackPosts();
            return this.posts;
        }
    }

    // Load individual post content
    async loadPostContent(slug) {
        try {
            const response = await fetch(`${this.postsDirectory}${slug}.md`);
            if (!response.ok) throw new Error('Post not found');
            return await response.text();
        } catch (error) {
            console.error(`Error loading post ${slug}:`, error);
            return this.getFallbackPostContent(slug);
        }
    }

    // Fallback posts for when manifest/files are not available
    getFallbackPosts() {
        return [
            {
                "slug": "assembly-deep-dive",
                "title": "A Journey into Assembly Language",
                "date": "August 18, 2025",
                "description": "An exploration of low-level programming with practical examples in ARM64 and x86-64 for security research.",
                "image": "https://placehold.co/600x400/1E293B/E2E8F0?text=Assembly",
                "tags": ["assembly", "programming", "security"]
            },
            {
                "slug": "the-needle-writeup",
                "title": "HackTheBox Write-up: The Needle",
                "date": "August 15, 2025",
                "description": "A firmware analysis challenge involving ARM boot executable reverse engineering and credential extraction.",
                "image": "https://placehold.co/600x400/1E293B/E2E8F0?text=The+Needle",
                "tags": ["hackthebox", "firmware", "reverse-engineering"]
            },
            {
                "slug": "rflag-writeup",
                "title": "HackTheBox Write-up: RFlag",
                "date": "August 12, 2025",
                "description": "A radio frequency challenge involving complex signal analysis using rtl_433 to decode .cf32 files.",
                "image": "https://placehold.co/600x400/1E293B/E2E8F0?text=RFlag+RF",
                "tags": ["hackthebox", "radio", "signal-analysis"]
            },
            {
                "slug": "qsstv-challenge",
                "title": "QSSTV Challenge: Slow-Scan Television Decoding",
                "date": "August 10, 2025",
                "description": "A radio challenge involving slow-scan television (SSTV) signal decoding using QSSTV software.",
                "image": "https://placehold.co/600x400/1E293B/E2E8F0?text=SSTV+Radio",
                "tags": ["radio", "sstv", "signal-processing"]
            },
            {
                "slug": "trace-challenge-writeup",
                "title": "HackTheBox Write-up: Trace",
                "date": "August 18, 2025",
                "description": "A hardware challenge involving GPIO signal analysis from a Raspberry Pi to reverse engineer an 8x8 LED matrix display.",
                "image": "https://placehold.co/600x400/1E293B/E2E8F0?text=Trace+Challenge",
                "tags": ["hackthebox", "hardware", "gpio"]
            },
            {
                "slug": "low-logic-challenge-writeup",
                "title": "HackTheBox Write-up: Low Logic",
                "date": "August 18, 2025",
                "description": "A detailed walkthrough of the 'Low Logic' hardware challenge from HackTheBox, involving reverse engineering a digital logic circuit.",
                "image": "https://placehold.co/600x400/1E293B/E2E8F0?text=Low+Logic",
                "tags": ["hackthebox", "hardware", "digital-logic"]
            }
        ];
    }

    // Fallback content for individual posts
    getFallbackPostContent(slug) {
        const fallbackContents = {
            "assembly-deep-dive": `# A Journey into Assembly Language for ARM64 & x86-64

Understanding how software interacts with hardware at the lowest levels is a critical skill in security research...

[Content would continue here - this is fallback content when markdown files aren't available]`,
            "the-needle-writeup": `# HackTheBox Write-up: The Needle

## Challenge Overview

The Needle is a hardware challenge from HackTheBox that focuses on firmware analysis...

[Content continues...]`,
            // Add more fallback content as needed
        };
        
        return fallbackContents[slug] || `# ${slug}\n\nContent not available. Please check if the markdown file exists.`;
    }
}

// Application state
let currentPage = 'home';
const blogManager = new BlogManager();

// Theme management
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconLight = document.getElementById('theme-icon-light');
    const themeIconDark = document.getElementById('theme-icon-dark');
    const htmlEl = document.documentElement;

    const setTheme = (theme) => {
        htmlEl.classList.remove('light', 'dark');
        htmlEl.classList.add(theme);
        
        if (theme === 'dark') {
            themeIconLight?.classList.remove('hidden');
            themeIconDark?.classList.add('hidden');
        } else {
            themeIconLight?.classList.add('hidden');
            themeIconDark?.classList.remove('hidden');
        }
    };

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');

    themeToggle?.addEventListener('click', () => {
        const currentTheme = htmlEl.classList.contains('dark') ? 'dark' : 'light';
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-container').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageId;
    }
    
    // Close mobile menu if open
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu?.classList.add('hidden');
    
    // Trigger scroll animations for newly visible page
    setTimeout(() => {
        initScrollAnimations();
        if (pageId === 'blog') {
            loadBlogPosts();
        }
    }, 100);
}

// Scroll to section (for same-page navigation)
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Mobile menu toggle
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuButton?.addEventListener('click', () => {
        mobileMenu?.classList.toggle('hidden');
    });
}

// Scroll animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.scroll-animate');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => {
        el.classList.remove('is-visible');
        observer.observe(el);
    });
}

// Load blog posts
async function loadBlogPosts() {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;

    postsContainer.innerHTML = '<div class="col-span-full text-center">Loading posts...</div>';
    
    try {
        const posts = await blogManager.loadPosts();
        postsContainer.innerHTML = '';
        
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'card-bg rounded-lg shadow-lg overflow-hidden animated-card cursor-pointer';
            postElement.innerHTML = `
                <img src="${post.image}" alt="${post.title}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <p class="text-sm opacity-60 mb-2">${post.date}</p>
                    <h3 class="text-xl font-bold mb-2">${post.title}</h3>
                    <p class="opacity-80 mb-4">${post.description}</p>
                    ${post.tags ? `<div class="flex flex-wrap gap-2 mb-4">
                        ${post.tags.map(tag => `<span class="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">${tag}</span>`).join('')}
                    </div>` : ''}
                    <span class="accent-text font-semibold hover:underline">Read More →</span>
                </div>
            `;
            
            postElement.addEventListener('click', () => openPost(post));
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        postsContainer.innerHTML = '<div class="col-span-full text-center text-red-500">Error loading posts. Please try again later.</div>';
        console.error('Error loading blog posts:', error);
    }
}

// Open post in modal
async function openPost(post) {
    const modal = document.getElementById('post-modal');
    const title = document.getElementById('modal-post-title');
    const meta = document.getElementById('modal-post-meta');
    const body = document.getElementById('modal-post-body');
    
    title.textContent = post.title;
    meta.textContent = `By Gabe Chew Zhan Hong • ${post.date}`;
    body.innerHTML = 'Loading...';
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    try {
        const content = await blogManager.loadPostContent(post.slug);
        body.innerHTML = marked.parse(content);
    } catch (error) {
        body.innerHTML = '<p>Error loading post content. Please try again later.</p>';
        console.error('Error loading post content:', error);
    }
}

// Close post modal
function closePost() {
    const modal = document.getElementById('post-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initScrollAnimations();
    
    // Close modal handlers
    const modal = document.getElementById('post-modal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn?.addEventListener('click', closePost);
    
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePost();
        }
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.style.display === 'block') {
            closePost();
        }
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar?.classList.add('border-b', 'border-color');
        } else {
            navbar?.classList.remove('border-b', 'border-color');
        }
    });
});

// Make functions globally available
window.showPage = showPage;
window.scrollToSection = scrollToSection;