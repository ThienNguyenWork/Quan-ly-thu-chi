import React, { useState, useEffect, useCallback } from 'react';
import { 
  CalendarDays, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Receipt,
  TrendingDown,
  Layers,
  ChevronRight
} from 'lucide-react';
import { financeService } from '../services/financeService';
import { useAuth } from '../context/AuthContext';
import { MonthSummaryStats, CategorySpending, Transaction, DailyExpenseGroup } from '../types/finance';
import { formatVND, formatDateVI } from '../utils/formatters';
import { MONTH_NAMES_VI } from '../constants/categories';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { CategorySummaryChart } from '../components/dashboard/CategorySummaryChart';

interface MonthlyViewPageProps {
  initialMonth: number;
  initialYear: number;
  refreshTrigger: number;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onEditExpense: (tx: Transaction) => void;
}

export const MonthlyViewPage: React.FC<MonthlyViewPageProps> = ({
  initialMonth,
  initialYear,
  refreshTrigger,
  onOpenAddExpense,
  onOpenAddIncome,
  onEditExpense,
}) => {
  const { user } = useAuth();
  const [month, setMonth] = useState<number>(initialMonth);
  const [year, setYear] = useState<number>(initialYear);
  const [stats, setStats] = useState<MonthSummaryStats>({
    month: initialMonth,
    year: initialYear,
    totalIncome: 0,
    totalExpense: 0,
    remainingBalance: 0,
    transactionCount: 0,
    expenseCount: 0,
    incomeCount: 0,
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategorySpending[]>([]);
  const [dailyGroups, setDailyGroups] = useState<DailyExpenseGroup[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadMonthData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [s, cat, daily, txs] = await Promise.all([
        financeService.getMonthStats(user.id, month, year),
        financeService.getCategorySpending(user.id, month, year),
        financeService.getDailyExpenses(user.id, month, year),
        financeService.getAllTransactions(user.id, { month, year }),
      ]);

      setStats(s);
      setCategoryBreakdown(cat);
      setDailyGroups(daily);
      setRecentTransactions(txs.slice(0, 8));
    } catch (err) {
      console.error('Error in MonthlyViewPage:', err);
    } finally {
      setLoading(false);
    }
  }, [user, month, year]);

  useEffect(() => {
    loadMonthData();
  }, [loadMonthData, refreshTrigger]);

  const topCategories = categoryBreakdown.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Month & Year Filter Bar */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            Chi tiêu theo tháng: Tháng {month}/{year}
          </h2>
          <p className="text-xs text-neutral-500">
            Xem phân tích chi tiết dòng tiền, các danh mục chi tiêu lớn nhất và biểu đồ ngày
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Year select */}
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 text-xs bg-neutral-100 font-semibold text-neutral-800 border border-neutral-200 rounded-lg cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>

          {/* Month select */}
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 text-xs bg-neutral-100 font-semibold text-neutral-800 border border-neutral-200 rounded-lg cursor-pointer"
          >
            {MONTH_NAMES_VI.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Tổng thu nhập</span>
            <ArrowUpRight size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {formatVND(stats.totalIncome)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            {stats.incomeCount} nguồn thu trong tháng
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Tổng chi tiêu</span>
            <ArrowDownRight size={16} className="text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {formatVND(stats.totalExpense)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            {stats.expenseCount} khoản chi trong tháng
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Số dư còn lại</span>
            <Wallet size={16} className="text-sky-600" />
          </div>
          <div className={`text-2xl font-bold tabular-nums ${stats.remainingBalance < 0 ? 'text-amber-600' : 'text-neutral-900'}`}>
            {formatVND(stats.remainingBalance)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            Tỷ lệ tiết kiệm: {stats.totalIncome > 0 ? `${Math.round(((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100)}%` : '0%'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Tổng giao dịch</span>
            <Receipt size={16} className="text-neutral-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {stats.transactionCount}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            Gồm {stats.expenseCount} chi & {stats.incomeCount} thu
          </div>
        </div>
      </div>

      {/* Category Breakdown Donut & Top Spending Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <CategorySummaryChart
            categories={categoryBreakdown}
            totalExpense={stats.totalExpense}
          />
        </div>

        {/* Top Spending Categories List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-900">
              Top danh mục chi tiêu cao nhất
            </h3>
            <span className="text-[11px] text-neutral-400">
              Tháng {month}/{year}
            </span>
          </div>

          {topCategories.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">
              Chưa có dữ liệu chi tiêu trong tháng này
            </div>
          ) : (
            <div className="space-y-3">
              {topCategories.map((item, idx) => (
                <div key={item.category} className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 bg-neutral-50/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-neutral-400 w-4 text-center">
                      #{idx + 1}
                    </span>
                    <CategoryIcon category={item.category} size={16} />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">{item.category}</p>
                      <p className="text-[11px] text-neutral-400">{item.count} khoản chi ({item.percentage}%)</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-neutral-900 tabular-nums">
                    {formatVND(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Spending by Day in Month */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900">
            Chi tiêu theo từng ngày trong tháng {month}/{year}
          </h3>
          <span className="text-xs text-neutral-400">
            {dailyGroups.length} ngày phát sinh chi tiêu
          </span>
        </div>

        {dailyGroups.length === 0 ? (
          <div className="p-10 text-center text-xs text-neutral-400">
            Không có khoản chi tiêu nào trong tháng {month}/{year}.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 max-h-96 overflow-y-auto">
            {dailyGroups.map((group) => (
              <div key={group.date} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div>
                  <p className="text-xs font-bold text-neutral-800">{group.formattedDate}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {group.transactions.map((t) => t.description).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-600 tabular-nums">
                    -{formatVND(group.totalAmount)}
                  </span>
                  <span className="block text-[10px] text-neutral-400">
                    {group.transactions.length} khoản
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
