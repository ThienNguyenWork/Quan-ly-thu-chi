import React, { useState } from 'react';
import { X, AlertTriangle, Archive, Trash2, CheckCircle2 } from 'lucide-react';
import { SavingsBook, SavingsTransaction } from '../../types/savings';
import { formatVND } from '../../utils/formatters';

interface SavingsDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: SavingsBook | null;
  transactions: SavingsTransaction[];
  onConfirmArchive: (book: SavingsBook) => Promise<void>;
  onConfirmDelete: (book: SavingsBook) => Promise<void>;
}

export const SavingsDeleteModal: React.FC<SavingsDeleteModalProps> = ({
  isOpen,
  onClose,
  book,
  transactions,
  onConfirmArchive,
  onConfirmDelete,
}) => {
  const [actionType, setActionType] = useState<'archive' | 'delete'>('archive');
  const [confirmedPermanent, setConfirmedPermanent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !book) return null;

  const bookTxs = transactions.filter((t) => t.book_id === book.id);
  const hasHistory = bookTxs.length > 0;

  const handleExecute = async () => {
    if (actionType === 'delete' && hasHistory && !confirmedPermanent) {
      setError('Vui lòng đánh dấu xác nhận nếu bạn muốn xóa vĩnh viễn toàn bộ lịch sử');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (actionType === 'archive') {
        await onConfirmArchive(book);
      } else {
        await onConfirmDelete(book);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi xử lý thao tác với sổ tiết kiệm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-neutral-200/90 my-auto overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              actionType === 'delete' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'
            }`}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 tracking-tight">
                {actionType === 'delete' ? 'Xóa sổ tiết kiệm' : 'Đóng / Lưu trữ sổ tiết kiệm'}
              </h3>
              <p className="text-xs text-neutral-500">
                Xác nhận thao tác đối với sổ tiết kiệm
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Detail Box */}
          <div className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Tên sổ:</span>
              <strong className="text-neutral-900 font-bold">{book.account_name}</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Ngân hàng:</span>
              <strong className="text-neutral-900 font-bold">{book.bank_name}</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500">Số dư hiện tại:</span>
              <strong className="text-emerald-700 font-bold tabular-nums">
                {formatVND(book.current_balance)}
              </strong>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-200/60">
              <span className="text-neutral-500">Lịch sử giao dịch:</span>
              <span className="font-semibold text-neutral-800">
                {bookTxs.length} giao dịch (gửi/rút/lãi)
              </span>
            </div>
          </div>

          {/* Option Selector: Archive vs Permanent Delete */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-700 block">
              Chọn hình thức xử lý:
            </span>

            {/* Option 1: Archive (Recommended) */}
            <label
              onClick={() => {
                setActionType('archive');
                setError(null);
              }}
              className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                actionType === 'archive'
                  ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                  : 'border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <input
                type="radio"
                name="delete_action_type"
                checked={actionType === 'archive'}
                onChange={() => setActionType('archive')}
                className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="text-xs min-w-0">
                <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                  <Archive size={14} className="text-emerald-600" />
                  <span>Đóng sổ & Lưu trữ (Khuyên dùng)</span>
                </div>
                <p className="text-neutral-500 mt-0.5 leading-relaxed">
                  Bảo toàn đầy đủ lịch sử giao dịch và số liệu thu chi đã phát sinh. Sổ sẽ được đánh dấu đã đóng và không tính vào số dư đang gửi.
                </p>
              </div>
            </label>

            {/* Option 2: Permanent Delete */}
            <label
              onClick={() => {
                setActionType('delete');
                setError(null);
              }}
              className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                actionType === 'delete'
                  ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500'
                  : 'border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <input
                type="radio"
                name="delete_action_type"
                checked={actionType === 'delete'}
                onChange={() => setActionType('delete')}
                className="mt-1 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <div className="text-xs min-w-0">
                <div className="flex items-center gap-1.5 font-bold text-rose-700">
                  <Trash2 size={14} className="text-rose-600" />
                  <span>Xóa vĩnh viễn khỏi hệ thống</span>
                </div>
                <p className="text-rose-600/80 mt-0.5 leading-relaxed">
                  Xóa toàn bộ dữ liệu sổ và {bookTxs.length} giao dịch liên quan. Không thể phục hồi sau khi xóa.
                </p>
              </div>
            </label>
          </div>

          {/* Explicit Confirmation Checkbox for Permanent Delete */}
          {actionType === 'delete' && hasHistory && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 space-y-2">
              <label className="flex items-start gap-2 text-xs text-rose-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedPermanent}
                  onChange={(e) => setConfirmedPermanent(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span className="font-semibold leading-relaxed">
                  Tôi hiểu rằng thao tác này sẽ xóa vĩnh viễn sổ và toàn bộ {bookTxs.length} lịch sử giao dịch, không thể khôi phục.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-neutral-100 flex items-center justify-end gap-2.5 bg-neutral-50/60">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-neutral-200 rounded-xl text-xs sm:text-sm font-medium text-neutral-700 hover:bg-white transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleExecute}
            disabled={loading || (actionType === 'delete' && hasHistory && !confirmedPermanent)}
            className={`px-4 sm:px-5 py-2 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              actionType === 'delete'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {actionType === 'delete' ? (
              <>
                <Trash2 size={15} />
                <span>{loading ? 'Đang xóa...' : 'Xác nhận xóa vĩnh viễn'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                <span>{loading ? 'Đang lưu trữ...' : 'Xác nhận lưu trữ sổ'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
