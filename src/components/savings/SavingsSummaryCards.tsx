import React from 'react';
import { PiggyBank, ArrowDownRight, ArrowUpRight, Coins, BookOpen } from 'lucide-react';
import { SavingsStats } from '../../types/savings';
import { formatVND } from '../../utils/formatters';

interface SavingsSummaryCardsProps {
  stats: SavingsStats;
}

export const SavingsSummaryCards: React.FC<SavingsSummaryCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Card 1: Tổng tiền tiết kiệm */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider truncate">
            Tổng tiền tiết kiệm
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <PiggyBank size={18} />
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <div className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight tabular-nums truncate">
            {formatVND(stats.totalSavings)}
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1.5 truncate">
            <BookOpen size={13} className="text-emerald-600 shrink-0" />
            <span>Tổng số sổ:</span>
          </span>
          <span className="font-semibold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md tabular-nums shrink-0">
            {stats.totalBooksCount} sổ
          </span>
        </div>
      </div>

      {/* Card 2: Tổng tiền đã gửi */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider truncate">
            Tổng tiền đã gửi
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ArrowDownRight size={18} />
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <div className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight tabular-nums truncate">
            {formatVND(stats.totalDeposited)}
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span className="truncate">Gốc ban đầu & gửi thêm</span>
          <span className="font-medium text-blue-600 shrink-0">Tích lũy</span>
        </div>
      </div>

      {/* Card 3: Tổng tiền đã rút */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider truncate">
            Tổng tiền đã rút
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ArrowUpRight size={18} />
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <div className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight tabular-nums truncate">
            {formatVND(stats.totalWithdrawn)}
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span className="truncate">Các lần rút tiền</span>
          <span className="font-medium text-amber-600 shrink-0">Đã rút</span>
        </div>
      </div>

      {/* Card 4: Tổng lãi đã nhận */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between min-w-0">
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider truncate">
            Tổng lãi đã nhận
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Coins size={18} />
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <div className="text-xl sm:text-2xl font-bold text-purple-700 tracking-tight tabular-nums truncate">
            +{formatVND(stats.totalInterestReceived)}
          </div>
        </div>

        <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span className="truncate">Tiền lãi thực nhận</span>
          <span className="font-medium text-purple-600 shrink-0">Sinh lời</span>
        </div>
      </div>
    </div>
  );
};
