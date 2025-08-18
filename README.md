# Gabe's Portfolio Website

A modern, responsive portfolio website built with HTML, CSS, and JavaScript featuring a dynamic blog system.

## Project Structure

```
portfolio/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── script.js           # JavaScript functionality
├── posts/              # Blog posts directory
│   ├── posts.json      # Posts manifest file
│   ├── assembly-deep-dive.md
│   ├── the-needle-writeup.md
│   └── ...             # Other markdown files
├── public/             # Static assets
│   └── profile.jpeg    # Profile image
└── README.md           # This file
```

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Dynamic Blog System**: Easy-to-manage markdown-based blog posts
- **Smooth Animations**: Scroll-triggered animations and hover effects
- **Single Page Application**: Client-side navigation with modal post viewing

## Adding New Blog Posts

### Method 1: Using the JSON Manifest (Recommended)

1. **Create your markdown file** in the `posts/` directory:
   ```bash
   touch posts/my-new-post.md
   ```

2. **Write your post** using standard markdown:
   ```markdown
   # My New Post Title
   
   Your content here...
   
   ## Subheading
   
   More content with **bold** and *italic* text.
   
   ```code
   Code blocks are supported
   ```
   ```

3. **Update the posts manifest** (`posts/posts.json`):
   ```json
   {
     "posts": [
       {
         "slug": "my-new-post",
         "title": "My New Post Title",
         "date": "August 20, 2025",
         "description": "A brief description of your post",
         "image": "https://placehold.co/600x400/1E293B/E2E8F0?text=Your+Image",
         "tags": ["tag1", "tag2", "tag3"],
         "featured": false
       },
       // ... existing posts
     ]
   }
   ```

### Method 2: Direct File Addition

If you can't modify the JSON file, you can still add posts by:

1. Creating the markdown file in `posts/`
2. The system will fall back to displaying available posts
3. Manual content loading will still work for direct file access

## Post Metadata

Each post in `posts.json` supports:

- **slug**: URL-friendly identifier (must match markdown filename)
- **title**: Display title
- **date**: Publication date (any format)
- **description**: Brief summary for post cards
- **image**: Header image URL (use placeholder service or your own images)
- **tags**: Array of tags for categorization
- **featured**: Boolean to highlight important posts

## Markdown Features Supported

- Headers (H1-H6)
- **Bold** and *italic* text
- Code blocks with syntax highlighting
- Lists (bulleted and numbered)
- Links
- Images
- Blockquotes

## Customization

### Styling
Edit `styles.css` to modify:
- Color scheme (CSS custom properties in `:root`)
- Typography and spacing
- Component styles
- Dark/light theme variations

### Content
Update content directly in `index.html`:
- Personal information
- Experience and education
- Skills and technologies
- Contact information

### Blog System
Modify `script.js` to:
- Change post loading behavior
- Add filtering or search functionality
- Customize post rendering
- Add new page types

## Development

### Local Development
1. Clone the repository
2. Serve files using a local server (required for loading markdown files):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
3. Visit `http://localhost:8000`

### Adding Images
1. Place images in the `public/` directory
2. Reference them in your markdown or HTML:
   ```markdown
   ![Alt text](./public/your-image.jpg)
   ```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript ES6+ features used
- CSS Grid and Flexbox layouts
- No build process required

## Performance Notes

- Lazy loading for blog posts
- Efficient CSS animations
- Minimal external dependencies
- Optimized for fast loading

## License

Personal portfolio project. Feel free to use as inspiration for your own portfolio.
