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
      
      // Fetch the blog posts data
      const response = await fetch('/api/blog/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const posts = await response.json();
      this.setState({ posts, loading: false });
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback to static data if API fails
      this.setState({ 
        posts: this.getStaticPosts(),
        loading: false,
        error: 'Using offline content'
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

  handlePostSelect = async (postId) => {
    try {
      this.setState({ loading: true });
      
      // Fetch individual post content
      const response = await fetch(`/api/blog/posts/${postId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      
      const post = await response.json();
      this.setState({
        currentView: 'post',
        selectedPostId: postId,
        currentPost: post,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching post:', error);
      // Fallback to showing a placeholder post
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
        error: 'Post content unavailable'
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