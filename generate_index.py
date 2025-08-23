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