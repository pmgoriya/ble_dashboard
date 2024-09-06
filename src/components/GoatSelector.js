import React from 'react';

function GoatSelector({ selectedGoat, setSelectedGoat, availableGoats }) {
  return (
    <select value={selectedGoat} onChange={(e) => setSelectedGoat(e.target.value)}>
      <option value="All">All Goats</option>
      {availableGoats.map((id) => (
        <option key={id} value={id}>{id}</option>
      ))}
    </select>
  );
}

export default GoatSelector;