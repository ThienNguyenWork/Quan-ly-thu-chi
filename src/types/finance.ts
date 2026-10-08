export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 
  | 'Tiền mặt'
  | 'Chuyển khoản'
  | 'Thẻ ngân hàng'
  | 'Ví điện tử'
  | string;

export type IncomeType = 
  | 'Lương'
  | 'Thưởng'
  | 'Freelance'
  | 'Thu nhập khác'
  | string;

// Supabase table models
export interface DbProfile {
  id: string; // references auth.users(id)
  full_name: string;
  currency: string;
  created_at: string;
  updated_at?: string;
}

export interface DbCategory {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  icon: string | null;
  is_default: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DbPaymentMethod {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  is_default: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DbExpense {
  id: string;
  user_id: string;
  category_id: string | null;
  payment_method_id: string | null;
  amount: number;
  description: string;
  note: string | null;
  expense_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at?: string;
  category?: DbCategory | null;
  payment_method?: DbPaymentMethod | null;
}

export interface DbIncome {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  note: string | null;
  income_date: string; // YYYY-MM-DD
  income_type: string;
  created_at: string;
  updated_at?: string;
}

export interface DbBudget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
  updated_at?: string;
}

// Unified Transaction interface for the UI
export interface Transaction {
  id: string;
  user_id: string;
  category_id?: string;
  category: string;
  subcategory?: string;
  amount: number;
  type: TransactionType;
  description: string;
  transaction_date: string; // YYYY-MM-DD
  payment_method_id?: string;
  payment_method: string;
  note?: string;
  created_at: string;
  updated_at?: string;
}

export interface DefaultCategoryGroup {
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
}

export interface ParentCategoryGroup {
  id?: string;
  name: string;
  icon: string;
  color: string;
  subcategories: { id: string; name: string }[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  currency: string;
  created_at: string;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
  icon: string;
}

export interface DailyExpenseGroup {
  date: string; // YYYY-MM-DD
  formattedDate: string; // "Thứ Tư, 08/10/2026"
  totalAmount: number;
  transactions: Transaction[];
}

export interface MonthSummaryStats {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  remainingBalance: number;
  transactionCount: number;
  expenseCount: number;
  incomeCount: number;
}

export interface MonthlyChartPoint {
  month: number;
  label: string;
  income: number;
  expense: number;
  net: number;
}
