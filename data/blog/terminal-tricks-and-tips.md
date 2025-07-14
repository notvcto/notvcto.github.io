---
title: 'Terminal Tricks and Tips'
date: '2025-01-25'
author: 'vcto'
description: 'Essential terminal commands and productivity tips every developer should know.'
tags: ['terminal', 'productivity', 'linux', 'macos', 'tips']
---

# Terminal Tricks and Tips 💻

The terminal is a developer's best friend. Here are some of my favorite tricks and tips that have made me more productive over the years.

## Essential Commands

### Navigation
```bash
# Quick directory navigation
cd -          # Go back to previous directory
cd ~          # Go to home directory
cd            # Also goes to home directory
pushd /path   # Save current dir and go to /path
popd          # Return to saved directory
```

### File Operations
```bash
# Find files quickly
find . -name "*.js" -type f
find . -name "*config*" -type f

# Search within files
grep -r "function" .
grep -n "TODO" *.js

# File permissions
chmod +x script.sh    # Make executable
chmod 755 file.txt    # Set specific permissions
```

## Productivity Boosters

### History and Shortcuts
```bash
# Command history
!!            # Repeat last command
!n            # Repeat command number n
!string       # Repeat last command starting with string
history       # Show command history

# Keyboard shortcuts
Ctrl+R        # Search command history
Ctrl+A        # Go to beginning of line
Ctrl+E        # Go to end of line
Ctrl+U        # Clear line before cursor
Ctrl+K        # Clear line after cursor
```

### Process Management
```bash
# Background processes
command &     # Run in background
jobs          # List background jobs
fg %1         # Bring job 1 to foreground
bg %1         # Send job 1 to background

# Process monitoring
ps aux        # List all processes
top           # Real-time process monitor
htop          # Better process monitor (if installed)
kill -9 PID   # Force kill process
```

## Advanced Tricks

### Pipes and Redirection
```bash
# Combine commands
ls -la | grep "config"
cat file.txt | sort | uniq

# Redirection
command > file.txt     # Redirect output to file
command >> file.txt    # Append output to file
command 2> error.log   # Redirect errors to file
command &> all.log     # Redirect both output and errors
```

### Text Processing
```bash
# Powerful text tools
sed 's/old/new/g' file.txt    # Replace text
awk '{print $1}' file.txt     # Print first column
cut -d',' -f1 file.csv        # Extract first field from CSV
sort file.txt | uniq -c       # Count unique lines
```

### Network and System
```bash
# Network diagnostics
ping google.com
curl -I https://example.com
netstat -tuln
ss -tuln

# System information
df -h         # Disk usage
du -sh *      # Directory sizes
free -h       # Memory usage
uname -a      # System information
```

## Git Integration

### Useful Git Aliases
```bash
# Add to ~/.gitconfig
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    lg = log --oneline --graph --decorate
    unstage = reset HEAD --
```

### Git Terminal Tips
```bash
# Quick status check
git status -s

# Interactive staging
git add -p

# Beautiful log
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'
```

## Customization

### Bash/Zsh Aliases
```bash
# Add to ~/.bashrc or ~/.zshrc
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'
alias mkdir='mkdir -pv'
```

### Custom Functions
```bash
# Create and enter directory
mkcd() {
    mkdir -p "$1" && cd "$1"
}

# Extract any archive
extract() {
    if [ -f $1 ] ; then
        case $1 in
            *.tar.bz2)   tar xjf $1     ;;
            *.tar.gz)    tar xzf $1     ;;
            *.bz2)       bunzip2 $1     ;;
            *.rar)       unrar e $1     ;;
            *.gz)        gunzip $1      ;;
            *.tar)       tar xf $1      ;;
            *.tbz2)      tar xjf $1     ;;
            *.tgz)       tar xzf $1     ;;
            *.zip)       unzip $1       ;;
            *.Z)         uncompress $1  ;;
            *.7z)        7z x $1        ;;
            *)     echo "'$1' cannot be extracted via extract()" ;;
        esac
    else
        echo "'$1' is not a valid file"
    fi
}
```

## Pro Tips

1. **Use Tab Completion** - It's your friend for file names and commands
2. **Learn Regex** - It makes grep, sed, and awk incredibly powerful
3. **Master Your Shell** - Whether bash, zsh, or fish, know its features
4. **Use a Terminal Multiplexer** - tmux or screen for session management
5. **Customize Your Prompt** - Make it informative and beautiful

## Terminal Emulators

### Recommended Options
- **iTerm2** (macOS) - Feature-rich with great customization
- **Alacritty** - Fast, GPU-accelerated, cross-platform
- **Hyper** - Electron-based, highly customizable
- **Windows Terminal** (Windows) - Modern terminal for Windows

## Conclusion

The terminal might seem intimidating at first, but mastering it will make you significantly more productive as a developer. Start with the basics and gradually incorporate more advanced techniques into your workflow.

Remember: the best terminal setup is the one that works for your specific needs and workflow!

---

*Happy terminal-ing!* ⚡