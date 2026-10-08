/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { IncomePage } from './pages/IncomePage';
import { MonthlyViewPage } from './pages/MonthlyViewPage';
import { YearlyViewPage } from './pages/YearlyViewPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SettingsPage } from './pages/SettingsPage';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { IncomeModal } from './components/modals/IncomeModal';
import { Transaction } from './types/finance';
import { financeService } from './services/financeService';
import { getCurrentMonthYear } from './utils/formatters';
import { Check, X, Loader2, Wallet } from 'lucide-react';

function MainApp() {
  const { user, loading } = useAuth();
  const currentContext = getCurrentMonthYear();

  // Tab & Date state
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<number>(currentContext.month);
  const [selectedYear, setSelectedYear] = useState<number>(currentContext.year);

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Transaction | null>(null);

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Transaction | null>(null);

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Handlers for Expense
  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (tx: Transaction) => {
    setEditingExpense(tx);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async (data: {
    category_id?: string | null;
    category: string;
    subcategory?: string;
    amount: number;
    transaction_date: string;
    payment_method_id?: string | null;
    payment_method: string;
    description: string;
    note?: string;
  }) => {
    if (!user) return;
    if (editingExpense) {
      await financeService.updateExpense(user.id, editingExpense.id, {
        category_id: data.category_id,
        category_name: data.category,
        subcategory_name: data.subcategory,
        payment_method_id: data.payment_method_id,
        payment_method_name: data.payment_method,
        amount: data.amount,
        description: data.description,
        expense_date: data.transaction_date,
        note: data.note,
      });
      showToast('Đã cập nhật khoản chi tiêu trong Supabase');
    } else {
      await financeService.createExpense(user.id, {
        category_id: data.category_id,
        category_name: data.category,
        subcategory_name: data.subcategory,
        payment_method_id: data.payment_method_id,
        payment_method_name: data.payment_method,
        amount: data.amount,
        description: data.description,
        expense_date: data.transaction_date,
        note: data.note,
      });
      showToast('Đã thêm khoản chi tiêu vào Supabase');
    }
    triggerRefresh();
  };

  // Handlers for Income
  const handleOpenAddIncome = () => {
    setEditingIncome(null);
    setIsIncomeModalOpen(true);
  };

  const handleEditIncome = (tx: Transaction) => {
    setEditingIncome(tx);
    setIsIncomeModalOpen(true);
  };

  const handleSaveIncome = async (data: {
    amount: number;
    transaction_date: string;
    income_type: string;
    description: string;
    note?: string;
  }) => {
    if (!user) return;
    if (editingIncome) {
      await financeService.updateIncome(user.id, editingIncome.id, {
        amount: data.amount,
        description: data.description,
        income_date: data.transaction_date,
        income_type: data.income_type,
        note: data.note,
      });
      showToast('Đã cập nhật khoản thu nhập trong Supabase');
    } else {
      await financeService.createIncome(user.id, {
        amount: data.amount,
        description: data.description,
        income_date: data.transaction_date,
        income_type: data.income_type,
        note: data.note,
      });
      showToast('Đã thêm khoản thu nhập vào Supabase');
    }
    triggerRefresh();
  };

  // If loading auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center mb-4 shadow-lg animate-pulse">
          <Wallet size={24} />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
          <Loader2 size={16} className="animate-spin text-emerald-400" />
          <span>Đang kết nối phiên đăng nhập Supabase...</span>
        </div>
      </div>
    );
  }

  // If unauthenticated: protect the application
  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-neutral-100/60 flex flex-col lg:flex-row text-neutral-900">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-neutral-400 hover:text-white"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenAddExpense={handleOpenAddExpense}
          onOpenAddIncome={handleOpenAddIncome}
        />
      </div>

      {/* Mobile Drawer & Bottom Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddExpense={handleOpenAddExpense}
        onOpenAddIncome={handleOpenAddIncome}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header
          currentTab={currentTab}
          month={selectedMonth}
          year={selectedYear}
          onMonthYearChange={(m, y) => {
            setSelectedMonth(m);
            setSelectedYear(y);
          }}
          onOpenAddExpense={handleOpenAddExpense}
          onOpenAddIncome={handleOpenAddIncome}
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardPage
              month={selectedMonth}
              year={selectedYear}
              onOpenAddExpense={handleOpenAddExpense}
              onOpenAddIncome={handleOpenAddIncome}
              onEditExpense={handleEditExpense}
              refreshTrigger={refreshTrigger}
              onRefreshNeeded={triggerRefresh}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesPage
              onOpenAddExpense={handleOpenAddExpense}
              onEditExpense={handleEditExpense}
              refreshTrigger={refreshTrigger}
              onRefreshNeeded={triggerRefresh}
            />
          )}

          {currentTab === 'income' && (
            <IncomePage
              onOpenAddIncome={handleOpenAddIncome}
              onEditIncome={handleEditIncome}
              refreshTrigger={refreshTrigger}
              onRefreshNeeded={triggerRefresh}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          )}

          {currentTab === 'monthly' && (
            <MonthlyViewPage
              initialMonth={selectedMonth}
              initialYear={selectedYear}
              refreshTrigger={refreshTrigger}
              onOpenAddExpense={handleOpenAddExpense}
              onOpenAddIncome={handleOpenAddIncome}
              onEditExpense={handleEditExpense}
            />
          )}

          {currentTab === 'yearly' && (
            <YearlyViewPage
              initialYear={selectedYear}
              refreshTrigger={refreshTrigger}
            />
          )}

          {currentTab === 'categories' && <CategoriesPage />}

          {currentTab === 'settings' && (
            <SettingsPage onRefreshNeeded={triggerRefresh} />
          )}
        </main>
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        initialData={editingExpense}
      />

      {/* Income Modal */}
      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => {
          setIsIncomeModalOpen(false);
          setEditingIncome(null);
        }}
        onSave={handleSaveIncome}
        initialData={editingIncome}
        defaultMonth={selectedMonth}
        defaultYear={selectedYear}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
