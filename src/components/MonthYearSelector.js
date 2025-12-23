import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MonthYearSelector = ({ currentMonth, onMonthChange, onYearChange }) => {
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onMonthChange(newDate);
  };

  const handleYearChange = (year) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    onYearChange(newDate);
  };

  return (
    <div className="month-selector">
      <button
        onClick={() => handleMonthChange('prev')}
        className="month-selector-nav-btn"
        title="Tháng trước"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="month-selector-controls">
        <select
          value={currentMonth.getMonth()}
          onChange={(e) => {
            const newDate = new Date(currentMonth);
            newDate.setMonth(parseInt(e.target.value));
            onMonthChange(newDate);
          }}
          className="month-selector-select month-selector-month"
        >
          {months.map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </select>

        <select
          value={currentMonth.getFullYear()}
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
          className="month-selector-select month-selector-year"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => handleMonthChange('next')}
        className="month-selector-nav-btn"
        title="Tháng sau"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MonthYearSelector;
