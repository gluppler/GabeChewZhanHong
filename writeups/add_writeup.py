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