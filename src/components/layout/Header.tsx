import React from 'react';
import { Plus, TrendingUp, Menu, Sparkles } from 'lucide-react';
import { MonthSelector } from '../common/MonthSelector';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  month: number;
  year: number;
  onMonthYearChange: (month: number, year: number) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onOpenMobileMenu: () => void;
}

const TAB_TITLES: Record<NavTab, string> = {
  dashboard: 'Tổng quan tài chính',
  expenses: 'Lịch sử chi tiêu',
  income: 'Quản lý thu nhập',
  monthly: 'Chi tiêu theo tháng',
  yearly: 'Chi tiêu theo năm',
  categories: 'Danh mục chi tiêu',
  settings: 'Cài đặt & Supabase',
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  month,
  year,
  onMonthYearChange,
  onOpenAddExpense,
  onOpenAddIncome,
  onOpenMobileMenu,
}) => {
  return (
    <header className="h-16 bg-white border-b border-neutral-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Zone 1: Mobile menu toggle + Page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight whitespace-nowrap">
          {TAB_TITLES[currentTab]}
        </h1>
      </div>

      {/* Zone 2: Month selector (Center / Adaptive) */}
      <div className="flex items-center">
        <MonthSelector
          month={month}
          year={year}
          onChange={onMonthYearChange}
        />
      </div>

      {/* Zone 3: Primary Action buttons */}
      <div className="hidden sm:flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenAddIncome}
          className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <TrendingUp size={14} />
          <span>+ Thu nhập</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddExpense}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Plus size={15} />
          <span>+ Khoản chi</span>
        </button>
      </div>
    </header>
  );
};
