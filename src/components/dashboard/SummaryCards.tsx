import React from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowDownRight, ArrowUpRight, ReceiptText } from 'lucide-react';
import { MonthSummaryStats } from '../../types/finance';
import { formatVND } from '../../utils/formatters';

interface SummaryCardsProps {
  stats: MonthSummaryStats;
  onAddExpense: () => void;
  onAddIncome: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  stats,
  onAddExpense,
  onAddIncome,
}) => {
  const savingsRate =
    stats.totalIncome > 0
      ? Math.max(0, Math.round(((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100))
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Thu nhập tháng */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Thu nhập tháng
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp size={16} />
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-neutral-900 tracking-tight tabular-nums">
            {formatVND(stats.totalIncome)}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <ArrowUpRight size={14} />
            {stats.incomeCount} khoản thu
          </span>
          <button
            type="button"
            onClick={onAddIncome}
            className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
          >
            + Thu nhập
          </button>
        </div>
      </div>

      {/* 2. Tổng chi tiêu */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Tổng chi tiêu
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown size={16} />
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-neutral-900 tracking-tight tabular-nums">
            {formatVND(stats.totalExpense)}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1 text-rose-600 font-medium">
            <ArrowDownRight size={14} />
            {stats.expenseCount} khoản chi
          </span>
          <button
            type="button"
            onClick={onAddExpense}
            className="text-xs font-medium text-rose-700 hover:text-rose-800 hover:underline cursor-pointer"
          >
            + Khoản chi
          </button>
        </div>
      </div>

      {/* 3. Còn lại */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Còn lại
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            stats.remainingBalance >= 0 ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <Wallet size={16} />
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <div
            className={`text-2xl font-bold tracking-tight tabular-nums ${
              stats.remainingBalance < 0 ? 'text-amber-600' : 'text-neutral-900'
            }`}
          >
            {formatVND(stats.remainingBalance)}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>Tích lũy tháng</span>
          <span className="font-semibold text-neutral-700 tabular-nums">
            {stats.totalIncome > 0 ? `${savingsRate}%` : '0%'}
          </span>
        </div>
      </div>

      {/* 4. Số giao dịch */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Số giao dịch
          </span>
          <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center">
            <ReceiptText size={16} />
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-neutral-900 tracking-tight tabular-nums">
            {stats.transactionCount} <span className="text-base font-normal text-neutral-500">giao dịch</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>Chi: {stats.expenseCount}</span>
          <span aria-hidden="true">·</span>
          <span>Thu: {stats.incomeCount}</span>
        </div>
      </div>
    </div>
  );
};
