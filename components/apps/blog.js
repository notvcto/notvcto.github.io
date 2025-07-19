import React, { Component } from 'react';
import BlogList from '../blog/BlogList';
import BlogPost from '../blog/BlogPost';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

export class Blog extends Component {
  constructor() {
    super();
    this.state = {
      currentView: 'list', // 'list' or 'post'
      selectedPostId: null,
      posts: [],
      currentPost: null,
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchPosts();
  }

  fetchPosts = async () => {
    try {
      this.setState({ loading: true });
      
      // Use static posts data for static export
      const posts = this.getStaticPosts();
      this.setState({ posts, loading: false });
    } catch (error) {
      console.error('Error fetching posts:', error);
      this.setState({ 
        posts: this.getStaticPosts(),
        loading: false,
        error: null
      });
    }
  };

  getStaticPosts = () => {
    // Fallback static posts data
    return [
      {
        id: 'welcome-to-my-blog',
        title: 'Welcome to My Blog',
        date: '2025-01-27',
        author: 'vcto',
        description: 'Welcome to my personal blog where I share thoughts on programming, technology, and life as a developer.',
        tags: ['welcome', 'introduction', 'programming'],
      },
      {
        id: 'building-this-portfolio',
        title: 'Building This Ubuntu Portfolio',
        date: '2025-01-26',
        author: 'vcto',
        description: 'A deep dive into how I built this interactive Ubuntu-themed portfolio using React, Next.js, and lots of creativity.',
        tags: ['portfolio', 'react', 'nextjs', 'ubuntu', 'web-development'],
      },
      {
        id: 'terminal-tricks-and-tips',
        title: 'Terminal Tricks and Tips',
        date: '2025-01-25',
        author: 'vcto',
        description: 'Essential terminal commands and productivity tips every developer should know.',
        tags: ['terminal', 'productivity', 'linux', 'macos', 'tips'],
      },
    ];
  };

  getPostContent = (postId) => {
    // Static content for each post
    const content = {
      'welcome-to-my-blog': `# Welcome to My Blog! 👋

Hey there! Welcome to my personal blog where I share my thoughts, experiences, and learnings as a developer.

## What You'll Find Here

This blog is where I document my journey through:

- **Programming Adventures** 🚀
- **Technology Insights** 💡
- **Project Deep Dives** 🔍
- **Learning Experiences** 📚
- **Random Developer Thoughts** 💭

## About This Blog

This blog is built right into my portfolio using:

- **Next.js** for static site generation
- **Markdown** for easy content creation
- **Tailwind CSS** for styling
- **Integrated** into my Ubuntu-themed portfolio

## Stay Connected

Feel free to explore my other projects and connect with me:

- Check out my [GitHub](https://github.com/notvcto)
- Explore my terminal (type \`help\` for commands!)
- Browse my projects in the About section

Thanks for stopping by, and I hope you enjoy reading my posts!

---

*Happy coding!* ✨`,
      'building-this-portfolio': `# Building This Ubuntu Portfolio 🖥️

Creating this Ubuntu-themed portfolio was one of the most fun projects I've worked on. Let me walk you through the journey!

## The Inspiration

I wanted to create something that would:
- Stand out from typical portfolio websites
- Showcase my technical skills interactively
- Provide an engaging user experience
- Demonstrate my creativity and attention to detail

## Technology Stack

### Core Technologies
- **Next.js** - For the React framework and static site generation
- **Tailwind CSS** - For rapid styling and responsive design
- **React Draggable** - For the window dragging functionality
- **jQuery** - For some DOM manipulations (I know, I know... but it works!)

### Key Features Implemented

#### 1. Window Management System
\`\`\`javascript
// Each app runs in its own draggable window
const Window = ({ title, id, screen, ... }) => {
  // Window state management
  // Dragging, resizing, minimizing, maximizing
  // Focus management
}
\`\`\`

#### 2. Virtual File System
The terminal includes a complete virtual file system with:
- Directory navigation (\`cd\`, \`ls\`, \`pwd\`)
- File reading (\`cat\`)
- Hidden files and easter eggs
- A sudo puzzle system!

#### 3. Interactive Terminal
The terminal was the most complex part:
- Command history with arrow keys
- Real-time command parsing
- Sudo authentication system
- Easter eggs and hidden commands

## Challenges Faced

### 1. State Management
Managing the state of multiple windows, their positions, focus states, and interactions was complex. I used a combination of:
- React state for UI state
- localStorage for persistence
- Event listeners for global interactions

### 2. Terminal Implementation
Creating a realistic terminal experience required:
- Proper command parsing
- Cursor blinking animation
- Command history
- File system simulation

### 3. Performance Optimization
With multiple animated windows and complex interactions, performance was crucial:
- Efficient re-rendering strategies
- Proper cleanup of event listeners
- Optimized animations

## Cool Easter Eggs

### Sudo Puzzle
Users can unlock sudo access by exploring the file system and finding hidden clues. Once unlocked, they can run commands like:
- \`sudo nuke\` - System meltdown animation
- \`sudo hack the-mainframe\` - Matrix-style hacking sequence
- \`sudo deploy\` - Fake deployment sequence

### Hidden Files
The file system contains hidden files with clues, jokes, and references scattered throughout.

## What I Learned

1. **Complex State Management** - Handling multiple interconnected components
2. **User Experience Design** - Creating intuitive interactions
3. **Performance Optimization** - Keeping animations smooth
4. **Creative Problem Solving** - Implementing unique features

## Future Enhancements

- Add more applications (text editor, file manager)
- Implement a package manager simulation
- Add network simulation features
- Create more interactive easter eggs

## Conclusion

This project pushed me to think creatively about web development and user interaction. It's not just a portfolio - it's an experience that showcases both technical skills and creativity.

The code is open source on [GitHub](https://github.com/notvcto/notvcto.github.io), so feel free to explore and get inspired for your own projects!

---

*Keep coding and stay creative!* 🚀`,
      'terminal-tricks-and-tips': `# Terminal Tricks and Tips 💻

The terminal is a developer's best friend. Here are some of my favorite tricks and tips that have made me more productive over the years.

## Essential Commands

### Navigation
\`\`\`bash
# Quick directory navigation
cd -          # Go back to previous directory
cd ~          # Go to home directory
cd            # Also goes to home directory
pushd /path   # Save current dir and go to /path
popd          # Return to saved directory
\`\`\`

### File Operations
\`\`\`bash
# Find files quickly
find . -name "*.js" -type f
find . -name "*config*" -type f

# Search within files
grep -r "function" .
grep -n "TODO" *.js

# File permissions
chmod +x script.sh    # Make executable
chmod 755 file.txt    # Set specific permissions
\`\`\`

## Productivity Boosters

### History and Shortcuts
\`\`\`bash
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
\`\`\`

### Process Management
\`\`\`bash
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
\`\`\`

## Advanced Tricks

### Pipes and Redirection
\`\`\`bash
# Combine commands
ls -la | grep "config"
cat file.txt | sort | uniq

# Redirection
command > file.txt     # Redirect output to file
command >> file.txt    # Append output to file
command 2> error.log   # Redirect errors to file
command &> all.log     # Redirect both output and errors
\`\`\`

### Text Processing
\`\`\`bash
# Powerful text tools
sed 's/old/new/g' file.txt    # Replace text
awk '{print $1}' file.txt     # Print first column
cut -d',' -f1 file.csv        # Extract first field from CSV
sort file.txt | uniq -c       # Count unique lines
\`\`\`

### Network and System
\`\`\`bash
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
\`\`\`

## Git Integration

### Useful Git Aliases
\`\`\`bash
# Add to ~/.gitconfig
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    lg = log --oneline --graph --decorate
    unstage = reset HEAD --
\`\`\`

### Git Terminal Tips
\`\`\`bash
# Quick status check
git status -s

# Interactive staging
git add -p

# Beautiful log
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'
\`\`\`

## Customization

### Bash/Zsh Aliases
\`\`\`bash
# Add to ~/.bashrc or ~/.zshrc
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'
alias mkdir='mkdir -pv'
\`\`\`

### Custom Functions
\`\`\`bash
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
\`\`\`

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

*Happy terminal-ing!* ⚡`
    };
    
    return content[postId] || '# Content Not Available\n\nThis post is currently not available.';
  };

  processMarkdown = async (markdownContent) => {
    try {
      const processedContent = await remark()
        .use(remarkGfm)
        .use(html)
        .process(markdownContent);
      return processedContent.toString();
    } catch (error) {
      console.error('Error processing markdown:', error);
      // Fallback: convert basic markdown manually
      return markdownContent
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        .replace(/\n/gim, '<br>');
    }
  };

  handlePostSelect = async (postId) => {
    try {
      this.setState({ loading: true });
      
      // Get post from static data
      const posts = this.getStaticPosts();
      const post = posts.find(p => p.id === postId);
      
      if (!post) {
        throw new Error('Post not found');
      }
      
      // Get markdown content and process it
      const markdownContent = this.getPostContent(postId);
      const contentHtml = await this.processMarkdown(markdownContent);
      
      const postWithContent = {
        ...post,
        contentHtml
      };
      
      this.setState({
        currentView: 'post',
        selectedPostId: postId,
        currentPost: postWithContent,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching post:', error);
      this.setState({
        currentView: 'post',
        selectedPostId: postId,
        currentPost: {
          id: postId,
          title: 'Post Not Available',
          date: new Date().toISOString().split('T')[0],
          author: 'vcto',
          contentHtml: await this.processMarkdown('# Post Not Available\n\nThis post is currently not available. Please try again later.'),
          tags: ['error'],
        },
        loading: false,
        error: null
      });
    }
  };

  handleBackToList = () => {
    this.setState({
      currentView: 'list',
      selectedPostId: null,
      currentPost: null,
    });
  };

  render() {
    const { currentView, posts, currentPost, loading, error } = this.state;

    if (loading) {
      return (
        <div className="h-full w-full bg-ub-cool-grey text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-ubt-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">Loading blog posts...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full w-full bg-ub-cool-grey">
        {error && (
          <div className="bg-yellow-600 bg-opacity-20 border border-yellow-600 text-yellow-200 px-4 py-2 text-sm">
            ⚠️ {error}
          </div>
        )}
        
        {currentView === 'list' ? (
          <BlogList posts={posts} onPostSelect={this.handlePostSelect} />
        ) : (
          <BlogPost post={currentPost} onBack={this.handleBackToList} />
        )}
      </div>
    );
  }
}

export default Blog;

export const displayBlog = () => {
  return <Blog />;
};