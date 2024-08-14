import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function TimeRangeSelector({ timeRange, setTimeRange }) {
  const handleTypeChange = (e) => {
    setTimeRange({ ...timeRange, type: e.target.value });
  };

  return (
    <div className="selector">
      <label htmlFor="timeRangeType">Select Time Range:</label>
      <select id="timeRangeType" value={timeRange.type} onChange={handleTypeChange}>
        <option value="Past Hour">Past Hour</option>
        <option value="Past 24 Hours">Past 24 Hours</option>
        <option value="Past 7 Days">Past 7 Days</option>
        <option value="Custom">Custom</option>
      </select>
      {timeRange.type === 'Custom' && (
        <div className="custom-date-range">
          <DatePicker
            selected={timeRange.start}
            onChange={(date) => setTimeRange({ ...timeRange, start: date })}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
            placeholderText="Start Date"
          />
          <DatePicker
            selected={timeRange.end}
            onChange={(date) => setTimeRange({ ...timeRange, end: date })}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
            placeholderText="End Date"
          />
        </div>
      )}
    </div>
  );
}

export default TimeRangeSelector;