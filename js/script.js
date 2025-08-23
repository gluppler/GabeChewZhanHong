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
    this.initScrollToTop();
    this.initKeyboardNavigation();
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
    window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
    window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
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

    // Company card interactions
    const companyCards = document.querySelectorAll('.company-card');
    companyCards.forEach(card => {
      card.addEventListener('mouseenter', this.handleCardHover.bind(this));
      card.addEventListener('mouseleave', this.handleCardLeave.bind(this));
    });

    // Certification card interactions
    const certItems = document.querySelectorAll('.cert-item');
    certItems.forEach(item => {
      item.addEventListener('mouseenter', this.handleCertHover.bind(this));
      item.addEventListener('mouseleave', this.handleCertLeave.bind(this));
    });
  }

  /**
   * Initialize theme functionality
   */
  initTheme() {
    // Check for saved theme or default to light theme for better readability
    const savedTheme = localStorage.getItem('theme');
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || 'light'; // Default to light theme
    
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

    // Add transition class to prevent flash
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
    
    // Update meta theme-color for mobile browsers
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    
    const themeColor = theme === 'dark' ? '#0f172a' : '#ffffff';
    themeColorMeta.content = themeColor;
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
    // Add animation classes to elements
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
        el.style.animationDelay = `${index * 0.1}s`;
      });
    });

    // Add staggered animation to skill tags
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach((tag, index) => {
      tag.style.animationDelay = `${(index * 0.05)}s`;
    });

    // Add staggered animation to cert items
    const certItems = document.querySelectorAll('.cert-item');
    certItems.forEach((item, index) => {
      item.style.animationDelay = `${(index * 0.1)}s`;
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
    const isActive = navMenu.classList.contains('active');
    
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (!isActive) {
      document.body.style.overflow = 'hidden';
      navMenu.setAttribute('aria-expanded', 'true');
    } else {
      document.body.style.overflow = '';
      navMenu.setAttribute('aria-expanded', 'false');
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
          navMenu.setAttribute('aria-expanded', 'false');
        }

        // Smooth scroll to target
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Update URL without triggering page reload
        history.pushState(null, null, href);
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

      // Add input validation
      input.addEventListener('input', () => {
        this.validateInput(input);
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
    
    // Show/hide error message
    let errorMessage = input.parentElement.querySelector('.error-message');
    if (!isValid && !errorMessage) {
      errorMessage = document.createElement('span');
      errorMessage.className = 'error-message';
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
      return this.isValidEmail(value);
    }
    
    if (input.id === 'name' && value) {
      return value.length >= 2;
    }
    
    if (input.id === 'message' && value) {
      return value.length >= 10;
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
    
    if (type === 'email' && !this.isValidEmail(value)) {
      return 'Please enter a valid email address';
    }
    
    if (input.id === 'name' && value.length < 2) {
      return 'Name must be at least 2 characters';
    }
    
    if (input.id === 'message' && value.length < 10) {
      return 'Message must be at least 10 characters';
    }
    
    return '';
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

    // Show loading state
    const originalText = submitButton.textContent;
    submitButton.innerHTML = `
      <span class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </span>
      Sending...
    `;
    submitButton.disabled = true;

    // Simulate form submission
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
      
      // Clear any error states
      document.querySelectorAll('.form__input.error').forEach(input => {
        input.classList.remove('error');
      });
      document.querySelectorAll('.error-message').forEach(msg => msg.remove());
      
      // Reset button
      submitButton.innerHTML = originalText;
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
    const existing = document.querySelectorAll('.notification');
    existing.forEach(notif => notif.remove());

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <span class="notification__message">${message}</span>
      <button class="notification__close" aria-label="Close notification">&times;</button>
    `;

    // Add styles
    const colors = {
      error: '#ef4444',
      success: '#22c55e',
      info: '#3b82f6',
      warning: '#f59e0b'
    };

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

    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.opacity = '0.7';
    });

    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.opacity = '1';
    });
  }

  /**
   * Remove notification with animation
   */
  removeNotification(notification) {
    notification.classList.add('removing');
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
    // Add smooth scrolling behavior
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
            
            // Add special animation for section titles
            if (entry.target.classList.contains('section__title')) {
              entry.target.classList.add('animate');
            }
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
    
    // Add slight glow effect
    card.style.boxShadow = '0 25px 50px rgba(239, 68, 68, 0.15)';
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
    
    card.style.boxShadow = '';
  }

  /**
   * Handle general card hover
   */
  handleCardHover(e) {
    const card = e.currentTarget;
    card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
  }

  /**
   * Handle general card leave
   */
  handleCardLeave(e) {
    const card = e.currentTarget;
    card.style.boxShadow = '';
  }

  /**
   * Handle certification item hover
   */
  handleCertHover(e) {
    const item = e.currentTarget;
    const status = item.querySelector('.cert-item__status');
    
    if (status) {
      status.style.transform = 'scale(1.1)';
    }
  }

  /**
   * Handle certification item leave
   */
  handleCertLeave(e) {
    const item = e.currentTarget;
    const status = item.querySelector('.cert-item__status');
    
    if (status) {
      status.style.transform = '';
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
      const opacity = scrollY > 50 ? '0.98' : '0.95';
      const background = document.documentElement.getAttribute('data-theme') === 'dark' 
        ? `rgba(15, 23, 42, ${opacity})` 
        : `rgba(248, 250, 252, ${opacity})`;
      nav.style.background = background;
    }

    // Parallax effects (only on larger screens for performance)
    if (window.innerWidth > 768) {
      this.parallaxElements.forEach(({ selector, speed }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollY;
          const elementCenter = elementTop + rect.height / 2;
          const windowCenter = scrollY + window.innerHeight / 2;
          const offset = (windowCenter - elementCenter) * speed;
          
          element.style.transform = `translateY(${Math.max(-50, Math.min(50, offset))}px)`;
        });
      });
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
      navMenu.classList.remove('active');
      navToggle?.classList.remove('active');
      document.body.style.overflow = '';
      navMenu.setAttribute('aria-expanded', 'false');
    }

    // Reset parallax transforms on mobile
    if (window.innerWidth <= 768) {
      this.parallaxElements.forEach(({ selector }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          element.style.transform = '';
        });
      });
    }
  }

  /**
   * Handle page load
   */
  handleLoad() {
    // Remove loading states
    document.body.classList.add('loaded');
    
    // Trigger initial animations with delay
    setTimeout(() => {
      const heroElements = document.querySelectorAll('.hero .animate-on-scroll');
      heroElements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('animate');
        }, index * 100);
      });
    }, 200);

    // Initialize lazy loading for images
    this.initLazyLoading();
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
    
    // Scroll to top on click with smooth animation
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Add hover effects
    scrollToTopBtn.addEventListener('mouseenter', () => {
      scrollToTopBtn.style.transform = 'translateY(-2px) scale(1.05)';
      scrollToTopBtn.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
    });

    scrollToTopBtn.addEventListener('mouseleave', () => {
      scrollToTopBtn.style.transform = 'translateY(0) scale(1)';
      scrollToTopBtn.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
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
          navMenu.setAttribute('aria-expanded', 'false');
        }

        // Close notifications
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
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
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Create a new image to preload
          const newImg = new Image();
          newImg.onload = () => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
          };
          
          newImg.onerror = () => {
            img.classList.add('error');
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
   * Get performance metrics
   */
  getPerformanceMetrics() {
    if ('performance' in window) {
      return {
        loadTime: Math.round(performance.now()),
        navigationStart: performance.timing.navigationStart,
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
      };
    }
    return null;
  }

  /**
   * Initialize error handling
   */
  initErrorHandling() {
    window.addEventListener('error', (e) => {
      console.error('JavaScript Error:', e.error);
      // Could send to analytics service here
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled Promise Rejection:', e.reason);
      // Could send to analytics service here
    });
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new PortfolioApp();
  
  // Make app instance globally available for debugging
  window.portfolioApp = app;
  
  // Log performance metrics after load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const metrics = app.getPerformanceMetrics();
      if (metrics) {
        console.log('Performance Metrics:', metrics);
      }
    }, 1000);
  });
});

// Add additional CSS for animations and components
document.addEventListener('DOMContentLoaded', () => {
  const additionalStyles = document.createElement('style');
  additionalStyles.textContent = `
    /* Form Error States */
    .form__input.error {
      border-color: var(--color-accent) !important;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    .error-message {
      animation: slideInFromBottom 0.3s ease-out;
    }
    
    /* Loading States */
    .loading-dots {
      display: inline-flex;
      gap: 4px;
      align-items: center;
    }
    
    .loading-dots span {
      width: 6px;
      height: 6px;
      background: currentColor;
      border-radius: 50%;
      animation: bounce 1.4s infinite both;
    }
    
    .loading-dots span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .loading-dots span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    /* Lazy Loading */
    .lazy {
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .lazy.loaded {
      opacity: 1;
    }
    
    .lazy.error {
      opacity: 0.5;
      filter: grayscale(100%);
    }
    
    /* Accessibility Improvements */
    @media (prefers-reduced-motion: reduce) {
      .scroll-to-top {
        transition: opacity 0.1s !important;
      }
    }
    
    /* Focus Styles */
    .btn:focus-visible,
    .nav__link:focus-visible,
    .theme-toggle:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }
    
    .form__input:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
    }
    
    /* High Contrast Mode */
    @media (prefers-contrast: high) {
      :root {
        --color-border: #000000;
        --color-text-secondary: #000000;
      }
      
      [data-theme="dark"] {
        --color-border: #ffffff;
        --color-text-secondary: #ffffff;
      }
    }
  `;
  
  document.head.appendChild(additionalStyles);
});