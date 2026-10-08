import React, { useState } from 'react';
import { 
  Database, 
  User, 
  Lock, 
  Check, 
  ShieldCheck, 
  LogOut,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC<{ onRefreshNeeded: () => void }> = () => {
  const { user, signOut, updatePassword, refreshSession } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ success: boolean; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fullName.trim()) return;

    setSavingProfile(true);
    setProfileMsg('');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        setProfileMsg(`Lỗi: ${error.message}`);
      } else {
        setProfileMsg('Cập nhật thông tin thành công!');
        await refreshSession();
        setTimeout(() => setProfileMsg(''), 3000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật';
      setProfileMsg(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ success: false, text: 'Mật khẩu phải có độ dài ít nhất 6 ký tự.' });
      return;
    }

    setSavingPassword(true);
    setPasswordMsg(null);
    const res = await updatePassword(newPassword);
    setSavingPassword(false);

    if (res.success) {
      setPasswordMsg({ success: true, text: 'Đổi mật khẩu thành công!' });
      setNewPassword('');
      setTimeout(() => setPasswordMsg(null), 3500);
    } else {
      setPasswordMsg({ success: false, text: res.error || 'Đổi mật khẩu thất bại.' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Account Profile */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Thông tin tài khoản cá nhân
              </h3>
              <p className="text-xs text-neutral-500">
                Quản lý tên hiển thị và định danh người dùng
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
            Đang đăng nhập
          </span>
        </div>

        {profileMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <Check size={14} className="text-emerald-600 shrink-0" />
            <span>{profileMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Địa chỉ Email (Định danh)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-xs bg-neutral-100 text-neutral-500 border border-neutral-200 rounded-lg cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Đơn vị tiền tệ
              </label>
              <input
                type="text"
                disabled
                value="Việt Nam Đồng (VND - ₫)"
                className="w-full px-3 py-2 text-xs bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-lg cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Mã người dùng (User ID)
              </label>
              <input
                type="text"
                disabled
                value={user?.id || ''}
                className="w-full px-3 py-2 text-xs bg-neutral-100 font-mono text-neutral-500 border border-neutral-200 rounded-lg cursor-not-allowed truncate"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingProfile ? 'Đang lưu...' : 'Cập nhật họ tên'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Security & Change Password */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
            <Lock size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Đổi mật khẩu tài khoản
            </h3>
            <p className="text-xs text-neutral-500">
              Cập nhật mật khẩu bảo vệ tài khoản Supabase của bạn
            </p>
          </div>
        </div>

        {passwordMsg && (
          <div className={`p-3 text-xs rounded-xl flex items-center gap-2 ${
            passwordMsg.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Mật khẩu mới (ít nhất 6 ký tự)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword || !newPassword}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {savingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>

      {/* 3. Supabase & Database Architecture Info */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Cơ sở dữ liệu Supabase PostgreSQL
              </h3>
              <p className="text-xs text-neutral-500">
                Dữ liệu được bảo vệ bằng chính sách Row Level Security (RLS)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            <ShieldCheck size={14} />
            <span>RLS Đang kích hoạt</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <span className="text-neutral-400 block text-[11px]">Bảng người dùng</span>
            <span className="font-semibold text-neutral-800 font-mono">public.profiles</span>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <span className="text-neutral-400 block text-[11px]">Bảng chi tiêu</span>
            <span className="font-semibold text-neutral-800 font-mono">public.expenses</span>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <span className="text-neutral-400 block text-[11px]">Bảng thu nhập</span>
            <span className="font-semibold text-neutral-800 font-mono">public.incomes</span>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <span className="text-neutral-400 block text-[11px]">Bảng danh mục</span>
            <span className="font-semibold text-neutral-800 font-mono">public.categories</span>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <span className="text-neutral-400 block text-[11px]">Phương thức thanh toán</span>
            <span className="font-semibold text-neutral-800 font-mono">public.payment_methods</span>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <span className="text-neutral-400 block text-[11px]">Bảng ngân sách</span>
            <span className="font-semibold text-neutral-800 font-mono">public.budgets</span>
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            Mỗi người dùng chỉ có quyền đọc và ghi dữ liệu của chính mình thông qua quy tắc RLS (<code>auth.uid() = user_id</code>).
          </p>

          <button
            type="button"
            onClick={() => signOut()}
            className="px-4 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <LogOut size={14} />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </div>
    </div>
  );
};
