/**
 * Portfolio Website JavaScript
 * Author: Gabe Chew Zhan Hong
 * Description: Interactive functionality for portfolio website
 */

class PortfolioApp {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.initTheme();
    this.initScrollAnimations();
    this.initNavigation();
    this.initContactForm();
    this.initSmoothScrolling();
    this.initIntersectionObserver();
    this.initParallaxEffects();
  }

  /**
   * Bind all event listeners
   */
  bindEvents() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleTheme.bind(this));
    }

    // Mobile navigation
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => this.toggleMobileNav(navToggle, navMenu));
    }

    // Navigation links
    const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
    navLinks.forEach(link => {
      link.addEventListener('click', this.handleNavClick.bind(this));
    });

    // Window events
    window.addEventListener('scroll', this.handleScroll.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('load', this.handleLoad.bind(this));

    // Form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    // Project card interactions
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      card.addEventListener('mouseenter', this.handleProjectHover.bind(this));
      card.addEventListener('mouseleave', this.handleProjectLeave.bind(this));
    });
  }

  /**
   * Initialize theme functionality
   */
  initTheme() {
    // Check for saved theme or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemPreference;
    
    this.setTheme(theme);
    this.updateThemeIcon(theme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    this.setTheme(newTheme);
    this.updateThemeIcon(newTheme);
    localStorage.setItem('theme', newTheme);
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  /**
   * Update theme toggle icon
   */
  updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  /**
   * Initialize scroll animations
   */
  initScrollAnimations() {
    // Add animation classes to elements
    const animatedElements = [
      { selector: '.hero__content > *', animation: 'fade-up' },
      { selector: '.section__header', animation: 'fade-up' },
      { selector: '.about__content', animation: 'fade-right' },
      { selector: '.about__education', animation: 'fade-left' },
      { selector: '.experience__item', animation: 'fade-up' },
      { selector: '.project-card', animation: 'scale-up' },
      { selector: '.skills__category', animation: 'fade-up' },
      { selector: '.contact__content', animation: 'fade-right' },
      { selector: '.contact__form', animation: 'fade-left' }
    ];

    animatedElements.forEach(({ selector, animation }) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el, index) => {
        el.classList.add('animate-on-scroll', animation);
        el.style.animationDelay = `${index * 0.1}s`;
      });
    });
  }

  /**
   * Initialize navigation functionality
   */
  initNavigation() {
    // Update active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link[href^="#"]');

    // Create intersection observer for nav highlighting
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to current section link
            const activeLink = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
            if (activeLink) {
              activeLink.classList.add('active');
            }
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' }
    );

    sections.forEach(section => navObserver.observe(section));
  }

  /**
   * Toggle mobile navigation
   */
  toggleMobileNav(navToggle, navMenu) {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  /**
   * Handle navigation link clicks
   */
  handleNavClick(e) {
    const href = e.currentTarget.getAttribute('href');
    
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // Close mobile menu if open
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        if (navMenu?.classList.contains('active')) {
          navMenu.classList.remove('active');
          navToggle?.classList.remove('active');
          document.body.style.overflow = '';
        }

        // Smooth scroll to target
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }

  /**
   * Initialize contact form
   */
  initContactForm() {
    const formInputs = document.querySelectorAll('.form__input');
    
    formInputs.forEach(input => {
      // Add placeholder for floating labels
      if (!input.hasAttribute('placeholder')) {
        input.setAttribute('placeholder', ' ');
      }

      // Handle input focus and blur
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });

      input.addEventListener('blur', () => {
        if (!input.value.trim()) {
          input.parentElement.classList.remove('focused');
        }
      });

      // Check if input has value on load
      if (input.value.trim()) {
        input.parentElement.classList.add('focused');
      }
    });
  }

  /**
   * Handle form submission
   */
  handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Get form values
    const name = formData.get('name') || document.getElementById('name').value;
    const email = formData.get('email') || document.getElementById('email').value;
    const message = formData.get('message') || document.getElementById('message').value;
    
    // Basic validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      this.showNotification('Please fill in all fields', 'error');
      return;
    }

    if (!this.isValidEmail(email)) {
      this.showNotification('Please enter a valid email address', 'error');
      return;
    }

    // Show loading state
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;

    // Simulate form submission (replace with actual form handling)
    setTimeout(() => {
      // Create mailto link
      const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      const mailtoLink = `mailto:chewzhanhongint@gmail.com?subject=${subject}&body=${body}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Reset form
      form.reset();
      document.querySelectorAll('.form__group.focused').forEach(group => {
        group.classList.remove('focused');
      });
      
      // Reset button
      submitButton.textContent = originalText;
      submitButton.disabled = false;
      
      this.showNotification('Thank you for your message! Your email client will open shortly.', 'success');
    }, 1000);
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="notification__close">&times;</button>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#22c55e' : '#3b82f6'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 1rem;
      animation: slideInFromRight 0.3s ease-out;
      max-width: 400px;
      font-weight: 500;
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutToRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);

    // Close button
    const closeBtn = notification.querySelector('.notification__close');
    closeBtn.addEventListener('click', () => {
      notification.style.animation = 'slideOutToRight 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    });
  }

  /**
   * Initialize smooth scrolling
   */
  initSmoothScrolling() {
    // Add smooth scrolling behavior to the page
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  /**
   * Initialize intersection observer for animations
   */
  initIntersectionObserver() {
    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => animationObserver.observe(el));
  }

  /**
   * Initialize parallax effects
   */
  initParallaxEffects() {
    this.parallaxElements = [
      { selector: '.hero__image-container', speed: 0.5 },
      { selector: '.section__number', speed: 0.3 }
    ];
  }

  /**
   * Handle project card hover
   */
  handleProjectHover(e) {
    const card = e.currentTarget;
    const image = card.querySelector('.project-card__image');
    
    if (image) {
      image.style.transform = 'scale(1.05) rotate(1deg)';
    }
  }

  /**
   * Handle project card leave
   */
  handleProjectLeave(e) {
    const card = e.currentTarget;
    const image = card.querySelector('.project-card__image');
    
    if (image) {
      image.style.transform = '';
    }
  }

  /**
   * Handle scroll events
   */
  handleScroll() {
    const scrollY = window.scrollY;
    
    // Update navigation background opacity
    const nav = document.querySelector('.nav');
    if (nav) {
      if (scrollY > 50) {
        nav.style.background = document.documentElement.getAttribute('data-theme') === 'dark' 
          ? 'rgba(10, 10, 10, 0.98)' 
          : 'rgba(255, 255, 255, 0.98)';
      } else {
        nav.style.background = document.documentElement.getAttribute('data-theme') === 'dark' 
          ? 'rgba(10, 10, 10, 0.95)' 
          : 'rgba(255, 255, 255, 0.95)';
      }
    }

    // Parallax effects
    this.parallaxElements.forEach(({ selector, speed }) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const elementCenter = elementTop + rect.height / 2;
        const windowCenter = scrollY + window.innerHeight / 2;
        const offset = (windowCenter - elementCenter) * speed;
        
        element.style.transform = `translateY(${offset}px)`;
      });
    });

    // Update scroll progress
    const scrollProgress = scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    this.updateScrollProgress(scrollProgress);
  }

  /**
   * Update scroll progress indicator
   */
  updateScrollProgress(progress) {
    let progressBar = document.querySelector('.scroll-progress');
    
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress';
      progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: var(--color-accent);
        z-index: 1060;
        transition: width 0.1s ease-out;
      `;
      document.body.appendChild(progressBar);
    }
    
    progressBar.style.width = `${progress * 100}%`;
  }

  /**
   * Handle resize events
   */
  handleResize() {
    // Close mobile menu on resize
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    
    if (window.innerWidth > 768 && navMenu?.classList.contains('active')) {
      navMenu.classList.remove('active');
      navToggle?.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  /**
   * Handle page load
   */
  handleLoad() {
    // Remove loading states
    document.body.classList.add('loaded');
    
    // Trigger initial animations
    setTimeout(() => {
      const heroElements = document.querySelectorAll('.hero .animate-on-scroll');
      heroElements.forEach(el => el.classList.add('animate'));
    }, 100);
  }

  /**
   * Utility: Debounce function
   */
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

  /**
   * Utility: Throttle function
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Initialize typing animation for hero title
   */
  initTypingAnimation() {
    const titleLines = document.querySelectorAll('.hero__title-line');
    
    titleLines.forEach((line, index) => {
      const text = line.textContent;
      line.textContent = '';
      line.style.borderRight = '2px solid var(--color-accent)';
      
      setTimeout(() => {
        this.typeText(line, text, () => {
          // Remove cursor after typing
          setTimeout(() => {
            line.style.borderRight = 'none';
          }, 1000);
        });
      }, index * 1000);
    });
  }

  /**
   * Type text animation
   */
  typeText(element, text, callback) {
    let i = 0;
    const timer = setInterval(() => {
      element.textContent += text.charAt(i);
      i++;
      if (i > text.length - 1) {
        clearInterval(timer);
        if (callback) callback();
      }
    }, 100);
  }

  /**
   * Initialize particle background
   */
  initParticleBackground() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    
    hero.style.position = 'relative';
    hero.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 50;

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    };

    // Create particles
    const createParticles = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.1
        });
      }
    };

    // Animate particles
    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 68, 68, ${particle.opacity})`;
        ctx.fill();
        
        // Draw connections
        particles.forEach(otherParticle => {
          const distance = Math.sqrt(
            Math.pow(particle.x - otherParticle.x, 2) + 
            Math.pow(particle.y - otherParticle.y, 2)
          );
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(255, 68, 68, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      
      requestAnimationFrame(animateParticles);
    };

    resizeCanvas();
    createParticles();
    animateParticles();

    window.addEventListener('resize', resizeCanvas);
  }

  /**
   * Initialize lazy loading for images
   */
  initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => {
      img.classList.add('lazy');
      imageObserver.observe(img);
    });
  }

  /**
   * Initialize keyboard navigation
   */
  initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // ESC key to close mobile menu
      if (e.key === 'Escape') {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        
        if (navMenu?.classList.contains('active')) {
          navMenu.classList.remove('active');
          navToggle?.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
      
      // Theme toggle with 'T' key
      if (e.key === 't' || e.key === 'T') {
        if (!e.target.matches('input, textarea')) {
          this.toggleTheme();
        }
      }
    });
  }

  /**
   * Initialize scroll-to-top button
   */
  initScrollToTop() {
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
    
    scrollToTopBtn.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: var(--color-accent);
      color: white;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(scrollToTopBtn);
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        scrollToTopBtn.style.opacity = '1';
        scrollToTopBtn.style.transform = 'translateY(0)';
      } else {
        scrollToTopBtn.style.opacity = '0';
        scrollToTopBtn.style.transform = 'translateY(20px)';
      }
    });
    
    // Scroll to top on click
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /**
   * Initialize preloader
   */
  initPreloader() {
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = `
      <div class="preloader__content">
        <div class="preloader__logo">GCZ</div>
        <div class="preloader__spinner"></div>
      </div>
    `;
    
    preloader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--color-background);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.5s ease, visibility 0.5s ease;
    `;
    
    document.body.appendChild(preloader);
    
    // Hide preloader when page is loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        setTimeout(() => preloader.remove(), 500);
      }, 1000);
    });
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioApp();
});

// Add CSS for additional animations and components
const additionalStyles = `
  <style>
    @keyframes slideInFromRight {
      0% {
        transform: translateX(100px);
        opacity: 0;
      }
      100% {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutToRight {
      0% {
        transform: translateX(0);
        opacity: 1;
      }
      100% {
        transform: translateX(100px);
        opacity: 0;
      }
    }
    
    .notification {
      font-family: var(--font-family-primary);
    }
    
    .notification__close {
      background: none;
      border: none;
      color: inherit;
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      margin-left: auto;
    }
    
    .lazy {
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .lazy.loaded {
      opacity: 1;
    }
    
    .preloader__content {
      text-align: center;
    }
    
    .preloader__logo {
      font-size: 3rem;
      font-weight: 900;
      color: var(--color-accent);
      margin-bottom: 2rem;
    }
    
    .preloader__spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--color-border);
      border-left-color: var(--color-accent);
      border-radius: 50%;
      margin: 0 auto;
      animation: rotate 1s linear infinite;
    }
    
    .scroll-to-top:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }
    
    .scroll-progress {
      background: linear-gradient(90deg, var(--color-accent), var(--color-primary));
    }
  </style>
`;

// Inject additional styles
document.head.insertAdjacentHTML('beforeend', additionalStyles);