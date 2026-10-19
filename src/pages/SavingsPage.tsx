import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { savingsService } from '../services/savingsService';
import { SavingsBook, SavingsTransaction, SavingsStats, BankDistribution } from '../types/savings';
import { SavingsSummaryCards } from '../components/savings/SavingsSummaryCards';
import { SavingsBankChart } from '../components/savings/SavingsBankChart';
import { SavingsBookCard } from '../components/savings/SavingsBookCard';
import { SavingsBookModal } from '../components/savings/SavingsBookModal';
import { SavingsTransactionModal, SavingsActionType } from '../components/savings/SavingsTransactionModal';
import { SavingsHistoryModal } from '../components/savings/SavingsHistoryModal';
import { SavingsDeleteModal } from '../components/savings/SavingsDeleteModal';
import { 
  PiggyBank, 
  Plus, 
  Search, 
  RefreshCw,
  FolderOpen,
  Landmark,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

interface NotificationState {
  type: 'success' | 'error';
  message: string;
}

export const SavingsPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'demo_user';

  const [books, setBooks] = useState<SavingsBook[]>([]);
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [stats, setStats] = useState<SavingsStats>({
    totalSavings: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    totalInterestReceived: 0,
    totalBooksCount: 0,
  });
  const [distribution, setDistribution] = useState<BankDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>('all');

  // Status/Toast Notification
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showFeedback = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<SavingsBook | null>(null);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txTargetBook, setTxTargetBook] = useState<SavingsBook | null>(null);
  const [txMode, setTxMode] = useState<SavingsActionType>('deposit');

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTargetBook, setHistoryTargetBook] = useState<SavingsBook | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetBook, setDeleteTargetBook] = useState<SavingsBook | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedBooks, fetchedTxs, fetchedStats, fetchedDist] = await Promise.all([
        savingsService.getSavingsBooks(userId),
        savingsService.getSavingsTransactions(userId),
        savingsService.getSavingsStats(userId),
        savingsService.getBankDistribution(userId),
      ]);

      setBooks(fetchedBooks);
      setTransactions(fetchedTxs);
      setStats(fetchedStats);
      setDistribution(fetchedDist);
    } catch (e: unknown) {
      console.error('Error loading savings data:', e);
      showFeedback('error', 'Có lỗi khi tải dữ liệu sổ tiết kiệm');
    } finally {
      setLoading(false);
    }
  }, [userId, showFeedback]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Dynamically extract banks that actually exist in user's data
  const availableBanks = useMemo(() => {
    const map = new Map<string, { code: string; name: string; count: number }>();
    books.forEach((b) => {
      const code = b.bank_code || 'OTHER';
      const existing = map.get(code);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(code, {
          code,
          name: b.bank_name || code,
          count: 1,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [books]);

  // Reset to "all" if selected bank no longer exists in available data
  useEffect(() => {
    if (selectedBankFilter !== 'all') {
      const exists = availableBanks.some((b) => b.code === selectedBankFilter);
      if (!exists) {
        setSelectedBankFilter('all');
      }
    }
  }, [availableBanks, selectedBankFilter]);

  // Handle Save / Edit Book
  const handleSaveBook = async (data: {
    bank_code: string;
    bank_name: string;
    initial_deposit?: number;
    start_date: string;
    account_name?: string;
    account_number?: string;
    interest_rate?: number;
    note?: string;
  }) => {
    try {
      if (editingBook) {
        await savingsService.updateSavingsBook(userId, editingBook.id, data);
        await loadData();
        showFeedback('success', `Đã cập nhật thông tin sổ "${data.account_name || data.bank_name}" thành công!`);
      } else {
        await savingsService.createSavingsBook(userId, data);
        await loadData();
        showFeedback('success', `Đã thêm mới sổ tiết kiệm tại ${data.bank_name} thành công!`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi lưu sổ tiết kiệm';
      showFeedback('error', msg);
      throw err;
    }
  };

  // Open Delete / Archive Modal
  const handleDeleteClick = (book: SavingsBook) => {
    setDeleteTargetBook(book);
    setIsDeleteModalOpen(true);
  };

  // Confirm Archive
  const handleConfirmArchive = async (book: SavingsBook) => {
    try {
      await savingsService.archiveSavingsBook(userId, book.id);
      await loadData();
      showFeedback('success', `Đã đóng & lưu trữ sổ "${book.account_name}" thành công!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi lưu trữ sổ tiết kiệm';
      showFeedback('error', msg);
      throw err;
    }
  };

  // Confirm Permanent Delete
  const handleConfirmDelete = async (book: SavingsBook) => {
    try {
      await savingsService.deleteSavingsBook(userId, book.id);
      await loadData();
      showFeedback('success', `Đã xóa vĩnh viễn sổ "${book.account_name}" và toàn bộ lịch sử!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi xóa sổ tiết kiệm';
      showFeedback('error', msg);
      throw err;
    }
  };

  // Open transaction modal
  const handleOpenTransaction = (book: SavingsBook, mode: SavingsActionType) => {
    setTxTargetBook(book);
    setTxMode(mode);
    setIsTxModalOpen(true);
  };

  const handleSubmitTransaction = async (data: {
    book_id: string;
    type: SavingsActionType;
    amount: number;
    transaction_date: string;
    note?: string;
    added_to_balance?: boolean;
  }) => {
    try {
      await savingsService.addTransaction(userId, data);
      await loadData();
      const actionLabels: Record<SavingsActionType, string> = {
        deposit: 'Gửi tiền vào sổ',
        withdraw: 'Rút tiền từ sổ',
        interest: 'Ghi nhận tiền lãi thực nhận',
      };
      showFeedback('success', `Đã ghi nhận giao dịch: ${actionLabels[data.type]}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi thực hiện giao dịch';
      showFeedback('error', msg);
      throw err;
    }
  };

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      // Bank dropdown filter
      if (selectedBankFilter !== 'all' && b.bank_code !== selectedBankFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = b.account_name?.toLowerCase().includes(q);
        const matchBank = b.bank_name?.toLowerCase().includes(q);
        const matchNumber = b.account_number?.toLowerCase().includes(q);
        if (!matchName && !matchBank && !matchNumber) return false;
      }

      return true;
    });
  }, [books, selectedBankFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {notification && (
        <div className={`p-3.5 sm:p-4 rounded-2xl border shadow-xs flex items-center justify-between gap-3 transition-all animate-in fade-in slide-in-from-top duration-200 ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {notification.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-semibold truncate">
              {notification.message}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-black/5 rounded-lg text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <PiggyBank size={24} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
              Sổ Tiết Kiệm
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Ghi nhận tiền gửi ngân hàng, lãi suất, nhận lãi và lịch sử giao dịch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadData}
            title="Làm mới dữ liệu"
            className="p-2.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingBook(null);
              setIsBookModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Thêm sổ tiết kiệm</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <SavingsSummaryCards stats={stats} />

      {/* Bank Distribution Chart */}
      <SavingsBankChart distribution={distribution} />

      {/* Filter Dropdown & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Bank Select Dropdown (Requirement 2) */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Landmark size={15} />
              </div>
              <select
                value={selectedBankFilter}
                onChange={(e) => setSelectedBankFilter(e.target.value)}
                className="w-full pl-9 pr-9 py-2 bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm font-semibold text-neutral-800 focus:outline-emerald-600 shadow-2xs appearance-none cursor-pointer"
              >
                {/* Always show "Tất cả sổ" as the first option */}
                <option value="all">Tất cả sổ ({books.length})</option>
                {/* Dynamically list banks that actually exist in user's data */}
                {availableBanks.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name} ({bank.count} sổ)
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <ChevronDown size={14} />
              </div>
            </div>

            {selectedBankFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedBankFilter('all')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline whitespace-nowrap cursor-pointer shrink-0"
              >
                Xem tất cả
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tên sổ, ngân hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-emerald-600 shadow-2xs"
            />
          </div>
        </div>

        {/* Savings Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <FolderOpen size={24} />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm">
              Không tìm thấy sổ tiết kiệm nào
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-4">
              {searchQuery
                ? `Không có kết quả khớp với "${searchQuery}". Vui lòng thử từ khóa khác.`
                : selectedBankFilter !== 'all'
                ? 'Không có sổ tiết kiệm nào tại ngân hàng đã chọn.'
                : 'Bạn chưa có sổ tiết kiệm nào. Hãy bắt đầu ghi nhận khoản tiết kiệm đầu tiên!'}
            </p>
            <button
              type="button"
              onClick={() => {
                if (selectedBankFilter !== 'all') {
                  setSelectedBankFilter('all');
                } else {
                  setEditingBook(null);
                  setIsBookModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              {selectedBankFilter !== 'all' ? (
                <span>Xem tất cả sổ</span>
              ) : (
                <>
                  <Plus size={15} />
                  <span>Thêm sổ tiết kiệm ngay</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <SavingsBookCard
                key={book.id}
                book={book}
                onDeposit={(b) => handleOpenTransaction(b, 'deposit')}
                onWithdraw={(b) => handleOpenTransaction(b, 'withdraw')}
                onReceiveInterest={(b) => handleOpenTransaction(b, 'interest')}
                onViewHistory={(b) => {
                  setHistoryTargetBook(b);
                  setIsHistoryModalOpen(true);
                }}
                onEdit={(b) => {
                  setEditingBook(b);
                  setIsBookModalOpen(true);
                }}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <SavingsBookModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSubmit={handleSaveBook}
        editingBook={editingBook}
      />

      <SavingsTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        book={txTargetBook}
        mode={txMode}
        onSubmit={handleSubmitTransaction}
      />

      <SavingsHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        book={historyTargetBook}
        transactions={transactions}
      />

      {/* Delete / Archive Confirmation Modal */}
      <SavingsDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetBook(null);
        }}
        book={deleteTargetBook}
        transactions={transactions}
        onConfirmArchive={handleConfirmArchive}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
