import React from 'react';

const BlogPost = ({ post, onBack }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTagColor = (tag) => {
    const colors = {
      'welcome': 'bg-green-500',
      'introduction': 'bg-blue-500',
      'programming': 'bg-purple-500',
      'portfolio': 'bg-orange-500',
      'react': 'bg-cyan-500',
      'nextjs': 'bg-gray-700',
      'ubuntu': 'bg-orange-600',
      'web-development': 'bg-indigo-500',
      'terminal': 'bg-gray-800',
      'productivity': 'bg-yellow-500',
      'linux': 'bg-black',
      'macos': 'bg-gray-600',
      'tips': 'bg-green-600',
    };
    return colors[tag] || 'bg-gray-500';
  };

  return (
    <div className="h-full w-full bg-ub-cool-grey text-white overflow-y-auto windowMainScreen">
      <div className="p-6">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-ubt-blue hover:text-white transition-colors"
        >
          <span className="mr-2">←</span>
          Back to Blog
        </button>

        {/* Post header */}
        <header className="mb-8 pb-6 border-b border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center">
              <span className="mr-2">📅</span>
              <time>{formatDate(post.date)}</time>
            </div>
            <div className="flex items-center">
              <span className="mr-2">✍️</span>
              <span>by {post.author}</span>
            </div>
          </div>

          {post.tags && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-3 py-1 text-xs rounded-full text-white ${getTagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Post content */}
        <article 
          className="markdown-content text-gray-300 leading-relaxed"
          style={{
            '--heading-color': '#ffffff',
            '--text-color': '#d1d5db',
            '--link-color': '#3465A4',
            '--code-color': '#F39A21',
            '--code-bg': '#201f1f',
            '--border-color': '#374151'
          }}
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Post footer */}
        <footer className="mt-12 pt-6 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="flex items-center text-ubt-blue hover:text-white transition-colors"
            >
              <span className="mr-2">←</span>
              Back to Blog
            </button>
            
            <div className="text-sm text-gray-400">
              Thanks for reading! 🚀
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BlogPost;