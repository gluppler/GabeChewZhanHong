// ===== THEME MANAGEMENT =====
class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 
                 (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.init();
  }

  init() {
    this.applyTheme();
    this.setupToggle();
    this.setupSystemThemeDetection();
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    this.animateThemeTransition();
  }

  setupToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  setupSystemThemeDetection() {
    window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
              this.theme = e.matches ? 'dark' : 'light';
              this.applyTheme();
            }
          });
  }

  animateThemeTransition() {
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }
}

// ===== NAVIGATION MANAGEMENT =====
class NavigationManager {
  constructor() {
    this.nav = document.getElementById('nav');
    this.navToggle = document.getElementById('nav-toggle');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.isMenuOpen = false;
    this.init();
  }

  init() {
    this.setupScrollEffect();
    this.setupSmoothScrolling();
    this.setupMobileMenu();
    this.setupActiveSection();
  }

  setupScrollEffect() {
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        this.nav.classList.add('scrolled');
      } else {
        this.nav.classList.remove('scrolled');
      }
      
      // Auto-hide navigation on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        this.nav.style.transform = 'translateY(-100%)';
      } else {
        this.nav.style.transform = 'translateY(0)';
      }
      
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  setupSmoothScrolling() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          
          if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
          }
          
          // Close mobile menu if open
          if (this.isMenuOpen) {
            this.toggleMobileMenu();
          }
        }
      });
    });
  }

  setupMobileMenu() {
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !this.nav.contains(e.target)) {
        this.toggleMobileMenu();
      }
    });
  }

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.navToggle.classList.toggle('active');
    
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      navLinks.classList.toggle('active');
    }
  }

  setupActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.setActiveNavLink(entry.target.id);
        }
      });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
  }

  setActiveNavLink(sectionId) {
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${sectionId}`) {
        link.classList.add('active');
      }
    });
  }
}

// ===== SCROLL ANIMATIONS =====
class ScrollAnimations {
  constructor() {
    this.animatedElements = document.querySelectorAll('.animate-on-scroll, .reveal, .reveal-left, .reveal-right, .reveal-scale');
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupParallaxEffect();
  }

  setupIntersectionObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated', 'revealed');
          
          // Stagger animation for child elements
          const children = entry.target.querySelectorAll('.stagger-item');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('animated');
            }, index * 100);
          });
        }
      });
    }, observerOptions);

    this.animatedElements.forEach(element => observer.observe(element));
  }

  setupParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    if (parallaxElements.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        
        parallaxElements.forEach(element => {
          const speed = element.dataset.speed || 0.5;
          const yPos = -(scrollY * speed);
          element.style.transform = `translateY(${yPos}px)`;
        });
      }, { passive: true });
    }
  }
}

// ===== PROJECTS MANAGER =====
class ProjectsManager {
  constructor() {
    this.projectsContainer = document.getElementById('projects-grid');
    this.projects = [
      {
        title: 'HelloARM64',
        subtitle: 'ARM64 Architecture Exploration',
        description: 'A comprehensive repository exploring the fundamentals of ARM64 architecture, including assembly language programming, reverse engineering techniques, and low-level system programming. Features practical examples and detailed documentation for learning ARM64 development.',
        tech: ['Assembly', 'ARM64', 'C', 'Reverse Engineering', 'Low-level Programming'],
        github: 'https://github.com/gluppler/HelloARM64',
        featured: true
      },
      {
        title: 'HelloCPP',
        subtitle: 'Modern C++ Projects',
        description: 'A collection of advanced C++ projects demonstrating modern C++ features, design patterns, and best practices. Includes implementations of data structures, algorithms, and system-level programming concepts with comprehensive examples.',
        tech: ['C++', 'STL', 'Modern C++', 'Design Patterns', 'Performance Optimization'],
        github: 'https://github.com/gluppler/HelloCPP',
        featured: true
      },
      {
        title: 'HelloGolang',
        subtitle: 'Go Systems Programming',
        description: 'A repository of Go projects focused on concurrency, networking, and systems programming. Demonstrates Go\'s powerful concurrency model, network programming capabilities, and system-level interactions with practical examples.',
        tech: ['Go', 'Concurrency', 'Networking', 'Systems Programming', 'Microservices'],
        github: 'https://github.com/gluppler/HelloGolang',
        featured: true
      },
      {
        title: 'HelloPython-AI-ML',
        subtitle: 'AI & Machine Learning',
        description: 'A showcase of Python-based AI and Machine Learning projects, including custom models, data analysis pipelines, and practical implementations. Features neural networks, data visualization, and advanced ML algorithms with real-world applications.',
        tech: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Data Analysis', 'Neural Networks'],
        github: 'https://github.com/gluppler/HelloPython-AI-ML',
        featured: true
      },
      {
        title: 'HelloContainers',
        subtitle: 'Container Orchestration',
        description: 'A comprehensive repository dedicated to containerization technologies like Docker and Kubernetes, with a strong focus on security and orchestration. Includes best practices for container security, deployment strategies, and scalable architectures.',
        tech: ['Docker', 'Kubernetes', 'Container Security', 'DevOps', 'Orchestration'],
        github: 'https://github.com/gluppler/HelloContainers',
        featured: true
      },
      {
        title: 'Cybersecurity-Lab',
        subtitle: 'Self-hosted Security Lab',
        description: 'A comprehensive, self-hosted cybersecurity lab environment for practicing offensive and defensive security techniques. Features vulnerable applications, network simulation, and hands-on exercises for security professionals and students.',
        tech: ['Security Testing', 'Network Security', 'Penetration Testing', 'Vulnerability Assessment', 'Lab Environment'],
        github: 'https://github.com/gluppler/Cybersecurity-Lab',
        featured: true
      }
    ];
    this.init();
  }

  init() {
    this.renderProjects();
    this.setupProjectAnimations();
  }

  renderProjects() {
    if (!this.projectsContainer) return;

    const projectsHTML = this.projects.map((project, index) => `
      <div class="project-card reveal" style="animation-delay: ${index * 0.1}s">
        <div class="project-header">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-subtitle">${project.subtitle}</p>
        </div>
        <div class="project-content">
          <p class="project-description">${project.description}</p>
          <div class="project-tech">
            ${project.tech.map(tech => `<span class="project-tech-tag">${tech}</span>`).join('')}
          </div>
          <div class="project-actions">
            <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-primary">
              <i class="fab fa-github"></i>
              View Repository
            </a>
            <a href="#" class="project-btn project-btn-secondary project-details-btn" data-project-title="${project.title}">
              <i class="fas fa-info-circle"></i>
              Learn More
            </a>
          </div>
        </div>
      </div>
    `).join('');

    this.projectsContainer.innerHTML = projectsHTML;

    // Add event listeners after rendering the HTML
    this.projectsContainer.querySelectorAll('.project-details-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const projectTitle = e.currentTarget.dataset.projectTitle;
            this.showProjectDetails(projectTitle);
        });
    });
  }

  setupProjectAnimations() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  showProjectDetails(projectTitle) {
    const project = this.projects.find(p => p.title === projectTitle);
    if (project) {
      // Create a modal or detailed view
      this.createProjectModal(project);
    }
  }

  createProjectModal(project) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${project.title}</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <h3>${project.subtitle}</h3>
          <p>${project.description}</p>
          <div class="modal-tech">
            <h4>Technologies Used:</h4>
            <div class="tech-tags">
              ${project.tech.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <a href="${project.github}" target="_blank" class="btn btn-primary">
            <i class="fab fa-github"></i>
            View on GitHub
          </a>
        </div>
      </div>
    `;

    // Add modal styles
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
    `;

    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
      background: var(--surface-color);
      border-radius: var(--border-radius-xl);
      padding: var(--spacing-2xl);
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      margin: var(--spacing-lg);
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--border-color);
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
}

// ===== TYPING ANIMATION =====
class TypingAnimation {
  constructor(element, texts, options = {}) {
    this.element = element;
    this.texts = texts;
    this.options = {
      typeSpeed: options.typeSpeed || 100,
      deleteSpeed: options.deleteSpeed || 50,
      pauseDelay: options.pauseDelay || 2000,
      loop: options.loop !== false,
      ...options
    };
    this.currentTextIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.init();
  }

  init() {
    this.type();
  }

  type() {
    const currentText = this.texts[this.currentTextIndex];
    
    if (this.isDeleting) {
      this.element.textContent = currentText.substring(0, this.currentCharIndex - 1);
      this.currentCharIndex--;
    } else {
      this.element.textContent = currentText.substring(0, this.currentCharIndex + 1);
      this.currentCharIndex++;
    }

    let typeSpeed = this.isDeleting ? this.options.deleteSpeed : this.options.typeSpeed;

    if (!this.isDeleting && this.currentCharIndex === currentText.length) {
      typeSpeed = this.options.pauseDelay;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentCharIndex === 0) {
      this.isDeleting = false;
      this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}

// ===== PARTICLE SYSTEM =====
class ParticleSystem {
  constructor(container) {
    this.container = container;
    this.particles = [];
    this.particleCount = 50;
    this.init();
  }

  init() {
    this.createParticles();
    this.animate();
  }

  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      this.createParticle();
    }
  }

  createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const size = Math.random() * 4 + 2;
    const xPos = Math.random() * 100;
    const animationDuration = Math.random() * 10 + 10;
    const delay = Math.random() * 10;

    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${xPos}%;
      animation-duration: ${animationDuration}s;
      animation-delay: ${delay}s;
    `;

    this.container.appendChild(particle);
    this.particles.push(particle);

    // Remove particle after animation
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
      this.createParticle(); // Create new particle
    }, (animationDuration + delay) * 1000);
  }

  animate() {
    // Continuous animation loop
    requestAnimationFrame(() => this.animate());
  }
}

// ===== PERFORMANCE MONITOR =====
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 0,
      memory: 0,
      loadTime: 0
    };
    this.init();
  }

  init() {
    this.measureLoadTime();
    this.startFPSMonitor();
    this.monitorMemory();
  }

  measureLoadTime() {
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.metrics.loadTime = loadTime;
      console.log(`Page load time: ${loadTime}ms`);
    });
  }

  startFPSMonitor() {
    let lastTime = performance.now();
    let frames = 0;

    const countFPS = (currentTime) => {
      frames++;
      if (currentTime >= lastTime + 1000) {
        this.metrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
        frames = 0;
        lastTime = currentTime;
      }
      requestAnimationFrame(countFPS);
    };

    requestAnimationFrame(countFPS);
  }

  monitorMemory() {
    if ('memory' in performance) {
      setInterval(() => {
        this.metrics.memory = performance.memory.usedJSHeapSize / 1048576; // MB
      }, 5000);
    }
  }

  getMetrics() {
    return this.metrics;
  }
}

// ===== INTERSECTION OBSERVER UTILITIES =====
class IntersectionObserverManager {
  constructor() {
    this.observers = new Map();
    this.init();
  }

  init() {
    this.setupCounterAnimation();
    this.setupProgressBars();
    this.setupTimelineAnimation();
  }

  createObserver(options, callback) {
    return new IntersectionObserver(callback, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
      ...options
    });
  }

  setupCounterAnimation() {
    const counters = document.querySelectorAll('[data-count]');
    
    if (counters.length) {
      const observer = this.createObserver({}, (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      });

      counters.forEach(counter => observer.observe(counter));
    }
  }

  animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = parseInt(element.dataset.duration) || 2000;
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const updateCounter = () => {
      if (current < target) {
        current += increment;
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    updateCounter();
  }

  setupProgressBars() {
    const progressBars = document.querySelectorAll('.skill-progress');
    
    if (progressBars.length) {
      const observer = this.createObserver({}, (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
          }
        });
      });

      progressBars.forEach(bar => observer.observe(bar));
    }
  }

  setupTimelineAnimation() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (timelineItems.length) {
      const observer = this.createObserver({ threshold: 0.2 }, (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      });

      timelineItems.forEach(item => observer.observe(item));
    }
  }
}

// ===== CURSOR EFFECTS =====
class CursorEffects {
  constructor() {
    this.cursor = null;
    this.cursorFollower = null;
    this.init();
  }

  init() {
    if (window.innerWidth > 768 && !('ontouchstart' in window)) {
      this.createCursor();
      this.setupCursorMovement();
      this.setupCursorInteractions();
    }
  }

  createCursor() {
    // Main cursor
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    this.cursor.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: var(--primary-color);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transition: all 0.1s ease;
      mix-blend-mode: difference;
    `;

    // Cursor follower
    this.cursorFollower = document.createElement('div');
    this.cursorFollower.className = 'cursor-follower';
    this.cursorFollower.style.cssText = `
      position: fixed;
      width: 30px;
      height: 30px;
      border: 2px solid var(--primary-color);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transition: all 0.3s ease;
      opacity: 0.5;
    `;

    document.body.appendChild(this.cursor);
    document.body.appendChild(this.cursorFollower);
  }

  setupCursorMovement() {
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const animateCursor = () => {
      // Cursor movement
      cursorX += (mouseX - cursorX) * 0.9;
      cursorY += (mouseY - cursorY) * 0.9;
      
      // Follower movement (slower)
      followerX += (mouseX - followerX) * 0.1;
      followerY += (mouseY - followerY) * 0.1;

      if (this.cursor) {
        this.cursor.style.left = cursorX + 'px';
        this.cursor.style.top = cursorY + 'px';
      }

      if (this.cursorFollower) {
        this.cursorFollower.style.left = followerX - 15 + 'px';
        this.cursorFollower.style.top = followerY - 15 + 'px';
      }

      requestAnimationFrame(animateCursor);
    };

    animateCursor();
  }

  setupCursorInteractions() {
    const interactiveElements = document.querySelectorAll('a, button, .btn, .nav-link, .social-link');

    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.cursor.style.transform = 'scale(1.5)';
        this.cursorFollower.style.transform = 'scale(1.5)';
        this.cursorFollower.style.opacity = '1';
      });

      element.addEventListener('mouseleave', () => {
        this.cursor.style.transform = 'scale(1)';
        this.cursorFollower.style.transform = 'scale(1)';
        this.cursorFollower.style.opacity = '0.5';
      });
    });
  }
}

// ===== LAZY LOADING =====
class LazyLoader {
  constructor() {
    this.images = document.querySelectorAll('img[data-src]');
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      this.loadAllImages();
    }
  }

  setupIntersectionObserver() {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          imageObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px'
    });

    this.images.forEach(img => imageObserver.observe(img));
  }

  loadImage(img) {
    img.src = img.dataset.src;
    img.classList.add('loaded');
    img.removeAttribute('data-src');
  }

  loadAllImages() {
    this.images.forEach(img => this.loadImage(img));
  }
}

// ===== CONTACT FORM HANDLER =====
class ContactFormHandler {
  constructor() {
    this.form = document.querySelector('.contact-form');
    this.init();
  }

  init() {
    if (this.form) {
      this.setupFormValidation();
      this.setupFormSubmission();
    }
  }

  setupFormValidation() {
    const inputs = this.form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearErrors(input));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;

    // Clear previous errors
    this.clearErrors(field);

    // Required field validation
    if (field.hasAttribute('required') && !value) {
      this.showError(field, 'This field is required');
      isValid = false;
    }

    // Email validation
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.showError(field, 'Please enter a valid email address');
        isValid = false;
      }
    }

    return isValid;
  }

  showError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentNode.querySelector('.error-message');
    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.className = 'error-message';
      field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
  }

  clearErrors(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
  }

  setupFormSubmission() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(this.form);
      const isValid = this.validateForm();
      
      if (isValid) {
        try {
          await this.submitForm(formData);
          this.showSuccess('Message sent successfully!');
          this.form.reset();
        } catch (error) {
          this.showError(this.form, 'Failed to send message. Please try again.');
        }
      }
    });
  }

  validateForm() {
    const inputs = this.form.querySelectorAll('input, textarea');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  async submitForm(formData) {
    // Simulate form submission
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // In a real implementation, you would send the data to your server
        resolve();
      }, 1000);
    });
  }

  showSuccess(message) {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;
    successElement.style.cssText = `
      color: #10b981;
      padding: 1rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 0.5rem;
      margin-top: 1rem;
    `;
    
    this.form.appendChild(successElement);
    
    setTimeout(() => {
      successElement.remove();
    }, 5000);
  }
}

// ===== PAGE LOADER =====
class PageLoader {
  constructor() {
    this.loader = this.createLoader();
    this.init();
  }

  createLoader() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-spinner"></div>
        <p class="loader-text">Loading Experience...</p>
      </div>
    `;
    
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--bg-color);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      transition: opacity 0.5s ease, visibility 0.5s ease;
    `;

    const spinner = loader.querySelector('.loader-spinner');
    spinner.style.cssText = `
      width: 50px;
      height: 50px;
      border: 3px solid var(--border-color);
      border-top: 3px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    `;

    return loader;
  }

  init() {
    document.body.appendChild(this.loader);
    this.setupLoadingComplete();
  }

  setupLoadingComplete() {
    const hideLoader = () => {
      this.loader.style.opacity = '0';
      this.loader.style.visibility = 'hidden';
      
      setTimeout(() => {
        if (this.loader.parentNode) {
          this.loader.parentNode.removeChild(this.loader);
        }
      }, 500);
    };

    // Hide loader when page is fully loaded
    if (document.readyState === 'complete') {
      setTimeout(hideLoader, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(hideLoader, 1000);
      });
    }
  }
}

// ===== MAIN APPLICATION =====
class PortfolioApp {
  constructor() {
    this.components = {};
    this.init();
  }

  init() {
    // Initialize all components when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }

  initializeComponents() {
    try {
      // Core components
      this.components.themeManager = new ThemeManager();
      this.components.navigationManager = new NavigationManager();
      this.components.scrollAnimations = new ScrollAnimations();
      this.components.projectsManager = new ProjectsManager();
      
      // Enhanced features
      this.components.intersectionObserverManager = new IntersectionObserverManager();
      this.components.lazyLoader = new LazyLoader();
      this.components.contactFormHandler = new ContactFormHandler();
      this.components.cursorEffects = new CursorEffects();
      
      // Performance and effects
      this.components.performanceMonitor = new PerformanceMonitor();
      this.components.pageLoader = new PageLoader();
      
      // Initialize particle system if container exists
      const particleContainer = document.querySelector('.particles-container');
      if (particleContainer) {
        this.components.particleSystem = new ParticleSystem(particleContainer);
      }
      
      // Initialize typing animation if element exists
      const typingElement = document.querySelector('.typing-text');
      if (typingElement) {
        this.components.typingAnimation = new TypingAnimation(
          typingElement,
          ['Security Specialist', 'Hardware Hacker', 'AI Security Expert', 'System Architect'],
          { typeSpeed: 80, deleteSpeed: 40, pauseDelay: 2000 }
        );
      }

      this.setupGlobalEventListeners();
      this.setupKeyboardShortcuts();
      
      console.log('🚀 Portfolio App Initialized Successfully');
    } catch (error) {
      console.error('Error initializing portfolio app:', error);
    }
  }

  setupGlobalEventListeners() {
    // Handle visibility change for performance optimization
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAnimations();
      } else {
        this.resumeAnimations();
      }
    });

    // Handle resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 250);
    });

    // Handle online/offline status
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Toggle theme with Ctrl/Cmd + D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        this.components.themeManager.toggleTheme();
      }

      // Quick navigation shortcuts
      if (e.altKey) {
        switch (e.key) {
          case '1': this.scrollToSection('home'); break;
          case '2': this.scrollToSection('about'); break;
          case '3': this.scrollToSection('experience'); break;
          case '4': this.scrollToSection('projects'); break;
          case '5': this.scrollToSection('contact'); break;
        }
      }
    });
  }

  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  pauseAnimations() {
    document.body.style.animationPlayState = 'paused';
  }

  resumeAnimations() {
    document.body.style.animationPlayState = 'running';
  }

  handleResize() {
    // Reinitialize cursor effects if needed
    if (this.components.cursorEffects && window.innerWidth <= 768) {
      this.components.cursorEffects = null;
    } else if (!this.components.cursorEffects && window.innerWidth > 768) {
      this.components.cursorEffects = new CursorEffects();
    }
  }

  handleOnline() {
    console.log('Connection restored');
    // Add online indicator or functionality
  }

  handleOffline() {
    console.log('Connection lost');
    // Add offline indicator or functionality
  }

  // Public API methods
  getComponent(name) {
    return this.components[name];
  }

  getAllComponents() {
    return this.components;
  }

  destroy() {
    // Clean up all components and event listeners
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
  }
}

// ===== GLOBAL UTILITIES =====
const utils = {
  debounce: (func, wait, immediate) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  lerp: (start, end, factor) => {
    return start + (end - start) * factor;
  },

  clamp: (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  },

  randomBetween: (min, max) => {
    return Math.random() * (max - min) + min;
  },

  easeOutCubic: (t) => {
    return 1 - Math.pow(1 - t, 3);
  },

  isElementInViewport: (el, threshold = 0) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= -threshold &&
      rect.left >= -threshold &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + threshold &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) + threshold
    );
  }
};

// ===== INITIALIZE APPLICATION =====
let portfolioApp;
let projectsManager;

// Initialize the application
portfolioApp = new PortfolioApp();
projectsManager = portfolioApp.getComponent('projectsManager');

// Export for global access
window.portfolioApp = portfolioApp;
window.projectsManager = projectsManager;
window.utils = utils;

// Add error handling for uncaught errors
window.addEventListener('error', (e) => {
  console.error('Uncaught error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

console.log('🎯 Portfolio JavaScript Loaded Successfully');