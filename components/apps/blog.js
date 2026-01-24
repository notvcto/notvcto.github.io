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

      if (this.props.blogPosts) {
        this.setState({ posts: this.props.blogPosts, loading: false });
      } else {
        // Fallback or empty state if no posts passed
        console.warn("No blog posts passed to Blog component");
        this.setState({ posts: [], loading: false, error: "No posts found." });
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      this.setState({
        posts: [],
        loading: false,
        error: "Failed to load posts."
      });
    }
  };

  handlePostSelect = (postId) => {
    try {
      this.setState({ loading: true });

      const post = this.state.posts.find(p => p.id === postId);

      if (!post) {
        throw new Error('Post not found');
      }

      this.setState({
        currentView: 'post',
        selectedPostId: postId,
        currentPost: post,
        loading: false,
      });
    } catch (error) {
      console.error('Error selecting post:', error);
      this.setState({
        currentView: 'post',
        selectedPostId: postId,
        currentPost: {
          id: postId,
          title: 'Post Not Available',
          date: new Date().toISOString().split('T')[0],
          author: 'vcto',
          contentHtml: '<p>This post is currently not available.</p>',
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

export const displayBlog = (props) => {
  return <Blog {...props} />;
};
