import React, { useState, useMemo } from 'react';
import { getPostIcon } from './utils';

const BlogList = ({ posts, onPostSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const tags = useMemo(() => {
    const allTags = posts.flatMap(post => post.tags || []);
    return ['All', ...new Set(allTags)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts
      .filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              post.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (post.description && post.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesTag = selectedTag === 'All' || post.tags?.includes(selectedTag);
        return matchesSearch && matchesTag;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [posts, searchQuery, selectedTag]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="h-full w-full bg-ub-cool-grey text-white overflow-hidden flex flex-col windowMainScreen">
      {/* Toolbar */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 flex flex-wrap gap-4 items-center justify-between shrink-0">
        <h2 className="text-xl font-bold flex items-center">
             <img src="./themes/MoreWaita/apps/gedit.svg" alt="App Icon" className="w-6 h-6 mr-2" />
             Blog
        </h2>

        <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <input
                type="text"
                placeholder="Search..."
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-ub-orange"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Tag Filter */}
            <select
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-ub-orange max-w-[150px]"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
            >
                {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredPosts.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
                <p>No posts found matching your criteria.</p>
            </div>
        ) : (
            filteredPosts.map(post => (
                <div
                    key={post.id}
                    onClick={() => onPostSelect(post.id)}
                    className="bg-gray-800 bg-opacity-50 border border-gray-700 hover:border-ub-orange hover:bg-opacity-70 rounded-lg p-4 cursor-pointer transition-all flex items-start gap-4 group"
                >
                    <div className="bg-gray-700 p-3 rounded-lg shrink-0 border border-gray-600">
                        <img src={`./themes/MoreWaita/apps/${getPostIcon(post.tags)}.svg`} alt="" className="w-8 h-8" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-gray-200 group-hover:text-ub-orange truncate pr-4">{post.title}</h3>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(post.date)}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2 truncate">{post.description || `By ${post.author}`}</p>

                        <div className="flex gap-2 flex-wrap">
                             {post.tags && post.tags.map(tag => (
                                 <span key={tag} className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">{tag}</span>
                             ))}
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default BlogList;
