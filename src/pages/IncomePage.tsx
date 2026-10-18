import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit2, 
  Wallet, 
  Briefcase, 
  CreditCard 
} from 'lucide-react';
import { Transaction } from '../types/finance';
import { financeService } from '../services/financeService';
import { useAuth } from '../context/AuthContext';
import { formatVND, formatDateVI } from '../utils/formatters';

interface IncomePageProps {
  onOpenAddIncome: () => void;
  onEditIncome: (tx: Transaction) => void;
  refreshTrigger: number;
  onRefreshNeeded: () => void;
  selectedMonth: number;
  selectedYear: number;
}

export const IncomePage: React.FC<IncomePageProps> = ({
  onOpenAddIncome,
  onEditIncome,
  refreshTrigger,
  onRefreshNeeded,
  selectedMonth,
  selectedYear,
}) => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewYear, setViewYear] = useState<number>(selectedYear);

  const loadIncome = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await financeService.getIncomes(user.id, {
        year: viewYear,
      });
      setIncomes(data);
    } catch (err) {
      console.error('Error loading incomes:', err);
    } finally {
      setLoading(false);
    }
  }, [user, viewYear]);

  useEffect(() => {
    loadIncome();
  }, [loadIncome, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm('Bạn có chắc muốn xóa khoản thu nhập này khỏi Supabase?')) {
      try {
        await financeService.deleteIncome(user.id, id);
        onRefreshNeeded();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Xóa thất bại';
        alert(msg);
      }
    }
  };

  const typeSummary = incomes.reduce((acc, cur) => {
    const type = cur.subcategory || 'Khác';
    acc[type] = (acc[type] || 0) + Number(cur.amount);
    return acc;
  }, {} as Record<string, number>);

  const totalYearIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const currentMonthIncomes = incomes.filter((i) => {
    const parts = i.transaction_date.split('-');
    return parseInt(parts[1], 10) === selectedMonth && parseInt(parts[0], 10) === viewYear;
  });
  const totalCurrentMonthIncome = currentMonthIncomes.reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            Quản lý thu nhập & Tiền lương (Supabase)
          </h2>
          <p className="text-xs text-neutral-500">
            Dữ liệu thu nhập được lưu trữ an toàn trong bảng incomes trên PostgreSQL
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Year selector */}
          <select
            value={viewYear}
            onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 text-xs bg-neutral-100 font-semibold text-neutral-800 border border-neutral-200 rounded-lg cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onOpenAddIncome}
            className="px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus size={15} />
            <span>+ Thêm thu nhập</span>
          </button>
        </div>
      </div>

      {/* Income Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Thu nhập tháng {selectedMonth}/{viewYear}</span>
            <Wallet size={16} className="text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-neutral-900 tabular-nums truncate">
            {formatVND(totalCurrentMonthIncome)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            {currentMonthIncomes.length} nguồn thu trong tháng này
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Tổng thu cả năm {viewYear}</span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 tabular-nums truncate">
            {formatVND(totalYearIncome)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            Toàn bộ {incomes.length} khoản thu trong năm
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span className="font-semibold uppercase tracking-wider">Thu nhập chính (Lương)</span>
            <Briefcase size={16} className="text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-neutral-900 tabular-nums truncate">
            {formatVND(typeSummary['Lương'] || 0)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2 truncate">
            Thưởng & Freelance: {formatVND((typeSummary['Thưởng'] || 0) + (typeSummary['Freelance'] || 0))}
          </div>
        </div>
      </div>

      {/* List of Income Records */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900">
            Danh sách các khoản thu nhập năm {viewYear}
          </h3>
          <span className="text-xs text-neutral-400">
            {incomes.length} bản ghi
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs text-neutral-400">Đang tải dữ liệu từ Supabase...</div>
        ) : incomes.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <TrendingUp size={20} />
            </div>
            <h4 className="text-sm font-semibold text-neutral-800">Chưa có khoản thu nhập nào</h4>
            <p className="text-xs text-neutral-500">
              Hãy thêm lương hoặc thưởng tháng này để theo dõi ngân sách.
            </p>
            <button
              type="button"
              onClick={onOpenAddIncome}
              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 cursor-pointer"
            >
              + Thêm thu nhập
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Card View (md:hidden) */}
            <div className="md:hidden divide-y divide-neutral-100">
              {incomes.map((inc) => (
                <div key={inc.id} className="p-4 space-y-2 hover:bg-neutral-50/80 transition-colors">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-medium tabular-nums">{formatDateVI(inc.transaction_date)}</span>
                    <span className="text-sm font-bold text-emerald-600 tabular-nums">
                      +{formatVND(inc.amount)}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-neutral-900 break-words">{inc.description}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50">
                        {inc.subcategory || 'Thu nhập'}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard size={11} className="text-neutral-400 shrink-0" />
                        <span>{inc.payment_method}</span>
                      </span>
                    </div>
                    {inc.note && (
                      <p className="text-[11px] text-neutral-400 italic break-words mt-1">{inc.note}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100/60">
                    <button
                      type="button"
                      onClick={() => onEditIncome(inc)}
                      className="px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 size={12} />
                      <span>Sửa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(inc.id)}
                      className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto w-full max-w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50/75 border-b border-neutral-200/80 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Ngày nhận</th>
                    <th className="py-3 px-4">Mô tả</th>
                    <th className="py-3 px-4">Loại thu nhập</th>
                    <th className="py-3 px-4">Nhận qua</th>
                    <th className="py-3 px-4 text-right">Số tiền</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {incomes.map((inc) => (
                    <tr key={inc.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-neutral-600 font-medium tabular-nums">
                        {formatDateVI(inc.transaction_date)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">{inc.description}</div>
                        {inc.note && (
                          <div className="text-[11px] text-neutral-400 italic truncate max-w-xs">{inc.note}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50">
                          {inc.subcategory || 'Thu nhập'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-neutral-600">
                        <span className="flex items-center gap-1">
                          <CreditCard size={12} className="text-neutral-400" />
                          {inc.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="font-bold text-emerald-600 tabular-nums">
                          +{formatVND(inc.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditIncome(inc)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(inc.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
