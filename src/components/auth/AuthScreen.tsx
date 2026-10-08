import React, { useState } from 'react';
import { 
  Wallet, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { EmailVerificationScreen } from './EmailVerificationScreen';

export const AuthScreen: React.FC = () => {
  const { 
    signIn, 
    signUp, 
    resetPasswordForEmail, 
    updatePassword 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'verify_otp' | 'new_password'>('signin');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearStatus = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearStatus();

    if (!email.trim() || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);

    if (!res.success) {
      if (res.error?.includes('Email not confirmed')) {
        setRegisteredEmail(email.trim());
        setMode('verify_otp');
      } else if (res.error?.includes('Invalid login credentials')) {
        setErrorMsg('Email hoặc mật khẩu không chính xác.');
      } else {
        setErrorMsg(res.error || 'Đăng nhập không thành công.');
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearStatus();

    if (!fullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có độ dài ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setLoading(true);
    const res = await signUp(email, password, fullName);
    setLoading(false);

    if (res.success) {
      setRegisteredEmail(email.trim());
      // Sign out session if auto-logged in, so user stays on the verification screen
      await supabase.auth.signOut();
      setMode('verify_otp');
    } else {
      if (res.error?.includes('already registered') || res.error?.includes('User already registered')) {
        setErrorMsg('Email này đã được đăng ký. Vui lòng đăng nhập hoặc xác thực tài khoản.');
      } else {
        setErrorMsg(res.error || 'Đăng ký tài khoản thất bại.');
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearStatus();

    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email để khôi phục mật khẩu.');
      return;
    }

    setLoading(true);
    const res = await resetPasswordForEmail(email);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư của bạn.');
    } else {
      setErrorMsg(res.error || 'Gửi yêu cầu thất bại.');
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearStatus();

    if (newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    const res = await updatePassword(newPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Đổi mật khẩu thành công! Vui lòng đăng nhập.');
      setMode('signin');
    } else {
      setErrorMsg(res.error || 'Cập nhật mật khẩu thất bại.');
    }
  };

  // If in Verify OTP mode, render the dedicated EmailVerificationScreen
  if (mode === 'verify_otp') {
    return (
      <EmailVerificationScreen
        email={registeredEmail || email}
        onBackToLogin={(em) => {
          if (em) setEmail(em);
          setPassword('');
          clearStatus();
          setMode('signin');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Brand & Header */}
        <div className="p-6 sm:p-8 bg-neutral-950 text-white text-center border-b border-neutral-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-900/30">
            <Wallet size={24} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Sổ Thu Chi Cá Nhân
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
            Hệ thống quản lý tài chính an toàn với xác thực Supabase & Row Level Security
          </p>

          {/* Tab Selector */}
          {(mode === 'signin' || mode === 'signup') && (
            <div className="grid grid-cols-2 bg-neutral-900 p-1 rounded-xl mt-6 border border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  clearStatus();
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  clearStatus();
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Đăng ký mới
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <Check size={16} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form: Sign In */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    autoFocus
                    required
                    placeholder="ban@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-neutral-50/70 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      clearStatus();
                    }}
                    className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-neutral-50/70 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span>Đang đăng nhập...</span>
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form: Sign Up */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Họ và tên
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-neutral-50/70 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    required
                    placeholder="ban@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-neutral-50/70 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Mật khẩu (ít nhất 6 ký tự)
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-neutral-50/70 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Xác nhận lại mật khẩu
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-neutral-50/70 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span>Đang xử lý...</span>
                ) : (
                  <>
                    <span>Đăng ký tài khoản</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form: Forgot Password */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center pb-1">
                <h3 className="text-sm font-bold text-neutral-900">Quên mật khẩu?</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Nhập email tài khoản của bạn để nhận liên kết đặt lại mật khẩu từ Supabase.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Email tài khoản
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    required
                    placeholder="ban@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-neutral-50/70 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  clearStatus();
                }}
                className="w-full py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                ← Quay lại đăng nhập
              </button>
            </form>
          )}

          {/* Form: New Password */}
          {mode === 'new_password' && (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div className="text-center pb-1">
                <h3 className="text-sm font-bold text-neutral-900">Đặt mật khẩu mới</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Nhập mật khẩu mới cho tài khoản của bạn.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-neutral-50/70 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
              </button>
            </form>
          )}

          {/* Security Notice */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Bảo vệ quyền riêng tư qua PostgreSQL Row Level Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};
