import React from 'react';
import { X, ArrowDownRight, ArrowUpRight, Coins, History, CheckCircle2 } from 'lucide-react';
import { SavingsBook, SavingsTransaction } from '../../types/savings';
import { formatVND } from '../../utils/formatters';

interface SavingsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: SavingsBook | null;
  transactions: SavingsTransaction[];
}

export const SavingsHistoryModal: React.FC<SavingsHistoryModalProps> = ({
  isOpen,
  onClose,
  book,
  transactions,
}) => {
  if (!isOpen || !book) return null;

  const bookTxs = transactions.filter((t) => t.book_id === book.id);

  // Stats for this specific book
  const totalDeposited = bookTxs
    .filter((t) => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawn = bookTxs
    .filter((t) => t.type === 'withdraw' || t.type === 'settlement')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInterest = bookTxs
    .filter((t) => t.type === 'interest')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[88vh] flex flex-col shadow-2xl border border-neutral-200/80 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
              <History size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-neutral-900 tracking-tight truncate">
                Lịch sử giao dịch sổ tiết kiệm
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

        {/* Quick Summary Pill Bar */}
        <div className="px-4 py-2.5 bg-neutral-50 border-b border-neutral-100 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-neutral-400 block uppercase font-medium">Đã gửi</span>
            <span className="font-bold text-neutral-800 tabular-nums">
              {formatVND(totalDeposited > 0 ? totalDeposited : book.initial_deposit)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 block uppercase font-medium">Đã rút</span>
            <span className="font-bold text-amber-700 tabular-nums">
              {formatVND(totalWithdrawn)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 block uppercase font-medium">Lãi đã nhận</span>
            <span className="font-bold text-purple-700 tabular-nums">
              +{formatVND(totalInterest > 0 ? totalInterest : (book.total_interest_received || 0))}
            </span>
          </div>
        </div>

        {/* Transactions list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {bookTxs.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              Chưa có lịch sử giao dịch phát sinh cho sổ này
            </div>
          ) : (
            bookTxs.map((tx) => {
              const isDeposit = tx.type === 'deposit';
              const isWithdraw = tx.type === 'withdraw';
              const isInterest = tx.type === 'interest';

              return (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl border border-neutral-100 bg-neutral-50/60 flex items-center justify-between gap-3 text-xs hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isDeposit
                          ? 'bg-emerald-100 text-emerald-700'
                          : isWithdraw
                          ? 'bg-amber-100 text-amber-700'
                          : isInterest
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {isDeposit ? (
                        <ArrowDownRight size={17} />
                      ) : isWithdraw ? (
                        <ArrowUpRight size={17} />
                      ) : isInterest ? (
                        <Coins size={17} />
                      ) : (
                        <CheckCircle2 size={17} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                            isDeposit
                              ? 'bg-emerald-50 text-emerald-800'
                              : isWithdraw
                              ? 'bg-amber-50 text-amber-800'
                              : isInterest
                              ? 'bg-purple-50 text-purple-800'
                              : 'bg-blue-50 text-blue-800'
                          }`}
                        >
                          {isDeposit
                            ? 'Gửi tiền'
                            : isWithdraw
                            ? 'Rút tiền'
                            : isInterest
                            ? 'Nhận lãi'
                            : 'Tất toán'}
                        </span>
                        {isInterest && tx.added_to_balance && (
                          <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.2 rounded font-medium">
                            Nhập gốc
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-400 tabular-nums">
                          {tx.transaction_date}
                        </span>
                      </div>
                      {tx.note && (
                        <p className="text-[11px] text-neutral-600 truncate mt-0.5 font-normal">
                          {tx.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-bold tabular-nums text-sm ${
                        isDeposit
                          ? 'text-emerald-700'
                          : isWithdraw
                          ? 'text-amber-700'
                          : isInterest
                          ? 'text-purple-700'
                          : 'text-blue-700'
                      }`}
                    >
                      {isDeposit || isInterest ? '+' : '-'}{formatVND(tx.amount)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 bg-neutral-50">
          <span>
            Số dư hiện tại: <strong className="text-neutral-900 tabular-nums font-bold">{formatVND(book.current_balance)}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white border border-neutral-200 rounded-lg font-medium text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
