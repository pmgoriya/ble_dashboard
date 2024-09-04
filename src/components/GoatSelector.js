// src/components/GoatSelector.js
import React, { useState, useEffect } from 'react';
import { fetchGoatIds } from '../utils/dataFetcher';

function GoatSelector({ selectedGoat, setSelectedGoat }) {
  const [goatIds, setGoatIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGoatIds = async () => {
      try {
        const ids = await fetchGoatIds();
        setGoatIds(['All', ...ids]);
        setLoading(false);
      } catch (error) {
        setError('Failed to load Goat IDs');
        setLoading(false);
      }
    };

    loadGoatIds();
  }, []);

  if (loading) return <div>Loading Goat IDs...</div>;
  if (error) return <div>{error}</div>;

  return (
    <select 
      value={selectedGoat} 
      onChange={(e) => setSelectedGoat(e.target.value)}
      className="goat-selector"
    >
      <option value="">Select a Goat ID</option>
      {goatIds.map((id) => (
        <option key={id} value={id}>
          {id}
        </option>
      ))}
    </select>
  );
}

export default GoatSelector;