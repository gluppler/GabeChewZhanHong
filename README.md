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
GabeChewZhanHong/
├── index.html
├── writeups.html
├── css/
│   ├── styles.css
│   └── animations.css
├── js/
│   └── script.js
│   └── writeups.js
├── public/
│   ├── favicon.ico
│   ├── profile.webp
│   └── ChewZhanHongCV.pdf
└── writeups/
    ├── writeups.json
    └── [your writeup .md files]
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

# HackTheBox Writeup Management System

This system allows you to easily add new writeups by creating markdown files in a structured way.

## Directory Structure

Create the following directory structure in your project:

```
portfolio/
├── writeups/
│   ├── index.json          # Writeup metadata index
│   ├── htb-824.md          # Individual writeup files
│   ├── htb-220.md
│   ├── htb-207.md
│   └── ...
├── css/
│   ├── styles.css          # Main styles (existing)
│   └── animations.css      # Animations (existing)
├── js/
│   ├── script.js          # Main script (existing)
│   └── writeups.js        # Fixed writeups script
└── writeups.html          # Fixed writeups page
```

## Adding a New Writeup

### Step 1: Create the Markdown File

Create a new file in the `writeups/` directory with the naming convention `htb-[challenge-id].md`:

```markdown
---
title: "Advanced ARM64 Binary Analysis - HTB 824"
description: "Detailed reverse engineering analysis including disassembly, debugging techniques, and exploit development strategies."
category: "reversing"
platform: "HackTheBox"
difficulty: "hard"
date: "2025-01-15"
tags: ["ARM64", "Assembly", "Anti-Debug", "Embedded"]
featured: true
htbUrl: "https://labs.hackthebox.com/achievement/challenge/2141842/824"
---

# Advanced ARM64 Binary Analysis - HTB 824

## Challenge Overview
This writeup covers the solution for HackTheBox challenge 824, focusing on advanced ARM64 reverse engineering techniques.

## Initial Analysis
First, let's examine the binary structure:

```bash
file challenge_binary
objdump -d challenge_binary | head -50
```

The binary is stripped and implements several protection mechanisms:
- Stack canaries
- ASLR (Address Space Layout Randomization)
- Custom anti-debugging checks
- Encrypted string literals

## ARM64 Assembly Deep Dive
The main function contains interesting ARM64 instructions:

```assembly
stp     x29, x30, [sp, #-16]!
mov     x29, sp
mov     w0, #0x1337
bl      check_debugger
cmp     w0, #0
bne     exit_program
```

## Anti-Debugging Techniques
The binary implements multiple anti-debugging checks:

1. **PTRACE Detection**: Checks if a debugger is attached
2. **Timing Attacks**: Measures execution time to detect single-stepping
3. **Hardware Breakpoint Detection**: Monitors debug registers

## Exploitation Strategy
To bypass these protections, we need to:

1. Patch the anti-debugging checks
2. Extract encrypted strings
3. Identify the vulnerability
4. Develop a custom exploit

## Solution Steps

### Step 1: Bypassing Anti-Debug
```python
import struct
import subprocess

def patch_binary(binary_path):
    with open(binary_path, 'rb') as f:
        data = bytearray(f.read())
    
    # Patch anti-debug check at offset 0x1234
    data[0x1234:0x1238] = struct.pack('<I', 0xe1a00000)  # NOP
    
    with open('patched_binary', 'wb') as f:
        f.write(data)

patch_binary('challenge_binary')
```

### Step 2: String Decryption
The encrypted strings use a simple XOR cipher:

```python
def decrypt_string(encrypted_data, key):
    decrypted = []
    for i, byte in enumerate(encrypted_data):
        decrypted.append(byte ^ key[i % len(key)])
    return bytes(decrypted).decode('utf-8')

# Extract and decrypt strings
key = b'\xde\xad\xbe\xef'
encrypted = b'\x12\x34\x56\x78...'
flag = decrypt_string(encrypted, key)
print(f"Flag: {flag}")
```

## Key Takeaways
- ARM64 reverse engineering requires understanding of the AArch64 instruction set
- Anti-debugging techniques can be bypassed with careful binary patching
- Dynamic analysis combined with static analysis yields the best results

## Tools Used
- Ghidra
- GDB with GEF extension
- Radare2
- Custom Python scripts

## Flag
`HTB{arm64_r3v3rs1ng_m4st3r_2025}`

## References
- [ARM64 Architecture Reference Manual](https://developer.arm.com/documentation)
- [GEF Documentation](https://hugsy.github.io/gef/)
```

### Step 2: Update the Index File

Create or update `writeups/index.json`:

```json
{
  "writeups": [
    {
      "id": "htb-824",
      "title": "Advanced ARM64 Binary Analysis - HTB 824",
      "description": "Detailed reverse engineering analysis including disassembly, debugging techniques, and exploit development strategies.",
      "category": "reversing",
      "platform": "HackTheBox",
      "difficulty": "hard",
      "date": "2025-01-15",
      "tags": ["ARM64", "Assembly", "Anti-Debug", "Embedded"],
      "featured": true,
      "markdownFile": "writeups/htb-824.md",
      "htbUrl": "https://labs.hackthebox.com/achievement/challenge/2141842/824"
    },
    {
      "id": "htb-220",
      "title": "Buffer Overflow Exploitation - HTB 220",
      "description": "Binary exploitation walkthrough covering vulnerability discovery, payload crafting, and successful exploitation.",
      "category": "pwn",
      "platform": "HackTheBox",
      "difficulty": "medium",
      "date": "2024-12-20",
      "tags": ["Buffer Overflow", "Stack", "Exploitation", "GDB"],
      "featured": false,
      "markdownFile": "writeups/htb-220.md",
      "htbUrl": "https://labs.hackthebox.com/achievement/challenge/2141842/220"
    }
  ]
}
```

### Step 3: Update the JavaScript to Load from Index

Modify the `loadWriteupsIndex()` method in `writeups.js`:

```javascript
async loadWriteupsIndex() {
  try {
    // Load from index.json file
    const response = await fetch('writeups/index.json');
    if (!response.ok) {
      throw new Error('Failed to load writeups index');
    }
    
    const data = await response.json();
    this.writeups = data.writeups || [];
    this.updateStats();
  } catch (error) {
    console.error('Failed to load writeups:', error);
    // Fallback to generated data if index.json doesn't exist
    this.writeups = await this.generateWriteupsFromSolvedChallenges();
  }
}
```

## Supported Categories

The system supports the following HackTheBox categories:

- **AI-ML**: Machine learning and artificial intelligence challenges
- **Reversing**: Reverse engineering and binary analysis
- **Pwn**: Binary exploitation and memory corruption
- **Hardware**: Hardware hacking and embedded systems
- **ICS**: Industrial Control Systems security
- **Secure Coding**: Secure development practices
- **Mobile**: Mobile application security
- **Misc**: Miscellaneous challenges
- **OSINT**: Open Source Intelligence gathering
- **Coding**: Programming and algorithm challenges
- **Blockchain**: Blockchain and cryptocurrency security
- **Crypto**: Cryptography and cryptanalysis

## Difficulty Levels

- **easy**: Green badge
- **medium**: Yellow badge
- **hard**: Red badge
- **insane**: Purple badge

## Markdown Features Supported

The system supports standard markdown with the following features:

### Headers
```markdown
# H1 Header
## H2 Header
### H3 Header
```

### Code Blocks
```markdown
\```bash
command here
\```

\```python
# Python code here
print("Hello, world!")
\```
```

### Inline Code
```markdown
Use `inline code` for short snippets
```

### Lists
```markdown
1. Numbered list item
2. Another item

- Bullet point
- Another bullet
```

### Links
```markdown
[Link text](https://example.com)
```

### Emphasis
```markdown
**Bold text**
*Italic text*
```

## Front Matter Fields

Each markdown file should include YAML front matter with the following fields:

- `title` (required): The writeup title
- `description` (required): Brief description for the card
- `category` (required): One of the supported categories
- `platform` (optional): Default is "HackTheBox"
- `difficulty` (required): easy, medium, hard, or insane
- `date` (required): Publication date in YYYY-MM-DD format
- `tags` (required): Array of relevant tags
- `featured` (optional): Boolean to mark as featured
- `htbUrl` (optional): Direct link to the HackTheBox challenge

## Automation Scripts

### Quick Add Script (add_writeup.py)

```python
#!/usr/bin/env python3
import json
import os
import sys
from datetime import datetime

def add_writeup():
    if len(sys.argv) < 4:
        print("Usage: python3 add_writeup.py <challenge_id> <title> <category> [difficulty]")
        return
    
    challenge_id = sys.argv[1]
    title = sys.argv[2]
    category = sys.argv[3]
    difficulty = sys.argv[4] if len(sys.argv) > 4 else "medium"
    
    # Create markdown file
    markdown_content = f"""---
title: "{title} - HTB {challenge_id}"
description: "Solution walkthrough for HackTheBox challenge {challenge_id}."
category: "{category}"
platform: "HackTheBox"
difficulty: "{difficulty}"
date: "{datetime.now().strftime('%Y-%m-%d')}"
tags: ["HackTheBox", "{category.title()}"]
featured: false
htbUrl: "https://labs.hackthebox.com/achievement/challenge/2141842/{challenge_id}"
---

# {title} - HTB {challenge_id}

## Challenge Overview
[Add challenge description here]

## Solution
[Add detailed solution steps here]

## Flag
`HTB{{[flag_here]}}`
"""
    
    # Write markdown file
    with open(f"writeups/htb-{challenge_id}.md", "w") as f:
        f.write(markdown_content)
    
    print(f"Created writeup file: writeups/htb-{challenge_id}.md")
    print(f"Don't forget to update writeups/index.json!")

if __name__ == "__main__":
    add_writeup()
```

### Index Generator Script (generate_index.py)

```python
#!/usr/bin/env python3
import json
import os
import yaml
import glob

def generate_index():
    writeups = []
    
    # Find all markdown files
    for md_file in glob.glob("writeups/*.md"):
        if md_file.endswith("index.md"):
            continue
            
        with open(md_file, "r") as f:
            content = f.read()
        
        # Extract front matter
        if content.startswith("---\n"):
            _, front_matter, _ = content.split("---\n", 2)
            metadata = yaml.safe_load(front_matter)
            
            # Extract ID from filename
            filename = os.path.basename(md_file)
            challenge_id = filename.replace(".md", "")
            
            writeup = {
                "id": challenge_id,
                "title": metadata.get("title", ""),
                "description": metadata.get("description", ""),
                "category": metadata.get("category", "misc"),
                "platform": metadata.get("platform", "HackTheBox"),
                "difficulty": metadata.get("difficulty", "medium"),
                "date": metadata.get("date", ""),
                "tags": metadata.get("tags", []),
                "featured": metadata.get("featured", False),
                "markdownFile": md_file,
                "htbUrl": metadata.get("htbUrl", "")
            }
            
            writeups.append(writeup)
    
    # Sort by date (newest first)
    writeups.sort(key=lambda x: x["date"], reverse=True)
    
    # Write index file
    index_data = {"writeups": writeups}
    with open("writeups/index.json", "w") as f:
        json.dump(index_data, f, indent=2)
    
    print(f"Generated index with {len(writeups)} writeups")

if __name__ == "__main__":
    generate_index()
```

## Usage Examples

### Adding a New Writeup Manually

1. Create `writeups/htb-999.md`
2. Add front matter and content
3. Update `writeups/index.json` or run `generate_index.py`
4. The writeup will appear automatically on the page

### Using the Quick Add Script

```bash
python3 add_writeup.py 999 "SQL Injection Challenge" "misc" "easy"
```

### Regenerating the Index

```bash
python3 generate_index.py
```

This system makes it very easy to add new writeups by simply creating markdown files and updating the index. The JavaScript will automatically load and display them with proper formatting and filtering.

**GitHub Pages**:
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
