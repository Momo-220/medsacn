'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CustomTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CustomTimePicker({
  value,
  onChange,
  className = '',
}: CustomTimePickerProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState('08');
  const [minutes, setMinutes] = useState('00');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHours(h || '08');
      setMinutes(m || '00');
    }
  }, [value]);

  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, '0')
  );
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, '0')
  );

  const handleTimeChange = (newHours: string, newMinutes: string) => {
    setHours(newHours);
    setMinutes(newMinutes);
    onChange(`${newHours}:${newMinutes}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
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

  const formatDisplayTime = (h: string, m: string) => {
    const hour = parseInt(h);
    const min = parseInt(m);
    return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={pickerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-2 border-gray-200 dark:border-gray-600 text-left flex items-center justify-between group transition-colors"
      >
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary dark:text-blue-400" />
          <span className="font-semibold text-text-primary dark:text-gray-100 text-lg">
            {formatDisplayTime(hours, minutes)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-text-secondary dark:text-gray-400 font-medium">{t('edit')}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="p-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex flex-col items-center flex-1">
                <label className="text-xs font-semibold text-text-secondary dark:text-gray-400 mb-2 uppercase tracking-wide">
                  {t('hours') || 'Heures'}
                </label>
                <div className="relative w-full">
                  <select
                    value={hours}
                    onChange={(e) => handleTimeChange(e.target.value, minutes)}
                    className="w-full appearance-none bg-gradient-to-br from-primary/10 to-primary/5 dark:from-blue-900/30 dark:to-blue-800/20 border-2 border-primary/30 dark:border-blue-700/50 rounded-2xl px-4 py-4 text-center text-3xl font-bold text-primary dark:text-blue-400 focus:outline-none focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 cursor-pointer transition-all"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%234A90E2' d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      paddingRight: '3rem',
                    }}
                  >
                    {hourOptions.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center pt-10">
                <span className="text-4xl font-bold text-primary dark:text-blue-400">:</span>
              </div>

              <div className="flex flex-col items-center flex-1">
                <label className="text-xs font-semibold text-text-secondary dark:text-gray-400 mb-2 uppercase tracking-wide">
                  {t('minutes') || 'Minutes'}
                </label>
                <div className="relative w-full">
                  <select
                    value={minutes}
                    onChange={(e) => handleTimeChange(hours, e.target.value)}
                    className="w-full appearance-none bg-gradient-to-br from-primary/10 to-primary/5 dark:from-blue-900/30 dark:to-blue-800/20 border-2 border-primary/30 dark:border-blue-700/50 rounded-2xl px-4 py-4 text-center text-3xl font-bold text-primary dark:text-blue-400 focus:outline-none focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 cursor-pointer transition-all"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%234A90E2' d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      paddingRight: '3rem',
                    }}
                  >
                    {minuteOptions.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
              <p className="text-xs font-semibold text-text-secondary dark:text-gray-400 mb-3 text-center uppercase tracking-wide">
                {t('quickHours') || 'Heures rapides'}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {['08:00', '12:00', '18:00', '20:00'].map((time) => {
                  const [h, m] = time.split(':');
                  const isSelected = hours === h && minutes === m;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        handleTimeChange(h, m);
                        setIsOpen(false);
                      }}
                      className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-primary to-primary/80 dark:from-blue-500 dark:to-blue-600 text-white shadow-lg'
                          : 'bg-gray-50 dark:bg-gray-700 text-text-primary dark:text-gray-100 hover:bg-primary/10 dark:hover:bg-blue-900/30 hover:text-primary dark:hover:text-blue-400'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
