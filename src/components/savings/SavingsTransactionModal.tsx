import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Coins, AlertCircle, Save } from 'lucide-react';
import { SavingsBook } from '../../types/savings';
import { formatVND } from '../../utils/formatters';

export type SavingsActionType = 'deposit' | 'withdraw' | 'interest';

interface SavingsTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: SavingsBook | null;
  mode: SavingsActionType;
  onSubmit: (data: {
    book_id: string;
    type: SavingsActionType;
    amount: number;
    transaction_date: string;
    note?: string;
    added_to_balance?: boolean;
  }) => Promise<void>;
}

export const SavingsTransactionModal: React.FC<SavingsTransactionModalProps> = ({
  isOpen,
  onClose,
  book,
  mode,
  onSubmit,
}) => {
  const [amountInput, setAmountInput] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [addedToBalance, setAddedToBalance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (book) {
      if (mode === 'deposit') {
        setAmountInput('10000000');
        setNote('Gửi thêm tiền vào sổ');
      } else if (mode === 'withdraw') {
        setAmountInput(String(Math.min(book.current_balance, 10000000)));
        setNote('Rút tiền tiết kiệm');
      } else if (mode === 'interest') {
        // Simple suggestion for interest if rate exists
        if (book.interest_rate) {
          const suggestedMonthly = Math.round((book.current_balance * (book.interest_rate / 100)) / 12);
          setAmountInput(String(suggestedMonthly > 0 ? suggestedMonthly : 500000));
        } else {
          setAmountInput('500000');
        }
        setNote('Nhận lãi tiền gửi');
        setAddedToBalance(false); // Default: usually bank pays interest into checking account unless compounded
      }
      setDate(new Date().toISOString().split('T')[0]);
    }
    setError(null);
  }, [book, mode, isOpen]);

  if (!isOpen || !book) return null;

  const numericAmount = Math.max(0, parseInt(amountInput.replace(/\D/g, ''), 10) || 0);

  // Projected new balance
  let projectedBalance = book.current_balance;
  if (mode === 'deposit') {
    projectedBalance += numericAmount;
  } else if (mode === 'withdraw') {
    projectedBalance = Math.max(0, book.current_balance - numericAmount);
  } else if (mode === 'interest') {
    if (addedToBalance) {
      projectedBalance += numericAmount;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (numericAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ lớn hơn 0');
      return;
    }

    if (mode === 'withdraw' && numericAmount > book.current_balance) {
      setError(`Số tiền rút (${formatVND(numericAmount)}) vượt quá số dư hiện tại (${formatVND(book.current_balance)})`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        book_id: book.id,
        type: mode,
        amount: numericAmount,
        transaction_date: date,
        note: note.trim() || undefined,
        added_to_balance: mode === 'interest' ? addedToBalance : undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi thực hiện giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const config = {
    deposit: {
      title: 'Gửi thêm tiền vào sổ',
      icon: ArrowDownRight,
      color: 'bg-emerald-100 text-emerald-700',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700',
      labelAmount: 'Số tiền gửi thêm (VND)',
      dateLabel: 'Ngày gửi tiền',
    },
    withdraw: {
      title: 'Rút tiền từ sổ tiết kiệm',
      icon: ArrowUpRight,
      color: 'bg-amber-100 text-amber-700',
      btnColor: 'bg-amber-600 hover:bg-amber-700',
      labelAmount: 'Số tiền muốn rút (VND)',
      dateLabel: 'Ngày rút tiền',
    },
    interest: {
      title: 'Ghi nhận tiền lãi thực nhận',
      icon: Coins,
      color: 'bg-purple-100 text-purple-700',
      btnColor: 'bg-purple-600 hover:bg-purple-700',
      labelAmount: 'Số tiền lãi thực tế đã nhận (VND)',
      dateLabel: 'Ngày nhận lãi',
    },
  }[mode];

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200/80 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center shrink-0`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-neutral-900 tracking-tight truncate">
                {config.title}
              </h3>
              <p className="text-xs text-neutral-500 truncate">
                {book.account_name} &bull; {book.bank_name}
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

        {/* Current Balance Banner */}
        <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between text-xs">
          <span className="text-neutral-500">Số dư hiện tại của sổ:</span>
          <span className="font-bold text-neutral-900 tabular-nums">
            {formatVND(book.current_balance)}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 flex items-center justify-between">
              <span>{config.labelAmount} <span className="text-rose-500">*</span></span>
              <span className="font-bold text-neutral-900 tabular-nums">
                {formatVND(numericAmount)}
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                value={amountInput ? Number(amountInput.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="10.000.000"
                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-base font-bold text-neutral-900 focus:bg-white focus:outline-emerald-600 tabular-nums"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-neutral-400">₫</span>
            </div>

            {/* Quick shortcuts for withdraw */}
            {mode === 'withdraw' && book.current_balance > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setAmountInput(String(Math.round(book.current_balance / 2)))}
                  className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-[11px] font-medium cursor-pointer"
                >
                  Rút 50%
                </button>
                <button
                  type="button"
                  onClick={() => setAmountInput(String(book.current_balance))}
                  className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-[11px] font-medium cursor-pointer"
                >
                  Rút toàn bộ
                </button>
              </div>
            )}
          </div>

          {/* Interest Option: Compound vs Payout */}
          {mode === 'interest' && (
            <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addedToBalance}
                  onChange={(e) => setAddedToBalance(e.target.checked)}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-semibold text-purple-900 block">
                    Cộng tiền lãi này vào số dư sổ tiết kiệm
                  </span>
                  <span className="text-[11px] text-purple-700 block mt-0.5">
                    {addedToBalance 
                      ? 'Lãi nhập gốc: số dư sổ sẽ tăng thêm theo số tiền lãi này.' 
                      : 'Lãi nhận riêng: chỉ ghi nhận lãi đã nhận, số dư sổ giữ nguyên.'}
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* Transaction Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">
              {config.dateLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:bg-white focus:outline-emerald-600 cursor-pointer"
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700">
              Ghi chú <span className="text-neutral-400 font-normal">(Tùy chọn)</span>
            </label>
            <input
              type="text"
              placeholder={
                mode === 'deposit' 
                  ? 'Ví dụ: Nộp thêm từ tiền thưởng' 
                  : mode === 'withdraw' 
                  ? 'Ví dụ: Rút tiền chi tiêu cá nhân' 
                  : 'Ví dụ: Tiền lãi kỳ hạn tháng 6/2024'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:bg-white focus:outline-emerald-600"
            />
          </div>

          {/* New Balance Preview */}
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500">
              {mode === 'interest' && !addedToBalance ? 'Số dư sổ sau ghi nhận:' : 'Số dư dự kiến sau giao dịch:'}
            </span>
            <span className="font-bold text-neutral-900 tabular-nums">
              {formatVND(projectedBalance)}
            </span>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 rounded-xl text-xs sm:text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 ${config.btnColor} text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50`}
            >
              <Save size={16} />
              <span>{loading ? 'Đang lưu...' : 'Lưu giao dịch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
