import React, { useState, useEffect } from 'react';
import { X, Check, TrendingUp } from 'lucide-react';
import { INCOME_TYPES } from '../../constants/categories';
import { IncomeType, Transaction } from '../../types/finance';
import { formatNumberWithDots, parseVNDInput, getTodayString } from '../../utils/formatters';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    amount: number;
    transaction_date: string;
    income_type: string;
    description: string;
    note?: string;
  }) => Promise<void>;
  initialData?: Transaction | null;
  defaultMonth?: number;
  defaultYear?: number;
}

const QUICK_INCOME_AMOUNTS = [
  { label: '5tr', value: 5000000 },
  { label: '10tr', value: 10000000 },
  { label: '15tr', value: 15000000 },
  { label: '20tr', value: 20000000 },
  { label: '25tr', value: 25000000 },
];

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultMonth,
  defaultYear,
}) => {
  const [rawAmount, setRawAmount] = useState('');
  const [incomeType, setIncomeType] = useState<IncomeType>(INCOME_TYPES[0]);
  const [date, setDate] = useState<string>(getTodayString());
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setRawAmount(formatNumberWithDots(initialData.amount));
      setIncomeType(initialData.subcategory || INCOME_TYPES[0]);
      setDate(initialData.transaction_date);
      setDescription(initialData.description);
      setNote(initialData.note || '');
    } else {
      setRawAmount('');
      setIncomeType(INCOME_TYPES[0]);
      setDate(getTodayString());
      const m = defaultMonth || new Date().getMonth() + 1;
      const y = defaultYear || new Date().getFullYear();
      setDescription(`Lương tháng ${m}/${y}`);
      setNote('');
    }
    setError('');
  }, [initialData, isOpen, defaultMonth, defaultYear]);

  const handleTypeSelect = (type: IncomeType) => {
    setIncomeType(type);
    const m = defaultMonth || new Date().getMonth() + 1;
    const y = defaultYear || new Date().getFullYear();
    if (type === 'Lương') {
      setDescription(`Lương tháng ${m}/${y}`);
    } else if (type === 'Thưởng') {
      setDescription(`Thưởng KPI / dự án tháng ${m}/${y}`);
    } else if (type === 'Freelance') {
      setDescription(`Thu nhập Freelance`);
    } else {
      setDescription('Khoản thu khác');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNumber = parseVNDInput(rawAmount);

    if (!amountNumber || amountNumber <= 0) {
      setError('Vui lòng nhập số tiền thu nhập hợp lệ lớn hơn 0');
      return;
    }

    if (!description.trim()) {
      setError('Vui lòng nhập mô tả nguồn thu nhập');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave({
        amount: amountNumber,
        transaction_date: date,
        income_type: incomeType,
        description: description.trim(),
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi lưu thu nhập vào Supabase';
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
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                {initialData ? 'Chỉnh sửa khoản thu nhập' : 'Thêm thu nhập / Lương'}
              </h2>
              <p className="text-xs text-neutral-500">
                Lưu trữ và đồng bộ hóa trực tiếp vào bảng incomes Supabase
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
              Số tiền thu nhập (VND) <span className="text-emerald-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                inputMode="numeric"
                placeholder="25.000.000"
                value={rawAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  const num = parseVNDInput(val);
                  setRawAmount(num ? formatNumberWithDots(num) : '');
                }}
                className="w-full pl-4 pr-12 py-3 text-2xl font-bold text-emerald-700 bg-neutral-50/70 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 tabular-nums transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
                ₫
              </span>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-neutral-400 mr-1">Mức phổ biến:</span>
              {QUICK_INCOME_AMOUNTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setRawAmount(formatNumberWithDots(item.value))}
                  className="px-2 py-0.5 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md transition-colors cursor-pointer border border-emerald-200/50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Loại thu nhập */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Loại thu nhập <span className="text-emerald-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INCOME_TYPES.map((type) => {
                const isSelected = incomeType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Mô tả */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Mô tả khoản thu <span className="text-emerald-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Lương tháng 10/2026, Thưởng dự án..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* 4. Ngày nhận */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Ngày nhận thu nhập
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 tabular-nums transition-colors"
            />
          </div>

          {/* 5. Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Ghi chú thêm
            </label>
            <input
              type="text"
              placeholder="VD: Vietcombank, thưởng quý 3..."
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
                  <span>{initialData ? 'Cập nhật' : 'Lưu thu nhập'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
