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
          className="prose prose-invert prose-lg max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-8
            prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-6
            prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4
            prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-ubt-blue prose-a:no-underline hover:prose-a:text-white hover:prose-a:underline
            prose-strong:text-white prose-strong:font-semibold
            prose-code:text-ubt-gedit-orange prose-code:bg-ub-window-title prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-ub-window-title prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-lg prose-pre:p-4
            prose-blockquote:border-l-4 prose-blockquote:border-ubt-blue prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400
            prose-ul:text-gray-300 prose-ol:text-gray-300
            prose-li:mb-1
            prose-hr:border-gray-700 prose-hr:my-8"
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