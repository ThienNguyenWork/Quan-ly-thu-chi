import React, { useState, useEffect } from 'react';
import { X, Landmark, AlertCircle, Save, Info, CheckCircle2 } from 'lucide-react';
import { SavingsBook } from '../../types/savings';
import { VIETNAMESE_BANKS } from '../../constants/banks';
import { formatVND } from '../../utils/formatters';

interface SavingsBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    bank_code: string;
    bank_name: string;
    initial_deposit?: number;
    start_date: string;
    account_name?: string;
    account_number?: string;
    interest_rate?: number;
    note?: string;
  }) => Promise<void>;
  editingBook?: SavingsBook | null;
}

export const SavingsBookModal: React.FC<SavingsBookModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingBook,
}) => {
  const [bankCode, setBankCode] = useState('VCB');
  const [customBankName, setCustomBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amountInput, setAmountInput] = useState('50000000');
  const [interestRate, setInterestRate] = useState('5.0');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingBook) {
      // Find if bank_code matches a preset
      const preset = VIETNAMESE_BANKS.find(
        (b) => b.code.toUpperCase() === editingBook.bank_code.toUpperCase()
      );

      if (preset && preset.code !== 'OTHER') {
        setBankCode(preset.code);
        setCustomBankName('');
      } else {
        setBankCode('OTHER');
        setCustomBankName(editingBook.bank_name || '');
      }

      setAccountName(editingBook.account_name || '');
      setAccountNumber(editingBook.account_number || '');
      setAmountInput(String(editingBook.initial_deposit || 0));
      setInterestRate(
        editingBook.interest_rate !== undefined && editingBook.interest_rate !== null
          ? String(editingBook.interest_rate)
          : ''
      );
      setStartDate(editingBook.start_date || new Date().toISOString().split('T')[0]);
      setNote(editingBook.note || '');
    } else {
      setBankCode('VCB');
      setCustomBankName('');
      setAccountName('');
      setAccountNumber('');
      setAmountInput('50000000');
      setInterestRate('5.0');
      setStartDate(new Date().toISOString().split('T')[0]);
      setNote('');
    }
    setError(null);
  }, [editingBook, isOpen]);

  if (!isOpen) return null;

  const numericAmount = Math.max(0, parseInt(amountInput.replace(/\D/g, ''), 10) || 0);
  const numericRate = interestRate.trim() ? parseFloat(interestRate) : undefined;

  const isCustomBank = bankCode === 'OTHER';
  const selectedBank = VIETNAMESE_BANKS.find((b) => b.code === bankCode);
  const finalBankName = isCustomBank
    ? customBankName.trim() || 'Ngân hàng khác'
    : selectedBank?.shortName || bankCode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCustomBank && !selectedBank) {
      setError('Vui lòng chọn ngân hàng');
      return;
    }
    if (isCustomBank && !customBankName.trim()) {
      setError('Vui lòng nhập tên ngân hàng');
      return;
    }

    if (!editingBook && numericAmount <= 0) {
      setError('Vui lòng nhập số tiền gửi ban đầu lớn hơn 0');
      return;
    }

    if (!startDate) {
      setError('Vui lòng chọn ngày gửi tiền');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Submit data: When editing, do NOT overwrite current_balance or send initial_deposit
      await onSubmit({
        bank_code: isCustomBank ? 'OTHER' : bankCode,
        bank_name: finalBankName,
        ...(editingBook ? {} : { initial_deposit: numericAmount }),
        start_date: startDate,
        account_name: accountName.trim() || undefined,
        account_number: accountNumber.trim() || undefined,
        interest_rate:
          numericRate !== undefined && !isNaN(numericRate) ? numericRate : undefined,
        note: note.trim() || undefined,
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu sổ tiết kiệm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200/80 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Landmark size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-neutral-900 tracking-tight">
                {editingBook ? 'Chỉnh sửa sổ tiết kiệm' : 'Thêm sổ tiết kiệm mới'}
              </h3>
              <p className="text-xs text-neutral-500">
                {editingBook
                  ? `Cập nhật thông tin sổ "${editingBook.account_name}"`
                  : 'Ghi nhận khoản tiền gửi, lãi suất và lịch sử giao dịch'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Edit Mode Balance Indicator */}
          {editingBook && (
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-neutral-500 block">
                  Số dư hiện tại của sổ
                </span>
                <span className="text-lg font-bold text-emerald-800 tabular-nums">
                  {formatVND(editingBook.current_balance)}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  Số dư được cập nhật qua thao tác Gửi tiền / Rút tiền
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-neutral-500 block">
                  Gốc ban đầu
                </span>
                <span className="text-sm font-semibold text-neutral-700 tabular-nums">
                  {formatVND(editingBook.initial_deposit)}
                </span>
              </div>
            </div>
          )}

          {/* 1. Ngân hàng (Required) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 flex items-center justify-between">
              <span>
                Ngân hàng gửi tiền <span className="text-rose-500">*</span>
              </span>
            </label>
            <select
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:bg-white focus:outline-emerald-600 cursor-pointer"
            >
              {VIETNAMESE_BANKS.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.shortName} - {b.name}
                </option>
              ))}
              <option value="OTHER">-- Ngân hàng khác --</option>
            </select>

            {isCustomBank && (
              <input
                type="text"
                placeholder="Nhập tên ngân hàng của bạn..."
                value={customBankName}
                onChange={(e) => setCustomBankName(e.target.value)}
                className="w-full mt-2 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-emerald-600"
              />
            )}
          </div>

          {/* 2. Số tiền gửi ban đầu (Only editable when creating new) */}
          {!editingBook && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 flex items-center justify-between">
                <span>
                  Số tiền gửi ban đầu (VND) <span className="text-rose-500">*</span>
                </span>
                <span className="text-emerald-700 font-bold tabular-nums">
                  {formatVND(numericAmount)}
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={
                    amountInput
                      ? Number(amountInput.replace(/\D/g, '')).toLocaleString('vi-VN')
                      : ''
                  }
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="50.000.000"
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 focus:bg-white focus:outline-emerald-600 tabular-nums"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-neutral-400">
                  ₫
                </span>
              </div>
            </div>
          )}

          {/* 3. Tên sổ tiết kiệm (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 flex items-center justify-between">
              <span>
                Tên sổ tiết kiệm <span className="text-neutral-400 font-normal">(Tùy chọn)</span>
              </span>
            </label>
            <input
              type="text"
              placeholder={`Ví dụ: Tiết kiệm ${finalBankName}, Quỹ khẩn cấp, Mua xe...`}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:bg-white focus:outline-emerald-600"
            />
          </div>

          {/* 4. Mã số / Số tài khoản & Lãi suất hiện tại (%/năm) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                Mã sổ / Số tài khoản{' '}
                <span className="text-neutral-400 font-normal">(Tùy chọn)</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: STK-00129845"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:bg-white focus:outline-emerald-600 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 flex items-center justify-between">
                <span>
                  Lãi suất hiện tại <span className="text-neutral-400 font-normal">(%/năm)</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="30"
                  placeholder="Ví dụ: 5.2"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-semibold text-neutral-900 focus:bg-white focus:outline-emerald-600 tabular-nums pr-8"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-neutral-400">
                  %
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Cập nhật nhanh khi ngân hàng điều chỉnh lãi suất
              </p>
            </div>
          </div>

          {/* 5. Ngày gửi tiền (Required) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">
              Ngày gửi ban đầu <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:bg-white focus:outline-emerald-600 cursor-pointer"
            />
          </div>

          {/* 6. Ghi chú (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">
              Ghi chú <span className="text-neutral-400 font-normal">(Tùy chọn)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Ghi chú thêm về sổ tiết kiệm này..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:bg-white focus:outline-emerald-600 resize-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-neutral-200 rounded-xl text-xs sm:text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={16} />
              <span>
                {loading
                  ? 'Đang lưu...'
                  : editingBook
                  ? 'Lưu thay đổi'
                  : 'Lưu sổ tiết kiệm'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
