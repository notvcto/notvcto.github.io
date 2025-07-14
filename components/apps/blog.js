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
        <p>Welcome to my personal blog! I'm excited to share my thoughts, experiences, and insights about programming, technology, and life as a developer.</p>
        <p>This blog will cover a wide range of topics including:</p>
        <ul>
          <li>Web development tutorials and best practices</li>
          <li>Programming language deep dives</li>
          <li>Technology trends and analysis</li>
          <li>Personal projects and case studies</li>
          <li>Career advice and industry insights</li>
        </ul>
        <p>I hope you find the content valuable and engaging. Feel free to reach out if you have any questions or suggestions for future posts!</p>
      `,
      'building-this-portfolio': `
        <p>Building this Ubuntu-themed portfolio was an exciting challenge that combined my love for Linux with modern web development technologies.</p>
        <h2>Technology Stack</h2>
        <p>This portfolio is built using:</p>
        <ul>
          <li><strong>Next.js</strong> - React framework for production</li>
          <li><strong>React</strong> - Component-based UI library</li>
          <li><strong>Tailwind CSS</strong> - Utility-first CSS framework</li>
          <li><strong>React Draggable</strong> - For window management</li>
        </ul>
        <h2>Key Features</h2>
        <p>The portfolio includes several interactive elements:</p>
        <ul>
          <li>Draggable windows with minimize/maximize functionality</li>
          <li>Working terminal with custom commands</li>
          <li>Multiple applications (VS Code, Calculator, etc.)</li>
          <li>Responsive design that works on all devices</li>
        </ul>
        <p>The most challenging part was recreating the Ubuntu desktop experience while maintaining good performance and accessibility.</p>
      `,
      'terminal-tricks-and-tips': `
        <p>The terminal is a powerful tool that every developer should master. Here are some essential tips and tricks to boost your productivity.</p>
        <h2>Essential Commands</h2>
        <p>These commands will save you time every day:</p>
        <ul>
          <li><code>cd -</code> - Switch to the previous directory</li>
          <li><code>!!</code> - Repeat the last command</li>
          <li><code>ctrl + r</code> - Search command history</li>
          <li><code>ctrl + l</code> - Clear the screen</li>
        </ul>
        <h2>Advanced Tips</h2>
        <p>Take your terminal skills to the next level:</p>
        <ul>
          <li>Use aliases for frequently used commands</li>
          <li>Master grep and find for searching</li>
          <li>Learn tmux for session management</li>
          <li>Customize your shell with oh-my-zsh</li>
        </ul>
        <p>Remember, the terminal is your friend - the more you use it, the more efficient you'll become!</p>
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