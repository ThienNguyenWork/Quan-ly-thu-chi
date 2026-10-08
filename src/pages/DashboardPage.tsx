import React, { useEffect, useState, useCallback } from 'react';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { DailyExpenses } from '../components/dashboard/DailyExpenses';
import { MonthlySpendingChart } from '../components/dashboard/MonthlySpendingChart';
import { CategorySummaryChart } from '../components/dashboard/CategorySummaryChart';
import { MonthSummaryStats, DailyExpenseGroup, MonthlyChartPoint, CategorySpending, Transaction } from '../types/finance';
import { financeService } from '../services/financeService';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

interface DashboardPageProps {
  month: number;
  year: number;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
  onEditExpense: (tx: Transaction) => void;
  refreshTrigger: number;
  onRefreshNeeded: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  month,
  year,
  onOpenAddExpense,
  onOpenAddIncome,
  onEditExpense,
  refreshTrigger,
  onRefreshNeeded,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<MonthSummaryStats>({
    month,
    year,
    totalIncome: 0,
    totalExpense: 0,
    remainingBalance: 0,
    transactionCount: 0,
    expenseCount: 0,
    incomeCount: 0,
  });
  const [dailyGroups, setDailyGroups] = useState<DailyExpenseGroup[]>([]);
  const [yearlyChart, setYearlyChart] = useState<MonthlyChartPoint[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategorySpending[]>([]);
  const [chartYear, setChartYear] = useState<number>(year);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [statsData, dailyData, chartData, catData] = await Promise.all([
        financeService.getMonthStats(user.id, month, year),
        financeService.getDailyExpenses(user.id, month, year),
        financeService.getYearlyChartData(user.id, chartYear),
        financeService.getCategorySpending(user.id, month, year),
      ]);

      setStats(statsData);
      setDailyGroups(dailyData);
      setYearlyChart(chartData);
      setCategoryBreakdown(catData);
    } catch (err) {
      console.error('Failed to load dashboard data from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [user, month, year, chartYear]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  const handleDeleteExpense = async (txId: string) => {
    if (!user) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa khoản chi này khỏi Supabase?')) {
      try {
        await financeService.deleteExpense(user.id, txId);
        onRefreshNeeded();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Xóa thất bại';
        alert(msg);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-900 to-neutral-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-1">
            <Sparkles size={14} />
            <span>Dữ liệu thực từ Supabase PostgreSQL</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Xin chào, {user?.full_name || 'Bạn'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1">
            Báo cáo tài chính Tháng {month}/{year}. Theo dõi thu nhập và tối ưu chi tiêu hàng ngày.
          </p>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <SummaryCards
        stats={stats}
        onAddExpense={onOpenAddExpense}
        onAddIncome={onOpenAddIncome}
      />

      {/* Middle Row: Monthly Spending Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <MonthlySpendingChart
            chartData={yearlyChart}
            currentYear={chartYear}
            onYearChange={(y) => setChartYear(y)}
          />
        </div>

        <div className="lg:col-span-5">
          <CategorySummaryChart
            categories={categoryBreakdown}
            totalExpense={stats.totalExpense}
          />
        </div>
      </div>

      {/* Daily Expenses Grouped List */}
      <DailyExpenses
        groups={dailyGroups}
        onAddExpense={onOpenAddExpense}
        onEditExpense={onEditExpense}
        onDeleteExpense={handleDeleteExpense}
      />
    </div>
  );
};
