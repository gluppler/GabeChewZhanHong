# Portfolio Website - Gabe Chew Zhan Hong

A modern, responsive portfolio website built with Swiss Design principles, featuring a clean grid system, dark/light theme toggle, and dynamic content management.

![Portfolio Preview](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop)

## 🌟 Features

- **Swiss Design Principles** - Clean, minimal, grid-based layout
- **Responsive Design** - Optimized for all devices (mobile, tablet, desktop)
- **Dark/Light Theme** - Automatic system preference detection with manual toggle
- **Performance Optimized** - Fast loading times with efficient animations
- **SEO Friendly** - Proper meta tags and structured data
- **Accessibility** - WCAG compliant with keyboard navigation support
- **Progressive Enhancement** - Works without JavaScript, enhanced with JS

## 🏗️ Project Structure

```
portfolio/
├── index.html                 # Main HTML file
├── css/
│   ├── styles.css            # Main stylesheet with Swiss grid system
│   └── animations.css        # Animation library
├── js/
│   └── script.js            # JavaScript functionality
├── writeups/
│   ├── writeups.json        # Write-ups configuration
│   ├── assembly-deep-dive.md # Sample writeup
│   └── ...                  # Additional writeups
├── public/
│   ├── favicon.ico          # Site favicon
│   ├── profile.jpeg         # Profile image
│   └── ResumeCV.pdf         # Resume/CV file
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/gluppler/GabeChewZhanHong.git
cd GabeChewZhanHong
```

### 2. Set Up Local Server

Since the website uses ES6 modules and fetch API for loading markdown files, you need to serve it from a local server:

#### Using Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Using Node.js:
```bash
# Install http-server globally
npm install -g http-server

# Serve the files
http-server -p 8000
```

#### Using PHP:
```bash
php -S localhost:8000
```

### 3. Open in Browser

Navigate to `http://localhost:8000` in your web browser.

## 📝 Content Management

### Adding Projects

Projects are currently managed through the JavaScript file. To add new projects, edit `js/script.js` and add to the `projects` array:

```javascript
{
    id: 4,
    title: 'Your Project Name',
    subtitle: 'Project Type',
    description: 'Brief description of your project',
    image: 'https://your-image-url.com/image.jpg',
    tags: ['Technology1', 'Technology2'],
    github: 'https://github.com/username/repo',
    demo: 'https://your-demo-url.com',
    featured: true
}
```

### Adding Write-ups

1. **Create the markdown file** in the `writeups/` directory:
   ```bash
   touch writeups/your-writeup-slug.md
   ```

2. **Update `writeups.json`** with the new entry:
   ```json
   {
     "slug": "your-writeup-slug",
     "title": "Your Write-up Title",
     "date": "August 20, 2025",
     "description": "Brief description of your write-up",
     "readTime": "5 min read",
     "image": "https://your-image-url.com/image.jpg",
     "tags": ["Tag1", "Tag2"],
     "featured": true,
     "category": "Programming",
     "difficulty": "Intermediate"
   }
   ```

3. **Write your content** using Markdown syntax in the `.md` file.

### Updating Personal Information

Edit the following sections in `index.html`:

- **Hero section**: Update name, title, and description
- **About section**: Modify profile image and bio text
- **Skills section**: Add/remove technical skills
- **Contact information**: Update social media links and email

## 🎨 Customization

### Theme Colors

Modify CSS custom properties in `css/styles.css`:

```css
:root {
    --accent-primary: #2563eb;    /* Primary brand color */
    --accent-secondary: #1e40af;  /* Secondary brand color */
    --bg-primary: #ffffff;        /* Background color */
    /* Add more customizations */
}
```

### Typography

The website uses Inter font by default. To change fonts, update the Google Fonts import in `index.html` and the CSS font-family declarations.

### Layout Grid

The Swiss grid system is based on a 12-column layout. Adjust grid spans by changing classes:

```html
<div class="col-6">Half width</div>
<div class="col-4">One third width</div>
<div class="col-3">Quarter width</div>
```

## 🔧 Development

### CSS Architecture

- **styles.css**: Main stylesheet with grid system, typography, and component styles
- **animations.css**: Reusable animation classes and keyframes

### JavaScript Modules

The JavaScript is organized into functional modules:

- Theme management
- Navigation handling  
- Form processing
- Content loading
- Animation controls
- Performance optimizations

### Adding New Animations

Create new animations in `css/animations.css`:

```css
@keyframes your-animation {
    from { /* start state */ }
    to { /* end state */ }
}

.your-animation-class {
    animation: your-animation 0.6s ease-out;
}
```

## 📱 Responsive Breakpoints

The website uses a mobile-first approach with these breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 768px  
- **Desktop**: 768px - 1024px
- **Large Desktop**: > 1024px

## ⚡ Performance Optimization

### Images
- Use WebP format when possible
- Implement lazy loading for images below the fold
- Optimize image sizes for different screen densities

### CSS
- Critical CSS is inlined in the HTML
- Non-critical styles are loaded asynchronously
- CSS custom properties for consistent theming

### JavaScript
- Modern ES6+ syntax with graceful degradation
- Intersection Observer for scroll-based animations
- Debounced scroll handlers for better performance

## 🔒 Security Features

- Content Security Policy headers
- Input validation on forms
- XSS protection through proper escaping
- HTTPS redirect (when deployed)

## 🚀 Deployment Options

### Static Site Hosts (Recommended)

1. **Netlify**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Deploy
   netlify deploy --prod --dir .
   ```

2. **Vercel**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **GitHub Pages**:
   - Push to GitHub repository
   - Enable GitHub Pages in repository settings
   - Select source branch (usually `main`)

### Traditional Web Hosts

Upload all files to your web server's public directory (usually `public_html` or `www`).

## 🧪 Testing

### Manual Testing Checklist

- [ ] All navigation links work correctly
- [ ] Contact form validation and submission
- [ ] Theme toggle functionality
- [ ] Mobile menu operation
- [ ] Write-up modal loading and closing
- [ ] Responsive design on different screen sizes
- [ ] Performance on slower connections

### Browser Compatibility

Tested and supported in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🐛 Troubleshooting

### Common Issues

**Problem**: Markdown files not loading
**Solution**: Make sure you're serving the site from a local server, not opening HTML files directly

**Problem**: Animations not working
**Solution**: Check for `prefers-reduced-motion` setting in browser accessibility preferences

**Problem**: Theme not persisting
**Solution**: Ensure localStorage is enabled in your browser

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help customizing the portfolio:

- **Email**: chewzhanhongint@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/gluppler/GabeChewZhanHong/issues)
- **Documentation**: Check the inline code comments

## 🙏 Acknowledgments

- Swiss Design principles and typography
- Modern web development best practices
- Accessibility guidelines and WCAG standards
- Performance optimization techniques
- Open source community contributions

---

**Built with ❤️ by Gabe Chew Zhan Hong**
