// src/components/TagSelector.js
import React, { useEffect, useState } from 'react';
import { fetchTagIds } from '../utils/dataFetcher';

function TagSelector({ selectedTag, setSelectedTag }) {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const loadTagIds = async () => {
      try {
        const fetchedTags = await fetchTagIds();
        setTags(['All', ...fetchedTags]); // Add 'All' option to the list
      } catch (error) {
        console.error('Error fetching tagIds:', error);
      }
    };

    loadTagIds();
  }, []);

  return (
    <div className="selector">
      <label htmlFor="tagSelector">Select Tag ID:</label>
      <select
        id="tagSelector"
        value={selectedTag}
        onChange={(e) => setSelectedTag(e.target.value)}
      >
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TagSelector;
