import { 
  SavingsBook, 
  SavingsTransaction, 
  SavingsStats, 
  BankDistribution 
} from '../types/savings';
import { VIETNAMESE_BANKS, getDistinctBankColor } from '../constants/banks';
import { supabase } from '../lib/supabase';

const STORAGE_PREFIX_BOOKS = 'finance_savings_books_';
const STORAGE_PREFIX_TXS = 'finance_savings_txs_';

function getStorageKeys(userId: string) {
  const safeId = userId || 'default_user';
  return {
    booksKey: `${STORAGE_PREFIX_BOOKS}${safeId}`,
    txsKey: `${STORAGE_PREFIX_TXS}${safeId}`,
  };
}

/**
 * Initial sample savings books to immediately populate if a user starts fresh
 */
function getInitialSampleBooks(userId: string): { books: SavingsBook[]; txs: SavingsTransaction[] } {
  const now = new Date();
  
  // Book 1: Vietcombank
  const d1 = new Date(now.getFullYear(), now.getMonth() - 4, 15);
  const start1 = d1.toISOString().split('T')[0];
  const deposit1 = 100000000;
  const rate1 = 5.3;

  // Book 2: Techcombank
  const d2 = new Date(now.getFullYear(), now.getMonth() - 2, 10);
  const start2 = d2.toISOString().split('T')[0];
  const deposit2 = 50000000;
  const rate2 = 4.8;

  // Book 3: MB Bank
  const d3 = new Date(now.getFullYear(), now.getMonth() - 1, 20);
  const start3 = d3.toISOString().split('T')[0];
  const deposit3 = 30000000;
  const rate3 = 4.5;

  const book1Id = `sb_${Date.now()}_1`;
  const book2Id = `sb_${Date.now()}_2`;
  const book3Id = `sb_${Date.now()}_3`;

  const books: SavingsBook[] = [
    {
      id: book1Id,
      user_id: userId,
      bank_code: 'VCB',
      bank_name: 'Vietcombank',
      account_name: 'Tiết kiệm dài hạn Vietcombank',
      account_number: 'STK-00129845',
      initial_deposit: deposit1,
      current_balance: deposit1,
      interest_rate: rate1,
      start_date: start1,
      total_interest_received: 1325000,
      note: 'Quỹ dự phòng tài chính gia đình',
      status: 'active',
      created_at: d1.toISOString(),
    },
    {
      id: book2Id,
      user_id: userId,
      bank_code: 'TCB',
      bank_name: 'Techcombank',
      account_name: 'Tích lũy mua xe mới',
      account_number: 'TCB-8839201',
      initial_deposit: deposit2,
      current_balance: deposit2,
      interest_rate: rate2,
      start_date: start2,
      total_interest_received: 400000,
      note: 'Gửi online qua Techcombank Mobile',
      status: 'active',
      created_at: d2.toISOString(),
    },
    {
      id: book3Id,
      user_id: userId,
      bank_code: 'MB',
      bank_name: 'MBBank',
      account_name: 'Quỹ tiết kiệm linh hoạt MB',
      account_number: 'MB-992384',
      initial_deposit: deposit3,
      current_balance: deposit3,
      interest_rate: rate3,
      start_date: start3,
      total_interest_received: 0,
      note: 'Mở sổ tại chi nhánh Hà Nội',
      status: 'active',
      created_at: d3.toISOString(),
    },
  ];

  const txs: SavingsTransaction[] = [
    {
      id: `tx_${Date.now()}_1`,
      book_id: book1Id,
      user_id: userId,
      type: 'deposit',
      amount: deposit1,
      transaction_date: start1,
      note: 'Gửi tiền ban đầu',
      created_at: d1.toISOString(),
    },
    {
      id: `tx_${Date.now()}_1_int`,
      book_id: book1Id,
      user_id: userId,
      type: 'interest',
      amount: 1325000,
      transaction_date: new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString().split('T')[0],
      note: 'Lãi tiền gửi định kỳ',
      added_to_balance: false,
      created_at: new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString(),
    },
    {
      id: `tx_${Date.now()}_2`,
      book_id: book2Id,
      user_id: userId,
      type: 'deposit',
      amount: deposit2,
      transaction_date: start2,
      note: 'Gửi tiền ban đầu',
      created_at: d2.toISOString(),
    },
    {
      id: `tx_${Date.now()}_2_int`,
      book_id: book2Id,
      user_id: userId,
      type: 'interest',
      amount: 400000,
      transaction_date: new Date(now.getFullYear(), now.getMonth() - 1, 10).toISOString().split('T')[0],
      note: 'Nhận lãi ngân hàng chuyển khoản',
      added_to_balance: false,
      created_at: new Date(now.getFullYear(), now.getMonth() - 1, 10).toISOString(),
    },
    {
      id: `tx_${Date.now()}_3`,
      book_id: book3Id,
      user_id: userId,
      type: 'deposit',
      amount: deposit3,
      transaction_date: start3,
      note: 'Gửi tiền ban đầu',
      created_at: d3.toISOString(),
    },
  ];

  return { books, txs };
}

export const savingsService = {
  /**
   * Get all savings books for user, synced with actual transactions for interest received
   */
  async getSavingsBooks(userId: string): Promise<SavingsBook[]> {
    if (!userId) return [];

    // 1. Try fetching from Supabase if table exists
    try {
      const { data, error } = await supabase
        .from('savings_books')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as SavingsBook[];
      }
    } catch {
      // Supabase table may not be created yet, proceed to localStorage
    }

    const { booksKey, txsKey } = getStorageKeys(userId);
    const stored = localStorage.getItem(booksKey);

    if (!stored) {
      // Seed with initial realistic data for new user
      const { books, txs } = getInitialSampleBooks(userId);
      localStorage.setItem(booksKey, JSON.stringify(books));
      localStorage.setItem(txsKey, JSON.stringify(txs));
      return books;
    }

    try {
      const books: SavingsBook[] = JSON.parse(stored);
      const txs = await this.getSavingsTransactions(userId);

      // Recompute total_interest_received per book from transactions
      const booksWithInterest = books.map((book) => {
        const bookTxs = txs.filter((t) => t.book_id === book.id);
        const interestSum = bookTxs
          .filter((t) => t.type === 'interest')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalInterest = interestSum > 0 ? interestSum : (book.total_interest_received || book.settled_interest || 0);

        return {
          ...book,
          total_interest_received: totalInterest,
        };
      });

      return booksWithInterest;
    } catch (e) {
      console.error('Failed to parse savings books:', e);
      return [];
    }
  },

  /**
   * Create a new savings book
   */
  async createSavingsBook(
    userId: string,
    data: {
      bank_code: string;
      bank_name: string;
      initial_deposit?: number;
      start_date: string;
      account_name?: string;
      account_number?: string;
      interest_rate?: number;
      note?: string;
      term_months?: number;
    }
  ): Promise<SavingsBook> {
    const { booksKey, txsKey } = getStorageKeys(userId);
    const books = await this.getSavingsBooks(userId);

    const displayName = data.account_name?.trim() || `Tiết kiệm ${data.bank_name}`;
    const initialDeposit = Number(data.initial_deposit) || 0;

    const newBook: SavingsBook = {
      id: `sb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      bank_code: data.bank_code,
      bank_name: data.bank_name,
      account_name: displayName,
      account_number: data.account_number?.trim() || undefined,
      initial_deposit: initialDeposit,
      current_balance: initialDeposit,
      interest_rate: data.interest_rate !== undefined ? Number(data.interest_rate) : undefined,
      start_date: data.start_date,
      total_interest_received: 0,
      note: data.note?.trim() || undefined,
      term_months: data.term_months,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    const newTx: SavingsTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      book_id: newBook.id,
      user_id: userId,
      type: 'deposit',
      amount: initialDeposit,
      transaction_date: data.start_date,
      note: 'Gửi tiền ban đầu',
      created_at: new Date().toISOString(),
    };

    // Attempt Supabase insert if table is configured
    try {
      await supabase.from('savings_books').insert(newBook);
      await supabase.from('savings_transactions').insert(newTx);
    } catch {
      // Local fallback
    }

    const updatedBooks = [newBook, ...books];
    localStorage.setItem(booksKey, JSON.stringify(updatedBooks));

    // Save initial transaction
    const txs = await this.getSavingsTransactions(userId);
    localStorage.setItem(txsKey, JSON.stringify([newTx, ...txs]));

    return newBook;
  },

  /**
   * Update existing savings book details safely.
   * STRICT SAFETY GUARANTEES:
   * 1. Uses existing account ID to identify record.
   * 2. NEVER overwrites current_balance with initial_deposit.
   * 3. NEVER deletes or rewrites historical transaction records.
   * 4. Updates bank, account_name, account_number, interest_rate, start_date, note.
   */
  async updateSavingsBook(
    userId: string,
    bookId: string,
    data: {
      bank_code?: string;
      bank_name?: string;
      account_name?: string;
      account_number?: string;
      interest_rate?: number;
      start_date?: string;
      note?: string;
    }
  ): Promise<SavingsBook> {
    if (!bookId) {
      throw new Error('Mã sổ tiết kiệm không hợp lệ để cập nhật');
    }

    const { booksKey } = getStorageKeys(userId);
    const books = await this.getSavingsBooks(userId);
    const index = books.findIndex((b) => b.id === bookId);

    if (index === -1) {
      throw new Error(`Không tìm thấy sổ tiết kiệm có ID "${bookId}" để cập nhật`);
    }

    const current = books[index];

    // Safely update only allowed editable fields, strictly preserving balance & history
    const updated: SavingsBook = {
      ...current,
      bank_code: data.bank_code || current.bank_code,
      bank_name: data.bank_name || current.bank_name,
      account_name: data.account_name !== undefined ? (data.account_name.trim() || current.account_name) : current.account_name,
      account_number: data.account_number !== undefined ? (data.account_number.trim() || undefined) : current.account_number,
      interest_rate: data.interest_rate !== undefined ? Number(data.interest_rate) : current.interest_rate,
      start_date: data.start_date || current.start_date,
      note: data.note !== undefined ? (data.note.trim() || undefined) : current.note,
      updated_at: new Date().toISOString(),
    };

    // Attempt Supabase update if table exists
    try {
      const { error } = await supabase
        .from('savings_books')
        .update({
          bank_code: updated.bank_code,
          bank_name: updated.bank_name,
          account_name: updated.account_name,
          account_number: updated.account_number,
          interest_rate: updated.interest_rate,
          start_date: updated.start_date,
          note: updated.note,
          updated_at: updated.updated_at,
        })
        .eq('id', bookId)
        .eq('user_id', userId);

      if (error && error.code !== '42P01' && !error.message.includes('schema cache')) {
        console.warn('Supabase update warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase sync error on update:', err);
    }

    books[index] = updated;
    localStorage.setItem(booksKey, JSON.stringify(books));
    return updated;
  },

  /**
   * Archive / Close savings book (Đóng sổ & Lưu trữ).
   * Safely marks status as 'settled', preserving all financial transaction history.
   */
  async archiveSavingsBook(userId: string, bookId: string): Promise<SavingsBook> {
    if (!bookId) {
      throw new Error('Mã sổ tiết kiệm không hợp lệ');
    }

    const { booksKey } = getStorageKeys(userId);
    const books = await this.getSavingsBooks(userId);
    const index = books.findIndex((b) => b.id === bookId);

    if (index === -1) {
      throw new Error('Không tìm thấy sổ tiết kiệm để lưu trữ');
    }

    const current = books[index];
    const updated: SavingsBook = {
      ...current,
      status: 'settled',
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase
        .from('savings_books')
        .update({ status: 'settled', updated_at: updated.updated_at })
        .eq('id', bookId)
        .eq('user_id', userId);
    } catch {
      // Local fallback
    }

    books[index] = updated;
    localStorage.setItem(booksKey, JSON.stringify(books));
    return updated;
  },

  /**
   * Permanently delete savings book and its associated transactions.
   * Completely cleans up transactions to prevent orphaned records.
   */
  async deleteSavingsBook(userId: string, bookId: string): Promise<void> {
    if (!bookId) {
      throw new Error('Mã sổ tiết kiệm không hợp lệ để xóa');
    }

    const { booksKey, txsKey } = getStorageKeys(userId);
    const books = await this.getSavingsBooks(userId);
    const filteredBooks = books.filter((b) => b.id !== bookId);

    // Try Supabase cascade delete
    try {
      await supabase.from('savings_transactions').delete().eq('book_id', bookId).eq('user_id', userId);
      await supabase.from('savings_books').delete().eq('id', bookId).eq('user_id', userId);
    } catch {
      // Local fallback
    }

    localStorage.setItem(booksKey, JSON.stringify(filteredBooks));

    // Clean up local transactions to prevent orphans
    const txs = await this.getSavingsTransactions(userId);
    const filteredTxs = txs.filter((t) => t.book_id !== bookId);
    localStorage.setItem(txsKey, JSON.stringify(filteredTxs));
  },

  /**
   * Add a transaction (Gửi tiền, Rút tiền, or Nhận lãi) to a savings book
   */
  async addTransaction(
    userId: string,
    data: {
      book_id: string;
      type: 'deposit' | 'withdraw' | 'interest';
      amount: number;
      transaction_date: string;
      note?: string;
      added_to_balance?: boolean;
    }
  ): Promise<SavingsTransaction> {
    const { booksKey, txsKey } = getStorageKeys(userId);
    const books = await this.getSavingsBooks(userId);
    const bookIndex = books.findIndex((b) => b.id === data.book_id);

    if (bookIndex === -1) {
      throw new Error('Sổ tiết kiệm không tồn tại');
    }

    const book = books[bookIndex];
    let newBalance = book.current_balance;
    let newTotalInterest = book.total_interest_received || 0;

    if (data.type === 'deposit') {
      newBalance += data.amount;
    } else if (data.type === 'withdraw') {
      if (data.amount > book.current_balance) {
        throw new Error(`Số tiền rút (${data.amount.toLocaleString('vi-VN')} ₫) vượt quá số dư hiện tại của sổ`);
      }
      newBalance -= data.amount;
    } else if (data.type === 'interest') {
      newTotalInterest += data.amount;
      if (data.added_to_balance) {
        newBalance += data.amount;
      }
    }

    books[bookIndex] = {
      ...book,
      current_balance: newBalance,
      total_interest_received: newTotalInterest,
      updated_at: new Date().toISOString(),
    };

    const newTx: SavingsTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      book_id: data.book_id,
      user_id: userId,
      type: data.type,
      amount: Number(data.amount),
      transaction_date: data.transaction_date,
      note: data.note?.trim() || undefined,
      added_to_balance: data.added_to_balance,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('savings_transactions').insert(newTx);
      await supabase
        .from('savings_books')
        .update({
          current_balance: newBalance,
          total_interest_received: newTotalInterest,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.book_id)
        .eq('user_id', userId);
    } catch {
      // Local fallback
    }

    localStorage.setItem(booksKey, JSON.stringify(books));
    const txs = await this.getSavingsTransactions(userId);
    localStorage.setItem(txsKey, JSON.stringify([newTx, ...txs]));

    return newTx;
  },

  /**
   * Get transactions for user, optionally filtered by bookId
   */
  async getSavingsTransactions(userId: string, bookId?: string): Promise<SavingsTransaction[]> {
    if (!userId) return [];

    try {
      let query = supabase.from('savings_transactions').select('*').eq('user_id', userId);
      if (bookId) {
        query = query.eq('book_id', bookId);
      }
      const { data, error } = await query.order('transaction_date', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as SavingsTransaction[];
      }
    } catch {
      // Local fallback
    }

    const { txsKey } = getStorageKeys(userId);
    const stored = localStorage.getItem(txsKey);
    if (!stored) return [];

    try {
      const txs: SavingsTransaction[] = JSON.parse(stored);
      if (bookId) {
        return txs
          .filter((t) => t.book_id === bookId)
          .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));
      }
      return txs.sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));
    } catch {
      return [];
    }
  },

  /**
   * Get calculated summary statistics for Savings Dashboard Cards
   */
  async getSavingsStats(userId: string): Promise<SavingsStats> {
    const books = await this.getSavingsBooks(userId);
    const txs = await this.getSavingsTransactions(userId);

    // Active books only contribute to totalSavings
    const activeBooks = books.filter((b) => b.status !== 'settled');
    const totalSavings = activeBooks.reduce((sum, b) => sum + (b.current_balance || 0), 0);

    // Total Deposited = sum of all deposit transactions
    let totalDeposited = 0;
    for (const tx of txs) {
      if (tx.type === 'deposit') {
        totalDeposited += tx.amount;
      }
    }
    if (totalDeposited === 0 && books.length > 0) {
      totalDeposited = books.reduce((sum, b) => sum + (b.initial_deposit || 0), 0);
    }

    // Total Withdrawn = sum of all withdrawal transactions
    let totalWithdrawn = 0;
    for (const tx of txs) {
      if (tx.type === 'withdraw' || tx.type === 'settlement') {
        totalWithdrawn += tx.amount;
      }
    }

    // Total Interest Received = sum of all interest transactions
    let totalInterestReceived = 0;
    for (const tx of txs) {
      if (tx.type === 'interest') {
        totalInterestReceived += tx.amount;
      }
    }
    for (const b of books) {
      if (b.settled_interest && !txs.some((t) => t.book_id === b.id && t.type === 'interest')) {
        totalInterestReceived += b.settled_interest;
      }
    }

    return {
      totalSavings,
      totalDeposited,
      totalWithdrawn,
      totalInterestReceived,
      totalBooksCount: activeBooks.length,
      activeBooksCount: activeBooks.length,
    };
  },

  /**
   * Get bank allocation distribution for charts & breakdowns
   */
  async getBankDistribution(userId: string): Promise<BankDistribution[]> {
    const books = await this.getSavingsBooks(userId);
    // Only active books with balance > 0
    const activeBooks = books.filter((b) => b.status !== 'settled' && b.current_balance > 0);
    const totalSavings = activeBooks.reduce((sum, b) => sum + b.current_balance, 0);

    const map = new Map<string, { totalAmount: number; count: number; name: string }>();

    for (const b of activeBooks) {
      const code = b.bank_code || 'OTHER';
      const cur = map.get(code) || { totalAmount: 0, count: 0, name: b.bank_name };
      map.set(code, {
        totalAmount: cur.totalAmount + b.current_balance,
        count: cur.count + 1,
        name: b.bank_name,
      });
    }

    const result: BankDistribution[] = [];
    let idx = 0;
    map.forEach((val, code) => {
      const bankPreset = VIETNAMESE_BANKS.find((b) => b.code === code);
      const color = getDistinctBankColor(code, idx++);
      const pct = totalSavings > 0 ? (val.totalAmount / totalSavings) * 100 : 0;
      result.push({
        bankCode: code,
        bankName: bankPreset?.shortName || val.name,
        color,
        totalAmount: val.totalAmount,
        percentage: Math.round(pct * 10) / 10,
        bookCount: val.count,
      });
    });

    return result.sort((a, b) => b.totalAmount - a.totalAmount);
  },
};
