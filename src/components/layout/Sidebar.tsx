import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  CalendarDays,
  BarChart3,
  Layers,
  Settings,
  PlusCircle,
  Database,
  CheckCircle2,
  LogOut,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 
  | 'dashboard'
  | 'expenses'
  | 'income'
  | 'monthly'
  | 'yearly'
  | 'categories'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddExpense,
  onOpenAddIncome,
}) => {
  const { user, signOut } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'expenses', label: 'Chi tiêu', icon: Receipt },
    { id: 'income', label: 'Thu nhập', icon: TrendingUp },
    { id: 'monthly', label: 'Theo tháng', icon: CalendarDays },
    { id: 'yearly', label: 'Theo năm', icon: BarChart3 },
    { id: 'categories', label: 'Danh mục', icon: Layers },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200/80 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Zone */}
      <div className="h-16 flex items-center px-6 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Wallet size={20} />
          </div>
          <div>
            <span className="font-bold text-base text-neutral-900 tracking-tight block leading-tight">
              Sổ Thu Chi
            </span>
            <span className="text-[11px] text-neutral-400 block leading-tight font-medium">
              Quản lý tài chính cá nhân
            </span>
          </div>
        </div>
      </div>

      {/* Quick Add Action CTAs in Sidebar */}
      <div className="p-4 space-y-2 border-b border-neutral-100">
        <button
          type="button"
          onClick={onOpenAddExpense}
          className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <PlusCircle size={15} />
          <span>+ Thêm khoản chi</span>
        </button>
        <button
          type="button"
          onClick={onOpenAddIncome}
          className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-xl border border-emerald-200/60 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <TrendingUp size={14} className="text-emerald-600" />
          <span>+ Thêm thu nhập</span>
        </button>
      </div>

      {/* Primary Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
              }`}
            >
              <Icon
                size={16}
                className={isActive ? 'text-emerald-400' : 'text-neutral-500'}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Database & Account Section at Footer */}
      <div className="p-3 border-t border-neutral-100 bg-neutral-50/50">
        {/* Supabase status indicator */}
        <div className="flex items-center justify-between px-2 py-1 text-[11px] text-neutral-500 mb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <Database size={12} className="text-emerald-600" />
            <span>Supabase PostgreSQL</span>
          </span>
          <span className="inline-flex items-center text-emerald-600 text-[10px] font-semibold">
            <CheckCircle2 size={10} className="mr-0.5" />
            RLS Bật
          </span>
        </div>

        {/* Account Profile Bar */}
        <div className="p-2.5 rounded-xl bg-white border border-neutral-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-neutral-900 truncate">
                {user?.full_name || 'Người dùng'}
              </p>
              <p className="text-[10px] text-neutral-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut()}
            title="Đăng xuất"
            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};
