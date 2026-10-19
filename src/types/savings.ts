export type SavingsTerm = '0' | '1' | '2' | '3' | '6' | '9' | '12' | '18' | '24' | '36';

export type InterestPaymentMethod = 
  | 'end_of_term' // Cuối kỳ
  | 'monthly'     // Định kỳ hàng tháng
  | 'beginning_of_term'; // Đầu kỳ

export type MaturityAction = 
  | 'rollover_all'       // Tự động tái tục cả gốc và lãi
  | 'rollover_principal' // Tái tục gốc
  | 'close';             // Tất toán khi đến hạn

export type SavingsStatus = 
  | 'active'   // Đang gửi
  | 'matured'  // Đã đến hạn
  | 'settled'; // Đã đóng sổ

export interface VietnameseBank {
  code: string;
  shortName: string;
  name: string;
  color: string;
  bgLight: string;
}

export interface SavingsBook {
  id: string;
  user_id: string;
  bank_code: string;
  bank_name: string;
  account_name: string;        // Tên sổ (ví dụ: Quỹ khẩn cấp, Mua xe, Tiết kiệm cá nhân)
  account_number?: string;     // Số tài khoản / Mã sổ tiết kiệm
  initial_deposit: number;     // Số tiền gửi ban đầu
  current_balance: number;     // Số dư hiện tại
  interest_rate?: number;      // Lãi suất hiện tại (%/năm, ví dụ 5.6)
  start_date: string;          // YYYY-MM-DD (Ngày gửi tiền)
  total_interest_received?: number; // Tổng tiền lãi thực tế đã nhận
  note?: string;               // Ghi chú
  
  // Optional / legacy fields preserved for backwards compatibility
  term_months?: number;        // Kỳ hạn (nếu có)
  maturity_date?: string;      // Ngày đáo hạn (nếu có)
  interest_payment_method?: InterestPaymentMethod;
  maturity_action?: MaturityAction;
  status?: SavingsStatus;
  estimated_interest?: number;
  created_at: string;
  updated_at?: string;
  settled_at?: string;
  settled_interest?: number;
}

export type SavingsTransactionType = 'deposit' | 'withdraw' | 'interest' | 'settlement';

export interface SavingsTransaction {
  id: string;
  book_id: string;
  user_id: string;
  type: SavingsTransactionType; // 'deposit' = Gửi tiền, 'withdraw' = Rút tiền, 'interest' = Nhận lãi
  amount: number;
  transaction_date: string; // YYYY-MM-DD
  note?: string;
  added_to_balance?: boolean; // Nếu là 'interest', liệu có cộng vào số dư sổ không
  created_at: string;
}

export interface SavingsStats {
  totalSavings: number;            // Tổng tiền tiết kiệm (số dư hiện tại của tất cả các sổ)
  totalDeposited: number;          // Tổng tiền đã gửi (gốc ban đầu + gửi thêm)
  totalWithdrawn: number;          // Tổng tiền đã rút
  totalInterestReceived: number;   // Tổng lãi đã nhận (thực nhận)
  totalBooksCount: number;         // Tổng số sổ tiết kiệm
  activeBooksCount?: number;
  settledBooksCount?: number;
  totalEstimatedInterest?: number; // Ước tính phụ nếu cần
}

export interface BankDistribution {
  bankCode: string;
  bankName: string;
  color: string;
  totalAmount: number;
  percentage: number;
  bookCount: number;
}
