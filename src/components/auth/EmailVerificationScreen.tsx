import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RotateCcw, 
  ArrowLeft,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface EmailVerificationScreenProps {
  email: string;
  onBackToLogin: (email?: string) => void;
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  email,
  onBackToLogin,
}) => {
  const { verifyOtp, resendConfirmationEmail } = useAuth();

  // 6 digits state
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Verification status
  const [loading, setLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [resendSuccessMessage, setResendSuccessMessage] = useState<string>('');

  // Countdown for resend OTP (60s)
  const [countdown, setCountdown] = useState<number>(60);
  const [resending, setResending] = useState<boolean>(false);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !isSuccess) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, isSuccess]);

  // Focus first input on mount
  useEffect(() => {
    if (!isSuccess && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isSuccess]);

  const otpCode = digits.join('');

  // Format user-friendly error messages as required
  const getFriendlyError = (rawError: string): string => {
    const lower = rawError.toLowerCase();
    if (lower.includes('expired')) {
      return 'Mã xác nhận đã hết hạn. Vui lòng gửi lại mã.';
    }
    return 'Mã xác nhận không đúng. Vui lòng kiểm tra lại.';
  };

  const getFriendlyResendError = (rawError: string): string => {
    const lower = rawError.toLowerCase();
    if (lower.includes('rate limit') || lower.includes('too many') || lower.includes('over_email_send_rate_limit')) {
      return 'Bạn đã yêu cầu gửi mã quá nhiều lần. Vui lòng chờ một lúc rồi thử lại.';
    }
    return 'Không thể gửi lại mã lúc này. Vui lòng thử lại sau ít phút.';
  };

  // Perform OTP verification using type: 'email'
  const handleVerify = async (codeToVerify?: string) => {
    const token = codeToVerify || otpCode;
    if (token.length !== 6 || loading || isSuccess) return;

    setLoading(true);
    setErrorMessage('');
    setResendSuccessMessage('');

    try {
      const res = await verifyOtp(email, token);

      if (res.success) {
        // Sign out session if auto-created so user sees the verified success screen
        // and manually clicks "[ Đăng nhập ]"
        await supabase.auth.signOut();
        setIsSuccess(true);
      } else {
        setErrorMessage(getFriendlyError(res.error || ''));
        setDigits(['', '', '', '', '', '']);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch {
      setErrorMessage('Mã xác nhận không đúng. Vui lòng kiểm tra lại.');
      setDigits(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle single digit change
  const handleChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      setDigits(nextDigits);
      return;
    }

    const digit = cleaned[cleaned.length - 1]; // Take last char if multiple
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    setDigits(nextDigits);
    setErrorMessage('');

    // Advance to next input box
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all 6 digits entered
    const fullCode = nextDigits.join('');
    if (fullCode.length === 6) {
      handleVerify(fullCode);
    }
  };

  // Handle Key Down (backspace, arrow navigation)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        const nextDigits = [...digits];
        nextDigits[index - 1] = '';
        setDigits(nextDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const nextDigits = [...digits];
        nextDigits[index] = '';
        setDigits(nextDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Paste event (pasting 6 numbers)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const nextDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      nextDigits[i] = pasted[i];
    }
    setDigits(nextDigits);
    setErrorMessage('');

    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();

    if (pasted.length === 6) {
      handleVerify(pasted);
    }
  };

  // Handle Resend OTP
  const handleResend = async () => {
    if (countdown > 0 || resending || isSuccess) return;

    setResending(true);
    setErrorMessage('');
    setResendSuccessMessage('');

    try {
      const res = await resendConfirmationEmail(email);
      if (res.success) {
        setResendSuccessMessage('Đã gửi mã xác nhận mới. Vui lòng kiểm tra hộp thư của bạn.');
        setCountdown(60);
      } else {
        setErrorMessage(getFriendlyResendError(res.error || ''));
      }
    } catch {
      setErrorMessage('Không thể gửi lại mã lúc này. Vui lòng thử lại sau ít phút.');
    } finally {
      setResending(false);
    }
  };

  // ========================================================
  // SUCCESS STATE SCREEN
  // ========================================================
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-white">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-8 sm:p-10 text-center space-y-6">
            {/* Green Check Icon */}
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-100 shadow-sm animate-in zoom-in-75 duration-300">
              <CheckCircle2 size={44} strokeWidth={2.5} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Xác thực tài khoản thành công!
              </h2>
              <p className="text-sm font-medium text-emerald-700">
                Email của bạn đã được xác thực thành công.
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/70 text-xs text-neutral-600 space-y-1">
              <p className="font-semibold text-neutral-800">
                Chào mừng bạn đến với
              </p>
              <p className="text-sm font-bold text-neutral-900">
                Sổ Thu Chi Cá Nhân
              </p>
              <p className="text-[11px] text-neutral-400 pt-1">
                Tài khoản ({email}) đã sẵn sàng để ghi chép và quản lý dòng tiền.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onBackToLogin(email)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Đăng nhập</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // OTP INPUT FORM SCREEN
  // ========================================================
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Brand & Header Section */}
        <div className="p-6 sm:p-8 bg-neutral-950 text-white text-center border-b border-neutral-800">
          {/* Financial Icon */}
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-900/30">
            <Wallet size={24} />
          </div>

          {/* Title as requested */}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Chào mừng bạn đến với Sổ Thu Chi Cá Nhân
          </h1>

          {/* Subtitle as requested */}
          <p className="text-xs text-neutral-400 mt-2">
            Chúng tôi đã gửi mã xác nhận đến
          </p>

          {/* Dynamic User Email Banner */}
          <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-emerald-400 font-semibold text-xs tracking-wide break-all max-w-full">
            <Mail size={13} className="shrink-0 text-emerald-500" />
            <span className="truncate">{email}</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span className="whitespace-pre-line leading-relaxed font-medium">
                {errorMessage}
              </span>
            </div>
          )}

          {/* Resend Success Notice */}
          {resendSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <span className="whitespace-pre-line leading-relaxed font-medium">
                {resendSuccessMessage}
              </span>
            </div>
          )}

          {/* 6-Digit OTP Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="space-y-6"
          >
            <div>
              {/* Main Heading as requested */}
              <label className="block text-center text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-3">
                Mã xác nhận của bạn
              </label>

              {/* 6 Individual Input Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    disabled={loading}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border tabular-nums transition-all outline-none ${
                      digit
                        ? 'border-emerald-600 bg-emerald-50/40 text-neutral-900 shadow-xs'
                        : 'border-neutral-200 bg-neutral-50/70 text-neutral-900 hover:border-neutral-300'
                    } focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50`}
                  />
                ))}
              </div>
            </div>

            {/* Primary Action Button: "Xác nhận tài khoản" */}
            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <span>Xác nhận tài khoản</span>
              )}
            </button>
          </form>

          {/* Resend Section with Countdown: "Bạn chưa nhận được mã? Gửi lại mã" */}
          <div className="pt-2 border-t border-neutral-100 text-center space-y-1.5">
            <div className="text-xs text-neutral-500 flex items-center justify-center gap-1.5 flex-wrap">
              <span>Bạn chưa nhận được mã?</span>
              {countdown > 0 ? (
                <span className="font-semibold text-neutral-400 tabular-nums">
                  Gửi lại mã sau {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw size={12} className={resending ? 'animate-spin' : ''} />
                  <span>{resending ? 'Đang gửi...' : 'Gửi lại mã'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Financial Motto & Back to Login */}
          <div className="pt-4 border-t border-neutral-100 text-center space-y-3">
            <p className="text-[11px] text-neutral-400 leading-relaxed italic max-w-xs mx-auto">
              Chúc bạn có trải nghiệm quản lý tài chính thật đơn giản và hiệu quả với Sổ Thu Chi Cá Nhân.
            </p>

            <button
              type="button"
              onClick={() => onBackToLogin(email)}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Quay lại đăng nhập</span>
            </button>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400 pt-1">
            <ShieldCheck size={12} className="text-emerald-600" />
            <span>Xác thực an toàn qua Supabase Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
