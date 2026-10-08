import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react';
import { formatMonthYearVI, getCurrentMonthYear } from '../../utils/formatters';
import { MONTH_NAMES_VI } from '../../constants/categories';

interface MonthSelectorProps {
  month: number; // 1-12
  year: number;
  onChange: (month: number, year: number) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ month, year, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const current = getCurrentMonthYear();
  const isCurrentMonth = month === current.month && year === current.year;

  const handlePrev = () => {
    if (month === 1) {
      onChange(12, year - 1);
    } else {
      onChange(month - 1, year);
    }
  };

  const handleNext = () => {
    if (month === 12) {
      onChange(1, year + 1);
    } else {
      onChange(month + 1, year);
    }
  };

  const handleResetToCurrent = () => {
    onChange(current.month, current.year);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center bg-white border border-neutral-200/80 rounded-xl shadow-xs p-1">
        <button
          type="button"
          onClick={handlePrev}
          title="Tháng trước"
          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1 text-sm font-semibold text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer tabular-nums whitespace-nowrap"
        >
          <Calendar size={15} className="text-emerald-600 shrink-0" />
          <span>{formatMonthYearVI(month, year)}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          title="Tháng sau"
          className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {!isCurrentMonth && (
        <button
          type="button"
          onClick={handleResetToCurrent}
          title="Về tháng hiện tại"
          className="ml-2 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer border border-emerald-200/60"
        >
          <RotateCcw size={13} />
          <span className="hidden sm:inline">Hiện tại</span>
        </button>
      )}

      {/* Popover selector */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 z-50 w-72 p-3 bg-white border border-neutral-200 rounded-xl shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Chọn năm: {year}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onChange(month, year - 1)}
                  className="px-2 py-0.5 text-xs text-neutral-700 hover:bg-neutral-100 rounded cursor-pointer"
                >
                  -1 Năm
                </button>
                <button
                  type="button"
                  onClick={() => onChange(month, year + 1)}
                  className="px-2 py-0.5 text-xs text-neutral-700 hover:bg-neutral-100 rounded cursor-pointer"
                >
                  +1 Năm
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {MONTH_NAMES_VI.map((name, idx) => {
                const mNum = idx + 1;
                const isSelected = mNum === month;
                const isThisCurrent = mNum === current.month && year === current.year;

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      onChange(mNum, year);
                      setIsOpen(false);
                    }}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-center ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-semibold'
                        : isThisCurrent
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
