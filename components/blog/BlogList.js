import React from 'react';

const BlogList = ({ posts, onPostSelect }) => {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📝 vcto's Blog</h1>
          <p className="text-gray-300">
            Thoughts, experiences, and learnings from my journey as a developer
          </p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() => onPostSelect(post.id)}
              className="bg-ub-window-title border border-gray-700 rounded-lg p-6 hover:bg-ub-warm-grey hover:bg-opacity-10 cursor-pointer transition-all duration-200 hover:border-gray-600"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold text-white hover:text-ubt-blue transition-colors">
                  {post.title}
                </h2>
                <time className="text-sm text-gray-400 whitespace-nowrap ml-4">
                  {formatDate(post.date)}
                </time>
              </div>

              <p className="text-gray-300 mb-4 leading-relaxed">
                {post.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-1 text-xs rounded-full text-white ${getTagColor(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <span className="mr-2">by {post.author}</span>
                  <span className="text-ubt-blue">Read more →</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No posts yet</h3>
            <p className="text-gray-400">Check back soon for new content!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;