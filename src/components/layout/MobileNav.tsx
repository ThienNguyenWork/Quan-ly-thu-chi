import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  CalendarDays,
  BarChart3,
  Layers,
  Settings,
  X,
  Plus,
  Wallet,
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddExpense: () => void;
  onOpenAddIncome: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  onOpenAddExpense,
  onOpenAddIncome,
}) => {
  const { user } = useAuth();

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
    <>
      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Wallet size={18} />
                </div>
                <span className="font-bold text-neutral-900">Sổ Thu Chi</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-2 border-b border-neutral-100">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddExpense();
                }}
                className="w-full py-2.5 px-3 bg-emerald-600 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <Plus size={15} />
                <span>+ Thêm khoản chi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddIncome();
                }}
                className="w-full py-2 px-3 bg-emerald-50 text-emerald-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <TrendingUp size={14} className="text-emerald-600" />
                <span>+ Thêm thu nhập</span>
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-emerald-400' : 'text-neutral-500'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-neutral-100 text-xs text-neutral-500">
              <p className="font-semibold text-neutral-800 truncate">{user?.full_name}</p>
              <p className="text-[11px] truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Fixed Bar for Rapid Actions */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-neutral-200 z-30 px-3 flex items-center justify-around">
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold ${
            currentTab === 'dashboard' ? 'text-emerald-600' : 'text-neutral-500'
          }`}
        >
          <LayoutDashboard size={18} />
          <span>Tổng quan</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('expenses')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold ${
            currentTab === 'expenses' ? 'text-emerald-600' : 'text-neutral-500'
          }`}
        >
          <Receipt size={18} />
          <span>Chi tiêu</span>
        </button>

        {/* Center Floating Add Button */}
        <button
          type="button"
          onClick={onOpenAddExpense}
          className="-mt-5 w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={22} />
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('monthly')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold ${
            currentTab === 'monthly' ? 'text-emerald-600' : 'text-neutral-500'
          }`}
        >
          <CalendarDays size={18} />
          <span>Theo tháng</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] font-semibold ${
            currentTab === 'settings' ? 'text-emerald-600' : 'text-neutral-500'
          }`}
        >
          <Settings size={18} />
          <span>Cài đặt</span>
        </button>
      </div>
    </>
  );
};
