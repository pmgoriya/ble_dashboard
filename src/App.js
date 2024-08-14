// src/App.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TagSelector from './components/TagSelector';
import DataViewer from './components/DataViewer';
import { fetchData, testDynamoDBConnection } from './utils/dataFetcher';
import './App.css';

function App() {
  const [selectedTag, setSelectedTag] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [data, setData] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);  // New state for total entries
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Checking...');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await testDynamoDBConnection();
        setConnectionStatus('Connected');
      } catch (error) {
        setConnectionStatus('Connection Failed');
        setError(`DynamoDB connection failed: ${error.message}`);
      }
    };
    checkConnection();
  }, []);

  const handleFetchData = async () => {
    if (!selectedTag) {
      setError('Please select a Tag ID');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchData(selectedTag, sortOrder);
      setData(result);
      setTotalEntries(result.length);  // Update total entries
      if (result.length === 0) {
        setError('No data found for the selected Tag ID');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Failed to fetch data: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <Header />
      <main className="container">
        <div className="top-bar">
          <div className="connection-status">
            DynamoDB Status: <span className={connectionStatus === 'Connected' ? 'connected' : 'disconnected'}>{connectionStatus}</span>
          </div>
          <div className="total-entries">
            Total Entries: {totalEntries}
          </div>
        </div>
        <div className="controls">
          <TagSelector selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
          <div className="sort-order-selector">
            <label htmlFor="sortOrder">Sort Order:</label>
            <select id="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <button onClick={handleFetchData} disabled={loading} className="fetch-button">
            {loading ? 'Fetching...' : 'Fetch Data'}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <DataViewer data={data} />
      </main>
    </div>
  );
}

export default App;
