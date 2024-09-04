// src/components/DateRangePicker.js
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
function DateRangePicker({ onDateRangeChange }) {
const [startDate, setStartDate] = useState(null);
const [endDate, setEndDate] = useState(null);
const handleStartDateChange = (date) => {
setStartDate(date);
if (endDate && date > endDate) {
setEndDate(null);
 }
onDateRangeChange(date, endDate);
 };
const handleEndDateChange = (date) => {
setEndDate(date);
onDateRangeChange(startDate, date);
 };
return (
<div className="date-range-picker">
<DatePicker
selected={startDate}
onChange={handleStartDateChange}
selectsStart
startDate={startDate}
endDate={endDate}
placeholderText="Start Date"
dateFormat="yyyy-MM-dd"
/>
<DatePicker
selected={endDate}
onChange={handleEndDateChange}
selectsEnd
startDate={startDate}
endDate={endDate}
minDate={startDate}
placeholderText="End Date"
dateFormat="yyyy-MM-dd"
/>
</div>
 );
}
export default DateRangePicker;