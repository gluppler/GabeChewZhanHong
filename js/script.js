// ===== GLOBAL VARIABLES =====
let isMenuOpen = false;
let scrollProgress = 0;
let currentTheme = 'light';

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// ===== MAIN INITIALIZATION =====
function initializeApp() {
    initializeTheme();
    initializeNavigation();
    initializeScrollEffects();
    initializeAnimations();
    initializeWriteups();
    initializeContactForm();
    initializePerformanceOptimizations();
}

// ===== THEME MANAGEMENT =====
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    setTheme(savedTheme);
    
    themeToggle?.addEventListener('click', toggleTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update theme toggle icon
    const sunIcon = document.querySelector('.theme-toggle .fa-sun');
    const moonIcon = document.querySelector('.theme-toggle .fa-moon');
    
    if (theme === 'dark') {
        sunIcon?.style.setProperty('opacity', '0.5');
        moonIcon?.style.setProperty('opacity', '1');
    } else {
        sunIcon?.style.setProperty('opacity', '1');
        moonIcon?.style.setProperty('opacity', '0.5');
    }
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// ===== NAVIGATION =====
function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');
    
    // Mobile menu toggle
    navToggle?.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        navMenu?.classList.toggle('mobile-open', isMenuOpen);
        navToggle.classList.toggle('active', isMenuOpen);
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    });
    
    // Smooth scrolling and active link highlighting
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu
                if (isMenuOpen) {
                    isMenuOpen = false;
                    navMenu?.classList.remove('mobile-open');
                    navToggle?.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    });
    
    // Navbar scroll effects
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', throttle(() => {
        const currentScrollY = window.scrollY;
        
        // Add/remove scrolled class
        navbar?.classList.toggle('scrolled', currentScrollY > 50);
        
        // Hide/show navbar on scroll
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar?.classList.add('nav-hidden');
        } else {
            navbar?.classList.remove('nav-hidden');
        }
        
        lastScrollY = currentScrollY;
        
        // Update active nav link
        updateActiveNavLink();
        
    }, 16)); // ~60fps
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let activeSection = '';
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
            activeSection = section.id;
        }
    });
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href').substring(1);
        link.classList.toggle('active', href === activeSection);
    });
}

// ===== SCROLL EFFECTS =====
function initializeScrollEffects() {
    createScrollProgressBar();
    initializeRevealAnimations();
    initializeParallaxEffects();
}

function createScrollProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);
    
    window.addEventListener('scroll', throttle(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${scrollProgress}%`;
    }, 16));
}

function initializeRevealAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Stagger child animations
                const children = entry.target.querySelectorAll('[data-stagger]');
                children.forEach((child, index) => {
                    child.style.setProperty('--stagger-delay', index);
                    child.classList.add('stagger-animation');
                });
            }
        });
    }, observerOptions);
    
    // Observe reveal elements
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
        observer.observe(el);
    });
    
    // AOS-style animations
    document.querySelectorAll('[data-aos]').forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
        observer.observe(el);
        
        el.addEventListener('animationend', () => {
            el.classList.add('aos-animate');
        });
    });
}

function initializeParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', throttle(() => {
            const scrolled = window.scrollY;
            
            parallaxElements.forEach(element => {
                const rate = scrolled * -0.5;
                element.style.transform = `translateY(${rate}px)`;
            });
        }, 16));
    }
}

// ===== ANIMATIONS =====
function initializeAnimations() {
    // Intersection Observer for animations
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    // Observe all elements with data-aos attributes
    document.querySelectorAll('[data-aos]').forEach(el => {
        animationObserver.observe(el);
    });
    
    // Initialize typing animation for hero title
    initializeTypingAnimation();
    
    // Initialize floating elements
    initializeFloatingElements();
}

function initializeTypingAnimation() {
    const typewriterElement = document.querySelector('.hero-title');
    if (typewriterElement) {
        const text = typewriterElement.textContent;
        typewriterElement.textContent = '';
        typewriterElement.classList.add('typewriter');
        
        let i = 0;
        const typeEffect = setInterval(() => {
            typewriterElement.textContent += text.charAt(i);
            i++;
            if (i > text.length) {
                clearInterval(typeEffect);
                typewriterElement.classList.remove('typewriter');
            }
        }, 100);
    }
}

function initializeFloatingElements() {
    const floatingElements = document.querySelectorAll('.animate-float');
    floatingElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.5}s`;
    });
}

// ===== WRITEUPS MANAGEMENT =====
function initializeWriteups() {
    loadFeaturedWriteups();
}

async function loadFeaturedWriteups() {
    try {
        const response = await fetch('./writeups/writeups.json');
        if (!response.ok) {
            throw new Error('Failed to load writeups');
        }
        
        const data = await response.json();
        const featuredWriteups = data.writeups.filter(writeup => writeup.featured).slice(0, 3);
        
        if (featuredWriteups.length === 0) {
            // Load placeholder writeups if none are featured
            featuredWriteups.push(
                ...generatePlaceholderWriteups().slice(0, 3)
            );
        }
        
        renderWriteups(featuredWriteups);
    } catch (error) {
        console.warn('Could not load writeups, using placeholders:', error);
        renderWriteups(generatePlaceholderWriteups().slice(0, 3));
    }
}

function generatePlaceholderWriteups() {
    return [
        {
            slug: "hardware-exploitation-framework",
            title: "Building a Hardware Exploitation Framework",
            date: "August 15, 2025",
            description: "Deep dive into creating a comprehensive framework for hardware security assessment, including firmware analysis and embedded system exploitation techniques.",
            tags: ["Hardware", "Security", "Exploitation", "Firmware"],
            featured: true
        },
        {
            slug: "rf-signal-analysis",
            title: "Advanced RF Signal Analysis Techniques",
            date: "August 10, 2025", 
            description: "Exploring software-defined radio techniques for analyzing and exploiting wireless communication protocols in security assessments.",
            tags: ["RF", "SDR", "Wireless", "Signal Processing"],
            featured: true
        },
        {
            slug: "physical-pentest-methodology",
            title: "Physical Penetration Testing Methodology",
            date: "August 5, 2025",
            description: "Comprehensive guide to physical security assessments, covering lock picking, RFID cloning, and social engineering techniques.",
            tags: ["Physical Security", "Pentesting", "RFID", "Social Engineering"],
            featured: true
        }
    ];
}

function renderWriteups(writeups) {
    const writeupGrid = document.getElementById('writeups-grid');
    if (!writeupGrid) return;
    
    writeupGrid.innerHTML = writeups.map((writeup, index) => `
        <article class="writeup-card reveal" data-aos="fade-up" data-aos-delay="${index * 100}">
            <div class="writeup-meta">
                <span class="writeup-date">${writeup.date}</span>
                <span class="writeup-read-time">5 min read</span>
            </div>
            <h3 class="writeup-title">${writeup.title}</h3>
            <p class="writeup-description">${writeup.description}</p>
            <div class="writeup-tags">
                ${writeup.tags.map(tag => `<span class="writeup-tag">${tag}</span>`).join('')}
            </div>
            <a href="writeups.html#${writeup.slug}" class="writeup-link">
                Read More <i class="fas fa-arrow-right"></i>
            </a>
        </article>
    `).join('');
}

// ===== CONTACT FORM =====
function initializeContactForm() {
    // Add smooth scrolling to contact links
    const contactLinks = document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]');
    contactLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Add a subtle animation when clicking contact links
            link.style.transform = 'scale(0.95)';
            setTimeout(() => {
                link.style.transform = '';
            }, 150);
        });
    });
    
    // Add hover effects to social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateX(8px)';
        });
        
        link.addEventListener('mouseleave', () => {
            link.style.transform = '';
        });
    });
}

// ===== PERFORMANCE OPTIMIZATIONS =====
function initializePerformanceOptimizations() {
    // Lazy loading for images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('loading');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
        img.classList.add('loading');
    });
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Initialize service worker for caching
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    }
}

function preloadCriticalResources() {
    const criticalResources = [
        './css/styles.css',
        './css/animations.css',
        './public/profile.jpeg'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'image';
        document.head.appendChild(link);
    });
}

// ===== UTILITY FUNCTIONS =====
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', (e) => {
    // Close mobile menu with Escape
    if (e.key === 'Escape' && isMenuOpen) {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.querySelector('.nav-menu');
        isMenuOpen = false;
        navMenu?.classList.remove('mobile-open');
        navToggle?.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Theme toggle with T key
    if (e.key === 't' || e.key === 'T') {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleTheme();
        }
    }
});

// ===== SCROLL TO TOP FUNCTIONALITY =====
function initializeScrollToTop() {
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollToTopBtn);
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', throttle(() => {
        scrollToTopBtn.classList.toggle('visible', window.scrollY > 500);
    }, 100));
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // Could send error to analytics service here
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    // Could send error to analytics service here
});

// ===== INITIALIZE ON LOAD =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}