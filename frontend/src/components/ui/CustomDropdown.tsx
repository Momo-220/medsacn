'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = 'Sélectionner',
  className = '',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-2 border-gray-200 dark:border-gray-600 text-left flex items-center justify-between group transition-colors"
      >
        <div className="flex items-center gap-3">
          {selectedOption?.icon && (
            <span className="text-primary dark:text-blue-400">{selectedOption.icon}</span>
          )}
          <span className="font-medium text-text-primary dark:text-gray-100">
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-text-secondary dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="py-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3.5 flex items-center justify-between text-left transition-colors ${
                  value === option.value
                    ? 'bg-gradient-to-r from-primary/10 to-primary/5 dark:from-blue-900/30 dark:to-blue-800/20 text-primary dark:text-blue-400 font-semibold'
                    : 'text-text-primary dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {option.icon && (
                    <span className="text-primary dark:text-blue-400">{option.icon}</span>
                  )}
                  <span>{option.label}</span>
                </div>
                {value === option.value && (
                  <Check className="w-5 h-5 text-primary dark:text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
