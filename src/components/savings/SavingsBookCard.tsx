import React from 'react';
import { SavingsBook } from '../../types/savings';
import { formatVND } from '../../utils/formatters';
import { VIETNAMESE_BANKS } from '../../constants/banks';
import { 
  Landmark, 
  Calendar, 
  Percent, 
  Coins, 
  ArrowDownRight, 
  ArrowUpRight, 
  History, 
  Edit3, 
  Trash2,
  Archive
} from 'lucide-react';

interface SavingsBookCardProps {
  book: SavingsBook;
  onDeposit: (book: SavingsBook) => void;
  onWithdraw: (book: SavingsBook) => void;
  onReceiveInterest: (book: SavingsBook) => void;
  onViewHistory: (book: SavingsBook) => void;
  onEdit: (book: SavingsBook) => void;
  onDelete: (book: SavingsBook) => void;
}

export const SavingsBookCard: React.FC<SavingsBookCardProps> = ({
  book,
  onDeposit,
  onWithdraw,
  onReceiveInterest,
  onViewHistory,
  onEdit,
  onDelete,
}) => {
  const bankPreset = VIETNAMESE_BANKS.find((b) => b.code === book.bank_code);
  const bankColor = bankPreset?.color || '#059669';
  const isArchived = book.status === 'settled';

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
      isArchived 
        ? 'border-neutral-200/70 bg-neutral-50/40 opacity-80' 
        : 'border-neutral-200/90 shadow-2xs hover:shadow-xs hover:border-neutral-300'
    }`}>
      {/* Header: Bank & Account Info + Direct Edit & Delete Buttons */}
      <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs"
            style={{ backgroundColor: bankColor }}
          >
            {book.bank_code.length <= 4 ? book.bank_code : <Landmark size={18} />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-neutral-500 truncate">
                {book.bank_name}
              </span>
              {book.account_number && (
                <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded shrink-0">
                  {book.account_number}
                </span>
              )}
              {isArchived && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-600 bg-neutral-200/80 px-1.5 py-0.5 rounded">
                  <Archive size={10} />
                  Đã lưu trữ
                </span>
              )}
            </div>
            <h4 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight truncate mt-0.5">
              {book.account_name || `Tiết kiệm ${book.bank_name}`}
            </h4>
          </div>
        </div>

        {/* Header Action Buttons: Direct Edit and Delete */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(book);
            }}
            className="p-1.5 text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            title="Chỉnh sửa sổ tiết kiệm"
          >
            <Edit3 size={15} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(book);
            }}
            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Xóa hoặc lưu trữ sổ tiết kiệm"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-4 flex-1">
        {/* Current Balance */}
        <div>
          <span className="text-[11px] font-medium text-neutral-400 block uppercase tracking-wider">
            Số dư tiết kiệm hiện tại
          </span>
          <div className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight tabular-nums mt-0.5">
            {formatVND(book.current_balance)}
          </div>
        </div>

        {/* 3 Key Stats: Deposit Date, Interest Rate, Total Interest Received */}
        <div className="grid grid-cols-3 gap-2.5 pt-1 border-t border-neutral-100">
          {/* Deposit Date */}
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-400 flex items-center gap-1 truncate">
              <Calendar size={11} className="text-neutral-400 shrink-0" />
              <span>Ngày gửi</span>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-neutral-800 tabular-nums block mt-0.5 truncate">
              {book.start_date}
            </span>
          </div>

          {/* Interest Rate */}
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-400 flex items-center gap-1 truncate">
              <Percent size={11} className="text-emerald-500 shrink-0" />
              <span>Lãi suất</span>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-emerald-700 tabular-nums block mt-0.5 truncate">
              {book.interest_rate !== undefined ? `${book.interest_rate}%/năm` : 'Chưa có'}
            </span>
          </div>

          {/* Total Interest Received */}
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-400 flex items-center gap-1 truncate">
              <Coins size={11} className="text-purple-500 shrink-0" />
              <span>Lãi đã nhận</span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-purple-700 tabular-nums block mt-0.5 truncate">
              +{formatVND(book.total_interest_received || 0)}
            </span>
          </div>
        </div>

        {/* Optional Note */}
        {book.note && (
          <p className="text-xs text-neutral-500 italic bg-neutral-50 p-2 rounded-lg border border-neutral-100 truncate">
            &ldquo;{book.note}&rdquo;
          </p>
        )}
      </div>

      {/* Main Actions Footer */}
      <div className="p-3 bg-neutral-50/80 border-t border-neutral-100 grid grid-cols-4 gap-1.5 sm:gap-2">
        {/* 1. Gửi tiền */}
        <button
          type="button"
          onClick={() => onDeposit(book)}
          className="py-1.5 px-1 sm:px-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
          title="Ghi nhận gửi thêm tiền"
        >
          <ArrowDownRight size={13} className="shrink-0" />
          <span className="truncate">Gửi tiền</span>
        </button>

        {/* 2. Rút tiền */}
        <button
          type="button"
          onClick={() => onWithdraw(book)}
          className="py-1.5 px-1 sm:px-2 bg-white hover:bg-amber-50 text-amber-700 border border-amber-200/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
          title="Ghi nhận rút tiền"
        >
          <ArrowUpRight size={13} className="shrink-0" />
          <span className="truncate">Rút tiền</span>
        </button>

        {/* 3. Nhận lãi */}
        <button
          type="button"
          onClick={() => onReceiveInterest(book)}
          className="py-1.5 px-1 sm:px-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
          title="Ghi nhận tiền lãi thực nhận"
        >
          <Coins size={13} className="shrink-0" />
          <span className="truncate">Nhận lãi</span>
        </button>

        {/* 4. Lịch sử */}
        <button
          type="button"
          onClick={() => onViewHistory(book)}
          className="py-1.5 px-1 sm:px-2 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
          title="Xem lịch sử giao dịch"
        >
          <History size={13} className="shrink-0" />
          <span className="truncate">Lịch sử</span>
        </button>
      </div>
    </div>
  );
};
