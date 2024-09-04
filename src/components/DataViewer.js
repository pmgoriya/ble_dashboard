// src/components/DataViewer.js
import React, { useState } from 'react';

function DataViewer({ data }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (data.length === 0) {
    return <p>No data available.</p>;
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Tag ID</th>
            <th>Device Name</th>
            <th>Hub ID</th>
            <th>Temperature</th>
            <th>Ambient Temperature</th>
            <th>Ambient Humidity</th>
            <th>Battery</th>
            <th>Proximity</th>
            <th>RSSI</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={index}>
              <td>{item.timestamp}</td>
              <td>{item.tagId}</td>
              <td>{item.deviceName}</td>
              <td>{item.hubId}</td>
              <td>{item.temperature}</td>
              <td>{item.ambientTemperature}</td>
              <td>{item.ambientHumidity}</td>
              <td>{item.battery}</td>
              <td>{item.proximity}</td>
              <td>{item.rssi}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            disabled={currentPage === pageNumber}
          >
            {pageNumber}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DataViewer;