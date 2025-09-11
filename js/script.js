/**
 * Portfolio Website JavaScript - Optimized Version
 * Author: Gabe Chew Zhan Hong
 * Description: Enhanced interactive functionality with better performance
 */

class PortfolioApp {
  constructor() {
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.observerCache = new Map();
    this.rafId = null;
    this.init();
  }

  init() {
    // Critical initialization
    this.initTheme();
    this.bindCriticalEvents();
    this.initNavigation();
    this.initSmoothScrolling();

    // Non-critical initialization
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this.initNonCritical());
    } else {
      setTimeout(() => this.initNonCritical(), 1);
    }
  }

  initNonCritical() {
    this.initScrollAnimations();
    this.initIntersectionObserver();
    this.initContactForm();
    this.initParallaxEffects();
    this.initScrollToTop();
    this.initKeyboardNavigation();
    this.initLazyLoading();
    this.initPerformanceMonitoring();
  }

  /**
   * Bind critical event listeners
   */
  bindCriticalEvents() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme(), { passive: true });
    }

    // Mobile navigation
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => this.toggleMobileNav(navToggle, navMenu), { passive: true });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !navToggle.contains(e.target)) {
          this.toggleMobileNav(navToggle, navMenu);
        }
      }, { passive: true });
    }

    // Navigation links
    document.querySelectorAll('.nav__link[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => this.handleNavClick(e));
    });

    // Optimized scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        this.rafId = requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', this.debounce(() => this.handleResize(), 250), { passive: true });
    window.addEventListener('load', () => this.handleLoad(), { passive: true });

    // Form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Event delegation for project cards
    const projectsGrid = document.querySelector('.projects__grid');
    if (projectsGrid) {
      projectsGrid.addEventListener('mouseenter', (e) => {
        const card = e.target.closest('.project-card');
        if (card) this.handleProjectHover(card);
      }, { passive: true });

      projectsGrid.addEventListener('mouseleave', (e) => {
        const card = e.target.closest('.project-card');
        if (card) this.handleProjectLeave(card);
      }, { passive: true });
    }

    // Event delegation for experience items
    const experienceSection = document.querySelector('#experience');
    if (experienceSection) {
      experienceSection.addEventListener('mouseenter', (e) => {
        const item = e.target.closest('.experience__item');
        if (item) {
          item.style.transform = 'translateY(-4px)';
          item.style.boxShadow = '0 20px 40px var(--color-shadow)';
        }
      }, { passive: true });

      experienceSection.addEventListener('mouseleave', (e) => {
        const item = e.target.closest('.experience__item');
        if (item) {
          item.style.transform = '';
          item.style.boxShadow = '';
        }
      }, { passive: true });
    }
  }

  /**
   * Initialize theme functionality
   */
  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemPreference;
    
    this.setTheme(theme);
    this.updateThemeIcon(theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
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

    // Smooth transition
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update meta theme-color
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = theme === 'dark' ? '#0f172a' : '#ffffff';
  }

  /**
   * Update theme toggle icon
   */
  updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
      themeIcon.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
  }

  /**
   * Initialize scroll animations
   */
  initScrollAnimations() {
    const animatedElements = [
      { selector: '.hero__content > *', animation: 'fade-up' },
      { selector: '.section__header', animation: 'fade-up' },
      { selector: '.about__content', animation: 'fade-right' },
      { selector: '.about__education', animation: 'fade-left' },
      { selector: '.experience__item', animation: 'fade-up' },
      { selector: '.project-card', animation: 'scale-up' },
      { selector: '.cert-category', animation: 'fade-up' },
      { selector: '.skills__category', animation: 'fade-up' },
      { selector: '.contact__content', animation: 'fade-right' },
      { selector: '.contact__form', animation: 'fade-left' }
    ];

    animatedElements.forEach(({ selector, animation }) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el, index) => {
        el.classList.add('animate-on-scroll', animation);
        el.style.animationDelay = `${Math.min(index * 0.1, 0.5)}s`;
      });
    });
  }

  /**
   * Initialize navigation functionality
   */
  initNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link[href^="#"]');

    const navObserver = new IntersectionObserver(
      (entries) => {
        requestAnimationFrame(() => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              navLinks.forEach(link => link.classList.remove('active'));
              const activeLink = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
              if (activeLink) {
                activeLink.classList.add('active');
              }
            }
          });
        });
      },
      { 
        threshold: 0.3, 
        rootMargin: '-100px 0px -50% 0px' 
      }
    );

    sections.forEach(section => navObserver.observe(section));
    this.observerCache.set('navigation', navObserver);
  }

  /**
   * Toggle mobile navigation
   */
  toggleMobileNav(navToggle, navMenu) {
    const isActive = navMenu.classList.contains('active');
    
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', !isActive);
    
    if (!isActive) {
      document.body.style.overflow = 'hidden';
      navMenu.setAttribute('aria-expanded', 'true');
      this.trapFocus(navMenu);
    } else {
      document.body.style.overflow = '';
      navMenu.setAttribute('aria-expanded', 'false');
      this.releaseFocus();
    }
  }

  /**
   * Trap focus within an element
   */
  trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    this.focusTrapHandler = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', this.focusTrapHandler);
  }

  /**
   * Release focus trap
   */
  releaseFocus() {
    if (this.focusTrapHandler) {
      const navMenu = document.getElementById('nav-menu');
      if (navMenu) {
        navMenu.removeEventListener('keydown', this.focusTrapHandler);
      }
      this.focusTrapHandler = null;
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
          this.toggleMobileNav(navToggle, navMenu);
        }

        // Smooth scroll to target
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Update URL without triggering page reload
        history.pushState(null, null, href);
        
        // Announce navigation for screen readers
        this.announceNavigation(targetElement);
      }
    }
  }

  /**
   * Announce navigation for screen readers
   */
  announceNavigation(element) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.classList.add('sr-only');
    announcement.textContent = `Navigated to ${element.getAttribute('aria-label') || element.id}`;
    
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  /**
   * Initialize contact form
   */
  initContactForm() {
    const formInputs = document.querySelectorAll('.form__input');
    
    formInputs.forEach(input => {
      if (!input.hasAttribute('placeholder')) {
        input.setAttribute('placeholder', ' ');
      }

      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });

      input.addEventListener('blur', () => {
        if (!input.value.trim()) {
          input.parentElement.classList.remove('focused');
        }
      });

      if (input.value.trim()) {
        input.parentElement.classList.add('focused');
      }

      // Real-time validation with debouncing
      let validationTimeout;
      input.addEventListener('input', () => {
        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(() => {
          this.validateInput(input);
        }, 300);
      });
    });
  }

  /**
   * Validate form input
   */
  validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    const isValid = this.isInputValid(input, value, type);
    
    input.classList.toggle('error', !isValid);
    input.setAttribute('aria-invalid', !isValid);
    
    let errorMessage = input.parentElement.querySelector('.error-message');
    if (!isValid && !errorMessage) {
      errorMessage = document.createElement('span');
      errorMessage.className = 'error-message';
      errorMessage.setAttribute('role', 'alert');
      errorMessage.style.cssText = `
        color: var(--color-accent);
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
      `;
      input.parentElement.appendChild(errorMessage);
    }
    
    if (errorMessage) {
      if (isValid) {
        errorMessage.remove();
      } else {
        errorMessage.textContent = this.getErrorMessage(input, type);
      }
    }
    
    return isValid;
  }

  /**
   * Check if input is valid
   */
  isInputValid(input, value, type) {
    if (input.required && !value) return false;
    
    if (type === 'email' && value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    
    if (input.id === 'name' && value) {
      return value.length >= 2 && value.length <= 100;
    }
    
    if (input.id === 'message' && value) {
      return value.length >= 10 && value.length <= 1000;
    }
    
    return true;
  }

  /**
   * Get error message for input
   */
  getErrorMessage(input, type) {
    const value = input.value.trim();
    
    if (!value && input.required) {
      return 'This field is required';
    }
    
    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    
    if (input.id === 'name') {
      if (value.length < 2) return 'Name must be at least 2 characters';
      if (value.length > 100) return 'Name must be less than 100 characters';
    }
    
    if (input.id === 'message') {
      if (value.length < 10) return 'Message must be at least 10 characters';
      if (value.length > 1000) return 'Message must be less than 1000 characters';
    }
    
    return '';
  }

  /**
   * Handle form submission
   */
  async handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate all inputs
    const inputs = form.querySelectorAll('.form__input');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!this.validateInput(input)) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      this.showNotification('Please fix the errors in the form', 'error');
      return;
    }

    // Get form values
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Show loading state
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <span class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </span>
      Sending...
    `;

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      
      // Clear error states
      document.querySelectorAll('.form__input.error').forEach(input => {
        input.classList.remove('error');
        input.setAttribute('aria-invalid', 'false');
      });
      document.querySelectorAll('.error-message').forEach(msg => msg.remove());
      
      this.showNotification('Thank you! Your email client will open shortly.', 'success');
    } catch (error) {
      console.error('Form submission error:', error);
      this.showNotification('An error occurred. Please try again.', 'error');
    } finally {
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    const colors = {
      error: '#ef4444',
      success: '#22c55e',
      info: '#3b82f6',
      warning: '#f59e0b'
    };

    notification.innerHTML = `
      <span class="notification__message">${message}</span>
      <button class="notification__close" aria-label="Close notification">&times;</button>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 1rem;
      max-width: 400px;
      font-weight: 500;
      font-family: var(--font-family-primary);
      animation: slideInFromRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    const autoRemoveTimeout = setTimeout(() => {
      this.removeNotification(notification);
    }, 5000);

    // Close button
    const closeBtn = notification.querySelector('.notification__close');
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: inherit;
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      margin-left: auto;
      transition: opacity 0.2s;
    `;
    
    closeBtn.addEventListener('click', () => {
      clearTimeout(autoRemoveTimeout);
      this.removeNotification(notification);
    });
  }

  /**
   * Remove notification with animation
   */
  removeNotification(notification) {
    notification.style.animation = 'slideOutToRight 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }

  /**
   * Initialize smooth scrolling
   */
  initSmoothScrolling() {
    if (!('scrollBehavior' in document.documentElement.style)) {
      // Polyfill for older browsers
      this.polyfillSmoothScroll();
    }
  }

  /**
   * Polyfill for smooth scrolling
   */
  polyfillSmoothScroll() {
    const originalScrollTo = window.scrollTo;
    window.scrollTo = function(options) {
      if (options && typeof options === 'object' && options.behavior === 'smooth') {
        const start = window.pageYOffset;
        const distance = (options.top || 0) - start;
        const duration = 500;
        let startTime = null;

        function animation(currentTime) {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          const ease = progress * (2 - progress);
          
          window.scrollTo(0, start + distance * ease);
          
          if (timeElapsed < duration) {
            requestAnimationFrame(animation);
          }
        }

        requestAnimationFrame(animation);
      } else {
        originalScrollTo.apply(window, arguments);
      }
    };
  }

  /**
   * Initialize intersection observer for animations
   */
  initIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.classList.add('animate');
      });
      return;
    }

    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => {
              entry.target.classList.add('animate');
            });
            animationObserver.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.1, 
        rootMargin: '0px 0px -50px 0px' 
      }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      animationObserver.observe(el);
    });
    
    this.observerCache.set('animation', animationObserver);
  }

  /**
   * Initialize parallax effects
   */
  initParallaxEffects() {
    if (window.innerWidth <= 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.parallaxElements = [
      { selector: '.hero__image-container', speed: 0.5 },
      { selector: '.section__number', speed: 0.3 }
    ];
  }

  /**
   * Handle project card hover
   */
  handleProjectHover(card) {
    const image = card.querySelector('.project-card__image');
    if (image) {
      image.style.transform = 'scale(1.05) rotate(1deg)';
    }
    card.style.boxShadow = '0 25px 50px rgba(239, 68, 68, 0.15)';
  }

  /**
   * Handle project card leave
   */
  handleProjectLeave(card) {
    const image = card.querySelector('.project-card__image');
    if (image) {
      image.style.transform = '';
    }
    card.style.boxShadow = '';
  }

  /**
   * Handle scroll events
   */
  handleScroll() {
    const scrollY = window.scrollY;
    
    // Update navigation background
    const nav = document.querySelector('.nav');
    if (nav) {
      const opacity = scrollY > 50 ? '0.98' : '0.95';
      const background = document.documentElement.getAttribute('data-theme') === 'dark' 
        ? `rgba(15, 23, 42, ${opacity})` 
        : `rgba(248, 250, 252, ${opacity})`;
      nav.style.background = background;
    }

    // Parallax effects (desktop only)
    if (window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (this.parallaxElements) {
        this.parallaxElements.forEach(({ selector, speed }) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + scrollY;
            const elementCenter = elementTop + rect.height / 2;
            const windowCenter = scrollY + window.innerHeight / 2;
            const offset = (windowCenter - elementCenter) * speed;
            
            element.style.transform = `translate3d(0, ${Math.max(-50, Math.min(50, offset))}px, 0)`;
          });
        });
      }
    }

    // Update scroll progress
    const scrollProgress = scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    this.updateScrollProgress(Math.max(0, Math.min(1, scrollProgress)));
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
        background: linear-gradient(90deg, var(--color-accent), var(--color-text));
        z-index: 1060;
        transition: width 0.1s ease-out;
        will-change: width;
        transform: translateZ(0);
      `;
      document.body.appendChild(progressBar);
    }
    
    progressBar.style.width = `${progress * 100}%`;
  }

  /**
   * Handle resize events
   */
  handleResize() {
    // Close mobile menu on resize to desktop
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    
    if (window.innerWidth > 768 && navMenu?.classList.contains('active')) {
      this.toggleMobileNav(navToggle, navMenu);
    }

    // Reset parallax transforms on mobile
    if (window.innerWidth <= 768) {
      if (this.parallaxElements) {
        this.parallaxElements.forEach(({ selector }) => {
          document.querySelectorAll(selector).forEach(element => {
            element.style.transform = '';
          });
        });
      }
    }
  }

  /**
   * Handle page load
   */
  handleLoad() {
    document.body.classList.add('loaded');
    
    // Trigger initial animations
    setTimeout(() => {
      const heroElements = document.querySelectorAll('.hero .animate-on-scroll');
      heroElements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('animate');
        }, Math.min(index * 100, 500));
      });
    }, 200);
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
      font-weight: bold;
      cursor: pointer;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      font-family: var(--font-family-primary);
      visibility: hidden;
    `;
    
    document.body.appendChild(scrollToTopBtn);
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        scrollToTopBtn.style.opacity = '1';
        scrollToTopBtn.style.transform = 'translateY(0)';
        scrollToTopBtn.style.visibility = 'visible';
      } else {
        scrollToTopBtn.style.opacity = '0';
        scrollToTopBtn.style.transform = 'translateY(20px)';
        scrollToTopBtn.style.visibility = 'hidden';
      }
    }, { passive: true });
    
    // Scroll to top on click
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      this.announceNavigation({ id: 'top', getAttribute: () => 'Top of page' });
    });
  }

  /**
   * Initialize keyboard navigation
   */
  initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // ESC key
      if (e.key === 'Escape') {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        
        if (navMenu?.classList.contains('active')) {
          this.toggleMobileNav(navToggle, navMenu);
        }

        document.querySelectorAll('.notification').forEach(notification => {
          this.removeNotification(notification);
        });
      }
      
      // Theme toggle with 'T' key
      if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.metaKey) {
        if (!e.target.matches('input, textarea')) {
          e.preventDefault();
          this.toggleTheme();
        }
      }

      // Navigate sections with arrow keys
      if (e.key === 'ArrowDown' && e.ctrlKey) {
        e.preventDefault();
        this.navigateToNextSection();
      }

      if (e.key === 'ArrowUp' && e.ctrlKey) {
        e.preventDefault();
        this.navigateToPrevSection();
      }
    });
  }

  /**
   * Navigate to next section
   */
  navigateToNextSection() {
    const sections = document.querySelectorAll('section[id]');
    const currentSection = this.getCurrentSection(sections);
    const nextIndex = (currentSection.index + 1) % sections.length;
    
    sections[nextIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    
    this.announceNavigation(sections[nextIndex]);
  }

  /**
   * Navigate to previous section
   */
  navigateToPrevSection() {
    const sections = document.querySelectorAll('section[id]');
    const currentSection = this.getCurrentSection(sections);
    const prevIndex = currentSection.index === 0 ? sections.length - 1 : currentSection.index - 1;
    
    sections[prevIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    
    this.announceNavigation(sections[prevIndex]);
  }

  /**
   * Get current section based on scroll position
   */
  getCurrentSection(sections) {
    const scrollPosition = window.scrollY + 100;
    
    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i].offsetTop <= scrollPosition) {
        return { section: sections[i], index: i };
      }
    }
    
    return { section: sections[0], index: 0 };
  }

  /**
   * Initialize lazy loading for images
   */
  initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if (!images.length) return;
    
    // Use native lazy loading if supported
    if ('loading' in HTMLImageElement.prototype) {
      images.forEach(img => {
        img.loading = 'lazy';
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
      });
      return;
    }
    
    // Fallback to IntersectionObserver
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const newImg = new Image();
          
          newImg.onload = () => {
            requestAnimationFrame(() => {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              img.classList.add('loaded');
              img.removeAttribute('data-src');
            });
          };
          
          newImg.onerror = () => {
            img.classList.add('error');
            console.error(`Failed to load image: ${img.dataset.src}`);
          };
          
          newImg.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    images.forEach(img => {
      img.classList.add('lazy');
      imageObserver.observe(img);
    });
    
    this.observerCache.set('images', imageObserver);
  }

  /**
   * Initialize performance monitoring
   */
  initPerformanceMonitoring() {
    if ('performance' in window && 'PerformanceObserver' in window) {
      // Monitor long tasks
      try {
        const perfObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('Long task detected:', {
                duration: `${Math.round(entry.duration)}ms`,
                startTime: `${Math.round(entry.startTime)}ms`
              });
            }
          }
        });
        
        perfObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Longtask observer not supported
      }
    }
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
   * Clean up observers and event listeners
   */
  cleanup() {
    // Cancel any pending animation frames
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    // Clean up intersection observers
    this.observerCache.forEach(observer => {
      observer.disconnect();
    });
    this.observerCache.clear();

    // Remove event listeners
    if (this.focusTrapHandler) {
      this.releaseFocus();
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  const app = new PortfolioApp();
  window.portfolioApp = app;
  
  // Log performance metrics
  if ('performance' in window && 'measure' in window.performance) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          const perfData = performance.timing;
          const loadTime = perfData.loadEventEnd - perfData.navigationStart;
          const domReady = perfData.domContentLoadedEventEnd - perfData.navigationStart;
          const firstPaint = performance.getEntriesByType('paint')[0]?.startTime || 0;
          
          console.log('Performance:', {
            pageLoad: `${loadTime}ms`,
            domReady: `${domReady}ms`,
            firstPaint: `${Math.round(firstPaint)}ms`
          });
        } catch (error) {
          console.error('Failed to log performance:', error);
        }
      }, 0);
    });
  }

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    if (app.cleanup) {
      app.cleanup();
    }
  });
}

// Add animation styles if not present
if (!document.querySelector('#animation-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'animation-styles';
  styleSheet.textContent = `
    @keyframes slideInFromRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutToRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
    
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;
  document.head.appendChild(styleSheet);
}