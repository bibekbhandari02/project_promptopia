"use client";

import { useState, useEffect } from "react";

import PromptCard from "./PromptCard";

const PromptCardList = ({ data, handleTagClick }) => {
  return (
    <div className='mt-4 prompt_layout'>
      {data.map((post) => (
        <PromptCard
          key={post._id}
          post={post}
          handleTagClick={handleTagClick}
        />
      ))}
    </div>
  );
};

const Feed = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);

  // Search states
  const [searchText, setSearchText] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [searchedResults, setSearchedResults] = useState([]);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");

  const fetchPosts = async () => {
    const params = new URLSearchParams({
      category: selectedCategory,
      sortBy: sortBy,
      order: 'desc'
    });
    const response = await fetch(`/api/prompt?${params}`);
    const data = await response.json();

    setAllPosts(data);
  };

  const fetchTrending = async () => {
    const response = await fetch("/api/prompt/trending");
    const data = await response.json();
    setTrendingPosts(data);
  };

  useEffect(() => {
    fetchPosts();
    fetchTrending();
  }, [selectedCategory, sortBy]);

  const filterPrompts = (searchtext) => {
    const regex = new RegExp(searchtext, "i"); // 'i' flag for case-insensitive search
    return allPosts.filter(
      (item) =>
        regex.test(item.creator.username) ||
        regex.test(item.tag) ||
        regex.test(item.prompt)
    );
  };

  const handleSearchChange = (e) => {
    clearTimeout(searchTimeout);
    setSearchText(e.target.value);

    // debounce method
    setSearchTimeout(
      setTimeout(() => {
        const searchResult = filterPrompts(e.target.value);
        setSearchedResults(searchResult);
      }, 500)
    );
  };

  const handleTagClick = (tagName) => {
    setSearchText(tagName);

    const searchResult = filterPrompts(tagName);
    setSearchedResults(searchResult);
  };

  return (
    <section className='feed'>
      <form className='relative w-full flex-center'>
        <input
          type='text'
          placeholder='Search for a tag or a username'
          value={searchText}
          onChange={handleSearchChange}
          required
          className='search_input peer'
        />
      </form>

      {/* Filters */}
      <div className='mt-6 flex gap-4 flex-wrap items-center'>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className='px-4 py-2 rounded-lg border border-gray-300'
        >
          <option value='all'>All Categories</option>
          <option value='AI Art'>AI Art</option>
          <option value='Coding'>Coding</option>
          <option value='Writing'>Writing</option>
          <option value='Business'>Business</option>
          <option value='Education'>Education</option>
          <option value='Other'>Other</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className='px-4 py-2 rounded-lg border border-gray-300'
        >
          <option value='createdAt'>Latest</option>
          <option value='popular'>Most Popular</option>
          <option value='rating'>Highest Rated</option>
        </select>
      </div>

      {/* Trending Section */}
      {!searchText && trendingPosts.length > 0 && (
        <div className='mt-10'>
          <h2 className='font-satoshi font-bold text-2xl text-gray-900 mb-4'>
            🔥 Trending This Week
          </h2>
          <PromptCardList
            data={trendingPosts}
            handleTagClick={handleTagClick}
          />
        </div>
      )}

      {/* All Prompts */}
      <div className='mt-10'>
        <h2 className='font-satoshi font-bold text-2xl text-gray-900 mb-4'>
          {searchText ? 'Search Results' : 'All Prompts'}
        </h2>
        {searchText ? (
          <PromptCardList
            data={searchedResults}
            handleTagClick={handleTagClick}
          />
        ) : (
          <PromptCardList data={allPosts} handleTagClick={handleTagClick} />
        )}
      </div>
    </section>
  );
};

export default Feed;