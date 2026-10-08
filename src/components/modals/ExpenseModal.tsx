import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, CreditCard, Tag, Plus } from 'lucide-react';
import { PaymentMethod, Transaction, ParentCategoryGroup, DbPaymentMethod } from '../../types/finance';
import { formatNumberWithDots, parseVNDInput, getTodayString } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { financeService } from '../../services/financeService';
import { useAuth } from '../../context/AuthContext';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    category_id?: string | null;
    category: string;
    subcategory?: string;
    amount: number;
    transaction_date: string;
    payment_method_id?: string | null;
    payment_method: string;
    description: string;
    note?: string;
  }) => Promise<void>;
  initialData?: Transaction | null;
}

const QUICK_AMOUNTS = [
  { label: '30k', value: 30000 },
  { label: '50k', value: 50000 },
  { label: '100k', value: 100000 },
  { label: '200k', value: 200000 },
  { label: '500k', value: 500000 },
  { label: '1tr', value: 1000000 },
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ParentCategoryGroup[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<DbPaymentMethod[]>([]);

  const [rawAmount, setRawAmount] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [selectedParentName, setSelectedParentName] = useState<string>('Ăn uống & vui chơi');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [selectedSubcategoryName, setSelectedSubcategoryName] = useState<string>('Ăn uống');
  const [date, setDate] = useState<string>(getTodayString());
  const [description, setDescription] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [paymentMethodName, setPaymentMethodName] = useState<string>('Tiền mặt');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load categories and payment methods
  useEffect(() => {
    if (!user || !isOpen) return;
    const fetchMeta = async () => {
      try {
        const [cats, pms] = await Promise.all([
          financeService.getCategoryGroups(user.id),
          financeService.getPaymentMethods(user.id),
        ]);
        setCategories(cats);
        setPaymentMethods(pms);

        if (!initialData && cats.length > 0) {
          const firstParent = cats[0];
          setSelectedParentId(firstParent.id || '');
          setSelectedParentName(firstParent.name);
          if (firstParent.subcategories.length > 0) {
            setSelectedSubcategoryId(firstParent.subcategories[0].id);
            setSelectedSubcategoryName(firstParent.subcategories[0].name);
            setDescription(firstParent.subcategories[0].name);
          }
        }
        if (!initialData && pms.length > 0) {
          setPaymentMethodId(pms[0].id);
          setPaymentMethodName(pms[0].name);
        }
      } catch (err) {
        console.error('Error loading meta in ExpenseModal:', err);
      }
    };
    fetchMeta();
  }, [user, isOpen, initialData]);

  // Handle initialData on edit
  useEffect(() => {
    if (initialData) {
      setRawAmount(formatNumberWithDots(initialData.amount));
      setSelectedParentName(initialData.category);
      setSelectedSubcategoryName(initialData.subcategory || '');
      setSelectedSubcategoryId(initialData.category_id || '');
      setDate(initialData.transaction_date);
      setDescription(initialData.description);
      setPaymentMethodName(initialData.payment_method);
      setPaymentMethodId(initialData.payment_method_id || '');
      setNote(initialData.note || '');
    } else {
      setRawAmount('');
      setDate(getTodayString());
      setNote('');
    }
    setError('');
  }, [initialData, isOpen]);

  const activeCategoryGroup = categories.find((c) => c.name === selectedParentName) || categories[0];

  const handleCategoryChange = (parent: ParentCategoryGroup) => {
    setSelectedParentId(parent.id || '');
    setSelectedParentName(parent.name);
    if (parent.subcategories.length > 0) {
      setSelectedSubcategoryId(parent.subcategories[0].id);
      setSelectedSubcategoryName(parent.subcategories[0].name);
      setDescription(parent.subcategories[0].name);
    } else {
      setSelectedSubcategoryId(parent.id || '');
      setSelectedSubcategoryName('');
      setDescription(parent.name);
    }
  };

  const handleSubcategoryChange = (sub: { id: string; name: string }) => {
    setSelectedSubcategoryId(sub.id);
    setSelectedSubcategoryName(sub.name);
    setDescription(sub.name);
  };

  const handleAddQuickAmount = (val: number) => {
    const current = parseVNDInput(rawAmount);
    const next = current + val;
    setRawAmount(formatNumberWithDots(next));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNumber = parseVNDInput(rawAmount);

    if (!amountNumber || amountNumber <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ lớn hơn 0');
      return;
    }

    if (!description.trim()) {
      setError('Vui lòng nhập mô tả khoản chi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave({
        category_id: selectedSubcategoryId || selectedParentId || null,
        category: selectedParentName,
        subcategory: selectedSubcategoryName || selectedParentName,
        amount: amountNumber,
        transaction_date: date,
        payment_method_id: paymentMethodId || null,
        payment_method: paymentMethodName,
        description: description.trim(),
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi lưu chi tiêu vào Supabase';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm">
              ₫
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                {initialData ? 'Chỉnh sửa khoản chi' : 'Thêm khoản chi tiêu'}
              </h2>
              <p className="text-xs text-neutral-500">
                Lưu trữ và đồng bộ hóa trực tiếp lên Supabase
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          {/* 1. Số tiền */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Số tiền (VND) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                inputMode="numeric"
                placeholder="0"
                value={rawAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  const num = parseVNDInput(val);
                  setRawAmount(num ? formatNumberWithDots(num) : '');
                }}
                className="w-full pl-4 pr-12 py-3 text-2xl font-bold text-neutral-900 bg-neutral-50/70 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 tabular-nums transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
                ₫
              </span>
            </div>

            {/* Quick amount chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-neutral-400 mr-1">Cộng nhanh:</span>
              {QUICK_AMOUNTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleAddQuickAmount(item.value)}
                  className="px-2 py-0.5 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md transition-colors cursor-pointer"
                >
                  +{item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Danh mục chính */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Danh mục chi tiêu <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 border border-neutral-100 rounded-xl bg-neutral-50/40">
              {categories.map((cat) => {
                const isSelected = selectedParentName === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg text-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs font-bold'
                        : 'border-transparent bg-white hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <CategoryIcon category={cat.name} size={16} showBg={false} />
                    <span className="mt-1 text-[11px] font-medium leading-tight truncate w-full">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Danh mục con */}
          {activeCategoryGroup && activeCategoryGroup.subcategories.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Danh mục con ({activeCategoryGroup.name})
              </label>
              <div className="flex flex-wrap gap-1.5">
                {activeCategoryGroup.subcategories.map((sub) => {
                  const isSelected = selectedSubcategoryName === sub.name;
                  return (
                    <button
                      key={sub.id || sub.name}
                      type="button"
                      onClick={() => handleSubcategoryChange(sub)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-transparent'
                      }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Mô tả */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Mô tả chi tiêu <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Đổ xăng, Ăn trưa, Cà phê sáng..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* 5. Ngày & Phương thức thanh toán */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Ngày chi tiêu
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 tabular-nums transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Phương thức thanh toán
              </label>
              <select
                value={paymentMethodId || paymentMethodName}
                onChange={(e) => {
                  const pm = paymentMethods.find((p) => p.id === e.target.value || p.name === e.target.value);
                  if (pm) {
                    setPaymentMethodId(pm.id);
                    setPaymentMethodName(pm.name);
                  }
                }}
                className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              >
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 6. Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Ghi chú thêm
            </label>
            <input
              type="text"
              placeholder="VD: Cây xăng Petrolimex, ăn cùng nhóm bạn..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>{initialData ? 'Cập nhật' : 'Lưu khoản chi'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
