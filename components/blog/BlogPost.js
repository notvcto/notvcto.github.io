import React from 'react';
import { getPostIcon } from './utils';

const BlogPost = ({ post, onBack }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

        {/* Header */}
        <header className="mb-8 pb-6 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
            <div className="bg-gray-700 p-2 rounded-lg border border-gray-600">
                <img
                    src={`./themes/MoreWaita/apps/${getPostIcon(post.tags)}.svg`}
                    alt="icon"
                    className="w-10 h-10"
                />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300 mb-4 bg-gray-800 p-4 rounded-lg bg-opacity-40 border border-gray-700">
            <div className="flex items-center">
              <span className="text-gray-400 w-24">Author:</span>
              <span className="font-medium text-white">{post.author}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 w-24">Date:</span>
              <span className="font-medium text-white">{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center col-span-1 md:col-span-2">
              <span className="text-gray-400 w-24 shrink-0">Tags:</span>
              <div className="flex flex-wrap gap-2">
                  {post.tags && post.tags.map(tag => (
                      <span key={tag} className="bg-ub-orange bg-opacity-80 text-white px-2 py-0.5 rounded text-xs">{tag}</span>
                  ))}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
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

        {/* Footer */}
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
