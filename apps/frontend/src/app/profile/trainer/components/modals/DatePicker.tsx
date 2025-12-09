"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function DatePicker({
  value,
  onChange,
  placeholder = "--------, ----",
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    const monthName = MONTHS[monthIndex];
    const formattedDate = `${monthName} ${selectedYear}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setSelectedMonth(null);
    setIsOpen(false);
  };

  const handleThisMonth = () => {
    const now = new Date();
    const monthIndex = now.getMonth();
    const year = now.getFullYear();
    setSelectedYear(year);
    setSelectedMonth(monthIndex);
    const monthName = MONTHS[monthIndex];
    const formattedDate = `${monthName} ${year}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleYearChange = (delta: number) => {
    setSelectedYear((prev) => prev + delta);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          readOnly
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
        />
        <Calendar
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            disabled
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-400 cursor-pointer"
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 w-64">
          {/* Year Selection */}
          <div className="bg-gray-100 px-4 py-2 flex items-center justify-between rounded-t-lg">
            <button
              onClick={() => handleYearChange(-1)}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              ‹
            </button>
            <span className="text-sm font-medium text-gray-700">
              {selectedYear}
            </span>
            <button
              onClick={() => handleYearChange(1)}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              ›
            </button>
          </div>

          {/* Month Grid */}
          <div className="p-3">
            <div className="grid grid-cols-4 gap-2">
              {MONTHS.map((month, index) => (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(index)}
                  className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                    selectedMonth === index
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between">
            <button
              onClick={handleClear}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear
            </button>
            <button
              onClick={handleThisMonth}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              This month
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
