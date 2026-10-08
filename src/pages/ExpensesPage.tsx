import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Plus, 
  CreditCard, 
  Receipt 
} from 'lucide-react';
import { Transaction, ParentCategoryGroup, DbPaymentMethod } from '../types/finance';
import { financeService } from '../services/financeService';
import { useAuth } from '../context/AuthContext';
import { formatVND, formatDateVI } from '../utils/formatters';
import { MONTH_NAMES_VI } from '../constants/categories';
import { CategoryIcon } from '../components/common/CategoryIcon';

interface ExpensesPageProps {
  onOpenAddExpense: () => void;
  onEditExpense: (tx: Transaction) => void;
  refreshTrigger: number;
  onRefreshNeeded: () => void;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({
  onOpenAddExpense,
  onEditExpense,
  refreshTrigger,
  onRefreshNeeded,
}) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<ParentCategoryGroup[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<DbPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');

  // Load filter options
  useEffect(() => {
    if (!user) return;
    const fetchOptions = async () => {
      try {
        const [cats, pms] = await Promise.all([
          financeService.getCategoryGroups(user.id),
          financeService.getPaymentMethods(user.id),
        ]);
        setCategories(cats);
        setPaymentMethods(pms);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchOptions();
  }, [user]);

  const loadExpenses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await financeService.getExpenses(user.id, {
        year: selectedYear,
        month: selectedMonth === 'all' ? undefined : parseInt(selectedMonth, 10),
        category: selectedCategory,
        paymentMethod: selectedPaymentMethod,
        search,
      });
      setTransactions(data);
    } catch (err) {
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedYear, selectedMonth, selectedCategory, selectedPaymentMethod, search]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa khoản chi này khỏi Supabase?')) {
      try {
        await financeService.deleteExpense(user.id, id);
        onRefreshNeeded();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Xóa thất bại';
        alert(msg);
      }
    }
  };

  const totalFilteredExpense = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            Lịch sử chi tiêu (Supabase)
          </h2>
          <p className="text-xs text-neutral-500">
            Xem toàn bộ chi tiêu từ cơ sở dữ liệu, lọc theo năm/tháng, danh mục và phương thức thanh toán
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-rose-50 border border-rose-200/60 px-3.5 py-1.5 rounded-xl text-right">
            <span className="text-[11px] text-rose-600 font-medium block">Tổng theo bộ lọc:</span>
            <span className="text-sm font-bold text-rose-700 tabular-nums">
              {formatVND(totalFilteredExpense)}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAddExpense}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>+ Thêm chi tiêu</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100 text-xs font-semibold text-neutral-600">
          <Filter size={14} className="text-emerald-600" />
          <span>Bộ lọc & Tìm kiếm</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* 1. Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Tìm theo mô tả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* 2. Năm */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="w-full px-2.5 py-1.5 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Tháng */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Tất cả các tháng</option>
              {MONTH_NAMES_VI.map((name, idx) => (
                <option key={name} value={String(idx + 1)}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Danh mục */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Phương thức thanh toán */}
          <div>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-neutral-50/70 border border-neutral-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Tất cả phương thức</option>
              {paymentMethods.map((pm) => (
                <option key={pm.id} value={pm.name}>
                  {pm.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            Đang tải dữ liệu chi tiêu từ Supabase...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <Receipt size={20} />
            </div>
            <h3 className="text-sm font-semibold text-neutral-800">
              Không tìm thấy khoản chi tiêu nào
            </h3>
            <p className="text-xs text-neutral-500">
              Hãy thử thay đổi điều kiện bộ lọc hoặc thêm một khoản chi mới.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50/75 border-b border-neutral-200/80 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Ngày</th>
                  <th className="py-3 px-4">Mô tả</th>
                  <th className="py-3 px-4">Danh mục</th>
                  <th className="py-3 px-4">Danh mục con</th>
                  <th className="py-3 px-4">Phương thức</th>
                  <th className="py-3 px-4 text-right">Số tiền</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-600 font-medium tabular-nums">
                      {formatDateVI(tx.transaction_date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">{tx.description}</div>
                      {tx.note && (
                        <div className="text-[11px] text-neutral-400 italic truncate max-w-xs">{tx.note}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <CategoryIcon category={tx.category} size={14} className="p-1" />
                        <span className="font-medium text-neutral-800">{tx.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-600">
                      {tx.subcategory || '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-600">
                      <span className="flex items-center gap-1">
                        <CreditCard size={12} className="text-neutral-400" />
                        {tx.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="font-bold text-rose-600 tabular-nums">
                        -{formatVND(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditExpense(tx)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tx.id)}
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
        )}
      </div>
    </div>
  );
};
