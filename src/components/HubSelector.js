// components/HubSelector.js
import React, { useState, useEffect } from 'react';
import { fetchHubIds } from '../utils/dataFetcher';

function HubSelector({ selectedHub, setSelectedHub }) {
  const [hubIds, setHubIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHubIds = async () => {
      try {
        const ids = await fetchHubIds();
        setHubIds(['All', ...ids]);
        setLoading(false);
      } catch (err) {
        setError('Failed to load Hub IDs');
        setLoading(false);
      }
    };
    loadHubIds();
  }, []);

  if (loading) return <div>Loading Hub IDs...</div>;
  if (error) return <div>{error}</div>;

  return (
    <select value={selectedHub} onChange={(e) => setSelectedHub(e.target.value)}>
      {hubIds.map((id) => (
        <option key={id} value={id}>{id}</option>
      ))}
    </select>
  );
}

export default HubSelector;