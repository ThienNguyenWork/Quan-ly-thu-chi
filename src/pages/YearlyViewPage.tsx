import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Flame, 
  Sparkles,
  TrendingDown
} from 'lucide-react';
import { financeService } from '../services/financeService';
import { useAuth } from '../context/AuthContext';
import { MonthlyChartPoint, Transaction } from '../types/finance';
import { formatVND } from '../utils/formatters';
import { MonthlySpendingChart } from '../components/dashboard/MonthlySpendingChart';
import { MONTH_NAMES_VI } from '../constants/categories';

interface YearlyViewPageProps {
  initialYear: number;
  refreshTrigger: number;
}

export const YearlyViewPage: React.FC<YearlyViewPageProps> = ({
  initialYear,
  refreshTrigger,
}) => {
  const { user } = useAuth();
  const [year, setYear] = useState<number>(initialYear);
  const [chartData, setChartData] = useState<MonthlyChartPoint[]>([]);
  const [yearTransactions, setYearTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadYearData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [points, txs] = await Promise.all([
        financeService.getYearlyChartData(user.id, year),
        financeService.getAllTransactions(user.id, { year }),
      ]);
      setChartData(points);
      setYearTransactions(txs);
    } catch (err) {
      console.error('Error in YearlyViewPage:', err);
    } finally {
      setLoading(false);
    }
  }, [user, year]);

  useEffect(() => {
    loadYearData();
  }, [loadYearData, refreshTrigger]);

  const totalIncome = chartData.reduce((sum, p) => sum + p.income, 0);
  const totalExpense = chartData.reduce((sum, p) => sum + p.expense, 0);
  const totalRemaining = totalIncome - totalExpense;

  // Find highest spending month
  const highestExpensePoint = [...chartData].sort((a, b) => b.expense - a.expense)[0];
  const hasExpenses = highestExpensePoint && highestExpensePoint.expense > 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Year Selector */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            Chi tiêu theo năm {year}
          </h2>
          <p className="text-xs text-neutral-500">
            Tổng kết dòng tiền toàn diện qua 12 tháng, đánh giá thặng dư và tháng chi tiêu đỉnh điểm
          </p>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* 4 Summary Cards for the Year */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Tổng thu nhập cả năm */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Tổng thu nhập cả năm</span>
            <ArrowUpRight size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {formatVND(totalIncome)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            Trung bình: {formatVND(totalIncome / 12)} / tháng
          </div>
        </div>

        {/* 2. Tổng chi tiêu cả năm */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Tổng chi tiêu cả năm</span>
            <ArrowDownRight size={16} className="text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {formatVND(totalExpense)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            Trung bình: {formatVND(totalExpense / 12)} / tháng
          </div>
        </div>

        {/* 3. Tiền tích lũy còn lại */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Tiền tích lũy còn lại</span>
            <Wallet size={16} className="text-sky-600" />
          </div>
          <div className={`text-2xl font-bold tabular-nums ${totalRemaining < 0 ? 'text-amber-600' : 'text-neutral-900'}`}>
            {formatVND(totalRemaining)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            Tỷ lệ tiết kiệm: {totalIncome > 0 ? `${Math.round((totalRemaining / totalIncome) * 100)}%` : '0%'}
          </div>
        </div>

        {/* 4. Tháng chi tiêu cao nhất */}
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Tháng chi tiêu cao nhất</span>
            <Flame size={16} className="text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 tabular-nums">
            {hasExpenses ? highestExpensePoint.label : 'Chưa có'}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-2 tabular-nums">
            {hasExpenses ? formatVND(highestExpensePoint.expense) : '0 ₫'}
          </div>
        </div>
      </div>

      {/* Main Yearly Bar Chart */}
      <MonthlySpendingChart
        chartData={chartData}
        currentYear={year}
        onYearChange={(y) => setYear(y)}
      />

      {/* 12-Month Table Breakdown */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900">
            Chi tiết thu chi 12 tháng năm {year}
          </h3>
          <span className="text-xs text-neutral-400">Đơn vị: VND</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/75 border-b border-neutral-200/80 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Tháng</th>
                <th className="py-3 px-4 text-right">Thu nhập</th>
                <th className="py-3 px-4 text-right">Chi tiêu</th>
                <th className="py-3 px-4 text-right">Dư thừa / Thiếu hụt</th>
                <th className="py-3 px-4 text-center">Tỷ lệ chi tiêu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {chartData.map((pt) => {
                const isHighest = hasExpenses && pt.month === highestExpensePoint.month;
                const spendRate = pt.income > 0 ? Math.round((pt.expense / pt.income) * 100) : 0;
                return (
                  <tr
                    key={pt.month}
                    className={`hover:bg-neutral-50 transition-colors ${
                      isHighest ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-neutral-800 whitespace-nowrap">
                      {pt.label}
                      {isHighest && (
                        <span className="ml-2 text-[10px] text-rose-600 font-semibold uppercase">
                          (Chi cao nhất)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-600 tabular-nums whitespace-nowrap">
                      {formatVND(pt.income)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-rose-600 tabular-nums whitespace-nowrap">
                      {formatVND(pt.expense)}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold tabular-nums whitespace-nowrap ${
                      pt.net >= 0 ? 'text-neutral-900' : 'text-amber-600'
                    }`}>
                      {formatVND(pt.net)}
                    </td>
                    <td className="py-3 px-4 text-center tabular-nums whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                        spendRate > 100
                          ? 'bg-rose-100 text-rose-700'
                          : spendRate > 70
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {pt.income > 0 ? `${spendRate}%` : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
