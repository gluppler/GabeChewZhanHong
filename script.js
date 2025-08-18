document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconLight = document.getElementById('theme-icon-light');
    const themeIconDark = document.getElementById('theme-icon-dark');
    const htmlEl = document.documentElement;
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.getElementById('navbar');

    // --- THEME TOGGLER ---
    const setTheme = (theme) => {
        htmlEl.classList.remove('light', 'dark');
        htmlEl.classList.add(theme);
        
        if (theme === 'dark') {
            if(themeIconLight) themeIconLight.classList.remove('hidden');
            if(themeIconDark) themeIconDark.classList.add('hidden');
        } else {
            if(themeIconLight) themeIconLight.classList.add('hidden');
            if(themeIconDark) themeIconDark.classList.remove('hidden');
        }
        localStorage.setItem('theme', theme);
    };

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlEl.classList.contains('dark') ? 'dark' : 'light';
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    // --- MOBILE MENU ---
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- NAVBAR STYLE ON SCROLL ---
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('border-color', 'shadow-md');
            else navbar.classList.remove('border-color', 'shadow-md');
        });
    }

    // --- SCROLL ANIMATIONS ---
    const animatedElements = document.querySelectorAll('.scroll-animate');
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    const staggerItems = entry.target.querySelectorAll('.stagger-item');
                    staggerItems.forEach((item, index) => {
                        item.style.animationDelay = `${index * 0.1}s`;
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    }

    // --- DYNAMIC CONTENT LOADING ---
    const postsContainer = document.getElementById('posts-container');
    const postContent = document.getElementById('post-content');
    const projectsContainer = document.getElementById('projects-container');

    // Load projects on the main page
    if (projectsContainer) {
        fetch('projects.json')
            .then(response => response.json())
            .then(projects => {
                projectsContainer.innerHTML = ''; // Clear loading text
                projects.forEach(project => {
                    const projectElement = document.createElement('div');
                    projectElement.className = 'card-bg rounded-lg shadow-lg overflow-hidden animated-card';
                    projectElement.innerHTML = `
                        <img src="${project.image}" alt="${project.title}" class="w-full h-48 object-cover">
                        <div class="p-6">
                            <h3 class="text-xl font-bold mb-2">${project.title}</h3>
                            <p class="opacity-80 mb-4">${project.description}</p>
                            <a href="${project.link}" class="accent-text font-semibold hover:underline">Read More &rarr;</a>
                        </div>
                    `;
                    projectsContainer.appendChild(projectElement);
                });
            })
            .catch(error => {
                projectsContainer.innerHTML = '<p class="col-span-full text-center text-red-500">Could not load projects.</p>';
                console.error('Error fetching projects:', error);
            });
    }

    // Load blog posts on the blog page
    if (postsContainer) {
        fetch('posts.json')
            .then(response => response.json())
            .then(posts => {
                postsContainer.innerHTML = ''; // Clear loading text
                posts.forEach(post => {
                    const postElement = document.createElement('div');
                    postElement.className = 'card-bg rounded-lg shadow-lg overflow-hidden animated-card';
                    postElement.innerHTML = `
                        <img src="${post.image}" alt="${post.title}" class="w-full h-48 object-cover">
                        <div class="p-6">
                            <p class="text-sm opacity-60 mb-2">${post.date}</p>
                            <h3 class="text-xl font-bold mb-2">${post.title}</h3>
                            <p class="opacity-80 mb-4">${post.description}</p>
                            <a href="post.html?slug=${post.slug}" class="accent-text font-semibold hover:underline">Read More &rarr;</a>
                        </div>
                    `;
                    postsContainer.appendChild(postElement);
                });
            })
            .catch(error => {
                postsContainer.innerHTML = '<p class="col-span-full text-center text-red-500">Could not load posts.</p>';
                console.error('Error fetching posts:', error);
            });
    }

    // Load a single post on the post page
    if (postContent) {
        const urlParams = new URLSearchParams(window.location.search);
        const postSlug = urlParams.get('slug');

        if (postSlug) {
            fetch('posts.json')
                .then(res => res.json())
                .then(posts => {
                    const postMeta = posts.find(p => p.slug === postSlug);
                    if (postMeta) {
                        document.title = postMeta.title;
                        document.getElementById('post-title').textContent = postMeta.title;
                        document.getElementById('post-meta').textContent = `By Gabe Chew Zhan Hong • ${postMeta.date}`;
                        return fetch(`posts/${postSlug}.md`);
                    } else {
                        throw new Error('Post not found in manifest.');
                    }
                })
                .then(response => {
                    if (!response.ok) throw new Error('Markdown file not found.');
                    return response.text();
                })
                .then(markdown => {
                    document.getElementById('post-body').innerHTML = marked.parse(markdown);
                })
                .catch(error => {
                    document.getElementById('post-body').innerHTML = `<p class="text-red-500 text-center">${error.message}</p>`;
                    console.error('Error fetching post content:', error);
                });
        } else {
            document.getElementById('post-body').innerHTML = '<p class="text-red-500 text-center">No post specified.</p>';
        }
    }
});