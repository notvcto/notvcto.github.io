import React, { useState } from 'react';

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  // Empty slots for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
  }

  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday =
      d === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    days.push(
      <div
        key={d}
        className={`w-8 h-8 flex items-center justify-center text-sm rounded-full cursor-default
          ${isToday ? 'bg-ub-orange text-white' : 'hover:bg-white hover:bg-opacity-10 text-ubt-grey'}
        `}
      >
        {d}
      </div>
    );
  }

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-medium text-white">
          {monthNames[month]} {year}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-10 outline-none focus:bg-white focus:bg-opacity-10"
            aria-label="Previous Month"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-10 outline-none focus:bg-white focus:bg-opacity-10"
            aria-label="Next Month"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, idx) => (
          <div key={idx} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>

      <div className="mt-6 border-t border-gray-700 pt-4">
        <div className="text-sm text-gray-400">
           {/* Placeholder for "Events" or just "Today" as in the image */}
           <div className="mb-2">Today</div>
           <div className="text-xs italic text-gray-500">No Events</div>
        </div>
      </div>

       <div className="mt-4">
        <button className="w-full text-left px-3 py-2 rounded hover:bg-white hover:bg-opacity-10 text-sm text-ubt-grey transition duration-100">
           Add World Clocks...
        </button>
      </div>
    </div>
  );
}
