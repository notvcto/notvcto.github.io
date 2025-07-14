import React, { Component } from 'react';
import BlogList from '../blog/BlogList';
import BlogPost from '../blog/BlogPost';

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
      'welcome-to-my-blog': `
        <h1>Welcome to My Blog! 👋</h1>
        <p>Hey there! Welcome to my personal blog where I share my thoughts, experiences, and learnings as a developer.</p>
        <h2>What You'll Find Here</h2>
        <p>This blog is where I document my journey through:</p>
        <ul>
          <li><strong>Programming Adventures</strong> 🚀</li>
          <li><strong>Technology Insights</strong> 💡</li>
          <li><strong>Project Deep Dives</strong> 🔍</li>
          <li><strong>Learning Experiences</strong> 📚</li>
          <li><strong>Random Developer Thoughts</strong> 💭</li>
        </ul>
        <h2>About This Blog</h2>
        <p>This blog is built right into my portfolio using:</p>
        <ul>
          <li><strong>Next.js</strong> for static site generation</li>
          <li><strong>Markdown</strong> for easy content creation</li>
          <li><strong>Tailwind CSS</strong> for styling</li>
          <li><strong>Integrated</strong> into my Ubuntu-themed portfolio</li>
        </ul>
        <h2>Stay Connected</h2>
        <p>Feel free to explore my other projects and connect with me:</p>
        <ul>
          <li>Check out my <a href="https://github.com/notvcto">GitHub</a></li>
          <li>Explore my terminal (type <code>help</code> for commands!)</li>
          <li>Browse my projects in the About section</li>
        </ul>
        <p>Thanks for stopping by, and I hope you enjoy reading my posts!</p>
        <hr>
        <p><em>Happy coding!</em> ✨</p>
      `,
      'building-this-portfolio': `
        <h1>Building This Ubuntu Portfolio 🖥️</h1>
        <p>Creating this Ubuntu-themed portfolio was one of the most fun projects I've worked on. Let me walk you through the journey!</p>
        <h2>The Inspiration</h2>
        <p>I wanted to create something that would:</p>
        <ul>
          <li>Stand out from typical portfolio websites</li>
          <li>Showcase my technical skills interactively</li>
          <li>Provide an engaging user experience</li>
          <li>Demonstrate my creativity and attention to detail</li>
        </ul>
        <h2>Technology Stack</h2>
        <h3>Core Technologies</h3>
        <ul>
          <li><strong>Next.js</strong> - For the React framework and static site generation</li>
          <li><strong>Tailwind CSS</strong> - For rapid styling and responsive design</li>
          <li><strong>React Draggable</strong> - For the window dragging functionality</li>
          <li><strong>jQuery</strong> - For some DOM manipulations (I know, I know... but it works!)</li>
        </ul>
        <h3>Key Features Implemented</h3>
        <h4>1. Window Management System</h4>
        <pre><code>// Each app runs in its own draggable window
const Window = ({ title, id, screen, ... }) => {
  // Window state management
  // Dragging, resizing, minimizing, maximizing
  // Focus management
}</code></pre>
        <h4>2. Virtual File System</h4>
        <p>The terminal includes a complete virtual file system with:</p>
        <ul>
          <li>Directory navigation (<code>cd</code>, <code>ls</code>, <code>pwd</code>)</li>
          <li>File reading (<code>cat</code>)</li>
          <li>Hidden files and easter eggs</li>
          <li>A sudo puzzle system!</li>
        </ul>
        <h4>3. Interactive Terminal</h4>
        <p>The terminal was the most complex part:</p>
        <ul>
          <li>Command history with arrow keys</li>
          <li>Real-time command parsing</li>
          <li>Sudo authentication system</li>
          <li>Easter eggs and hidden commands</li>
        </ul>
        <h2>Challenges Faced</h2>
        <h3>1. State Management</h3>
        <p>Managing the state of multiple windows, their positions, focus states, and interactions was complex. I used a combination of:</p>
        <ul>
          <li>React state for UI state</li>
          <li>localStorage for persistence</li>
          <li>Event listeners for global interactions</li>
        </ul>
        <h3>2. Terminal Implementation</h3>
        <p>Creating a realistic terminal experience required:</p>
        <ul>
          <li>Proper command parsing</li>
          <li>Cursor blinking animation</li>
          <li>Command history</li>
          <li>File system simulation</li>
        </ul>
        <h3>3. Performance Optimization</h3>
        <p>With multiple animated windows and complex interactions, performance was crucial:</p>
        <ul>
          <li>Efficient re-rendering strategies</li>
          <li>Proper cleanup of event listeners</li>
          <li>Optimized animations</li>
        </ul>
        <h2>Cool Easter Eggs</h2>
        <h3>Sudo Puzzle</h3>
        <p>Users can unlock sudo access by exploring the file system and finding hidden clues. Once unlocked, they can run commands like:</p>
        <ul>
          <li><code>sudo nuke</code> - System meltdown animation</li>
          <li><code>sudo hack the-mainframe</code> - Matrix-style hacking sequence</li>
          <li><code>sudo deploy</code> - Fake deployment sequence</li>
        </ul>
        <h3>Hidden Files</h3>
        <p>The file system contains hidden files with clues, jokes, and references scattered throughout.</p>
        <h2>What I Learned</h2>
        <ol>
          <li><strong>Complex State Management</strong> - Handling multiple interconnected components</li>
          <li><strong>User Experience Design</strong> - Creating intuitive interactions</li>
          <li><strong>Performance Optimization</strong> - Keeping animations smooth</li>
          <li><strong>Creative Problem Solving</strong> - Implementing unique features</li>
        </ol>
        <h2>Future Enhancements</h2>
        <ul>
          <li>Add more applications (text editor, file manager)</li>
          <li>Implement a package manager simulation</li>
          <li>Add network simulation features</li>
          <li>Create more interactive easter eggs</li>
        </ul>
        <h2>Conclusion</h2>
        <p>This project pushed me to think creatively about web development and user interaction. It's not just a portfolio - it's an experience that showcases both technical skills and creativity.</p>
        <p>The code is open source on <a href="https://github.com/notvcto/notvcto.github.io">GitHub</a>, so feel free to explore and get inspired for your own projects!</p>
        <hr>
        <p><em>Keep coding and stay creative!</em> 🚀</p>
      `,
      'terminal-tricks-and-tips': `
        <h1>Terminal Tricks and Tips 💻</h1>
        <p>The terminal is a developer's best friend. Here are some of my favorite tricks and tips that have made me more productive over the years.</p>
        <h2>Essential Commands</h2>
        <h3>Navigation</h3>
        <pre><code># Quick directory navigation
cd -          # Go back to previous directory
cd ~          # Go to home directory
cd            # Also goes to home directory
pushd /path   # Save current dir and go to /path
popd          # Return to saved directory</code></pre>
        <h3>File Operations</h3>
        <pre><code># Find files quickly
find . -name "*.js" -type f
find . -name "*config*" -type f

# Search within files
grep -r "function" .
grep -n "TODO" *.js

# File permissions
chmod +x script.sh    # Make executable
chmod 755 file.txt    # Set specific permissions</code></pre>
        <h2>Productivity Boosters</h2>
        <h3>History and Shortcuts</h3>
        <pre><code># Command history
!!            # Repeat last command
!n            # Repeat command number n
!string       # Repeat last command starting with string
history       # Show command history

# Keyboard shortcuts
Ctrl+R        # Search command history
Ctrl+A        # Go to beginning of line
Ctrl+E        # Go to end of line
Ctrl+U        # Clear line before cursor
Ctrl+K        # Clear line after cursor</code></pre>
        <h3>Process Management</h3>
        <pre><code># Background processes
command &     # Run in background
jobs          # List background jobs
fg %1         # Bring job 1 to foreground
bg %1         # Send job 1 to background

# Process monitoring
ps aux        # List all processes
top           # Real-time process monitor
htop          # Better process monitor (if installed)
kill -9 PID   # Force kill process</code></pre>
        <h2>Advanced Tricks</h2>
        <h3>Pipes and Redirection</h3>
        <pre><code># Combine commands
ls -la | grep "config"
cat file.txt | sort | uniq

# Redirection
command > file.txt     # Redirect output to file
command >> file.txt    # Append output to file
command 2> error.log   # Redirect errors to file
command &> all.log     # Redirect both output and errors</code></pre>
        <h3>Text Processing</h3>
        <pre><code># Powerful text tools
sed 's/old/new/g' file.txt    # Replace text
awk '{print $1}' file.txt     # Print first column
cut -d',' -f1 file.csv        # Extract first field from CSV
sort file.txt | uniq -c       # Count unique lines</code></pre>
        <h3>Network and System</h3>
        <pre><code># Network diagnostics
ping google.com
curl -I https://example.com
netstat -tuln
ss -tuln

# System information
df -h         # Disk usage
du -sh *      # Directory sizes
free -h       # Memory usage
uname -a      # System information</code></pre>
        <h2>Git Integration</h2>
        <h3>Useful Git Aliases</h3>
        <pre><code># Add to ~/.gitconfig
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    lg = log --oneline --graph --decorate
    unstage = reset HEAD --</code></pre>
        <h3>Git Terminal Tips</h3>
        <pre><code># Quick status check
git status -s

# Interactive staging
git add -p

# Beautiful log
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'</code></pre>
        <h2>Customization</h2>
        <h3>Bash/Zsh Aliases</h3>
        <pre><code># Add to ~/.bashrc or ~/.zshrc
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'
alias mkdir='mkdir -pv'</code></pre>
        <h3>Custom Functions</h3>
        <pre><code># Create and enter directory
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
}</code></pre>
        <h2>Pro Tips</h2>
        <ol>
          <li><strong>Use Tab Completion</strong> - It's your friend for file names and commands</li>
          <li><strong>Learn Regex</strong> - It makes grep, sed, and awk incredibly powerful</li>
          <li><strong>Master Your Shell</strong> - Whether bash, zsh, or fish, know its features</li>
          <li><strong>Use a Terminal Multiplexer</strong> - tmux or screen for session management</li>
          <li><strong>Customize Your Prompt</strong> - Make it informative and beautiful</li>
        </ol>
        <h2>Terminal Emulators</h2>
        <h3>Recommended Options</h3>
        <ul>
          <li><strong>iTerm2</strong> (macOS) - Feature-rich with great customization</li>
          <li><strong>Alacritty</strong> - Fast, GPU-accelerated, cross-platform</li>
          <li><strong>Hyper</strong> - Electron-based, highly customizable</li>
          <li><strong>Windows Terminal</strong> (Windows) - Modern terminal for Windows</li>
        </ul>
        <h2>Conclusion</h2>
        <p>The terminal might seem intimidating at first, but mastering it will make you significantly more productive as a developer. Start with the basics and gradually incorporate more advanced techniques into your workflow.</p>
        <p>Remember: the best terminal setup is the one that works for your specific needs and workflow!</p>
        <hr>
        <p><em>Happy terminal-ing!</em> ⚡</p>
      `
    };
    
    return content[postId] || '<p>Content not available.</p>';
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
      
      // Add content for the selected post
      const postWithContent = {
        ...post,
        contentHtml: this.getPostContent(postId)
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
          contentHtml: '<p>This post is currently not available. Please try again later.</p>',
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