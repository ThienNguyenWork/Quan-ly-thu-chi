import { VietnameseBank, InterestPaymentMethod, MaturityAction } from '../types/savings';

export const VIETNAMESE_BANKS: VietnameseBank[] = [
  { code: 'VCB', shortName: 'Vietcombank', name: 'Ngân hàng Ngoại Thương Việt Nam', color: '#059669', bgLight: '#E8F5E9' },
  { code: 'TCB', shortName: 'Techcombank', name: 'Ngân hàng Kỹ Thương Việt Nam', color: '#DC2626', bgLight: '#FFEBEE' },
  { code: 'BIDV', shortName: 'BIDV', name: 'Ngân hàng Đầu tư và Phát triển VN', color: '#1D4ED8', bgLight: '#EFF6FF' },
  { code: 'CTG', shortName: 'VietinBank', name: 'Ngân hàng Công Thương Việt Nam', color: '#0284C7', bgLight: '#F0F9FF' },
  { code: 'MB', shortName: 'MBBank', name: 'Ngân hàng Quân Đội', color: '#4F46E5', bgLight: '#EEF2FF' },
  { code: 'ACB', shortName: 'ACB', name: 'Ngân hàng Á Châu', color: '#0891B2', bgLight: '#ECFEFF' },
  { code: 'VPB', shortName: 'VPBank', name: 'Ngân hàng Việt Nam Thịnh Vượng', color: '#16A34A', bgLight: '#F0FDF4' },
  { code: 'TPB', shortName: 'TPBank', name: 'Ngân hàng Tiên Phong', color: '#9333EA', bgLight: '#FAF5FF' },
  { code: 'STB', shortName: 'Sacombank', name: 'Ngân hàng Sài Gòn Thương Tín', color: '#2563EB', bgLight: '#EFF6FF' },
  { code: 'VBA', shortName: 'Agribank', name: 'Ngân hàng Nông nghiệp & PTNT VN', color: '#991B1B', bgLight: '#FEF2F2' },
  { code: 'HDB', shortName: 'HDBank', name: 'Ngân hàng Phát triển TP.HCM', color: '#E11D48', bgLight: '#FFF1F2' },
  { code: 'VIB', shortName: 'VIB', name: 'Ngân hàng Quốc Tế', color: '#D97706', bgLight: '#FFFBEB' },
  { code: 'MSB', shortName: 'MSB', name: 'Ngân hàng Hàng Hải', color: '#EA580C', bgLight: '#FFF7ED' },
  { code: 'SHB', shortName: 'SHB', name: 'Ngân hàng Sài Gòn - Hà Nội', color: '#CA8A04', bgLight: '#FEFCE8' },
  { code: 'OCB', shortName: 'OCB', name: 'Ngân hàng Phương Đông', color: '#10B981', bgLight: '#ECFDF5' },
  { code: 'SEAB', shortName: 'SeABank', name: 'Ngân hàng Đông Nam Á', color: '#BE123C', bgLight: '#FFF1F2' },
  { code: 'LPB', shortName: 'LPBank', name: 'Ngân hàng Lộc Phát Việt Nam', color: '#C026D3', bgLight: '#FDF4FF' },
  { code: 'OTHER', shortName: 'Ngân hàng khác', name: 'Tổ chức tín dụng khác', color: '#64748B', bgLight: '#F8FAFC' },
];

/**
 * Distinct, high-contrast, visually distinguishable color palette for donut chart.
 * Guarantees no two adjacent or displayed banks have identical or indistinguishable colors.
 */
export const DISTINCT_CHART_COLORS = [
  '#059669', // 0: Emerald Green (Vietcombank)
  '#2563EB', // 1: Royal Blue (BIDV / Sacombank)
  '#DC2626', // 2: Crimson Red (Techcombank)
  '#D97706', // 3: Amber Orange (VIB)
  '#7C3AED', // 4: Purple (TPBank)
  '#0891B2', // 5: Cyan / Teal (ACB)
  '#EA580C', // 6: Deep Orange (MSB)
  '#E11D48', // 7: Rose (HDBank)
  '#16A34A', // 8: Fresh Green (VPBank)
  '#4F46E5', // 9: Indigo (MBBank)
  '#0284C7', // 10: Sky Blue (VietinBank)
  '#991B1B', // 11: Dark Maroon (Agribank)
  '#CA8A04', // 12: Mustard Yellow (SHB)
  '#C026D3', // 13: Fuchsia (LPBank)
  '#64748B', // 14: Slate Grey (Other)
];

/**
 * Returns a guaranteed distinct color for a bank code or index in the list.
 */
export function getDistinctBankColor(bankCode: string, fallbackIndex: number = 0): string {
  const bank = VIETNAMESE_BANKS.find((b) => b.code.toUpperCase() === bankCode.toUpperCase());
  if (bank && bank.color) {
    return bank.color;
  }
  return DISTINCT_CHART_COLORS[fallbackIndex % DISTINCT_CHART_COLORS.length];
}

export const SAVINGS_TERMS = [
  { value: 0, label: 'Không kỳ hạn' },
  { value: 1, label: '1 tháng' },
  { value: 2, label: '2 tháng' },
  { value: 3, label: '3 tháng' },
  { value: 6, label: '6 tháng' },
  { value: 9, label: '9 tháng' },
  { value: 12, label: '12 tháng (1 năm)' },
  { value: 18, label: '18 tháng' },
  { value: 24, label: '24 tháng (2 năm)' },
  { value: 36, label: '36 tháng (3 năm)' },
];

export const INTEREST_PAYMENT_METHODS: { value: InterestPaymentMethod; label: string; desc: string }[] = [
  { value: 'end_of_term', label: 'Cuối kỳ', desc: 'Nhận toàn bộ tiền lãi khi sổ đáo hạn' },
  { value: 'monthly', label: 'Định kỳ hàng tháng', desc: 'Tiền lãi được nhận vào tài khoản mỗi tháng' },
  { value: 'beginning_of_term', label: 'Đầu kỳ (Trả trước)', desc: 'Nhận tiền lãi ngay khi mở sổ' },
];

export const MATURITY_ACTIONS: { value: MaturityAction; label: string; desc: string }[] = [
  { value: 'rollover_all', label: 'Tự động tái tục Gốc + Lãi', desc: 'Nhập lãi vào gốc và tự động gửi kỳ tiếp theo' },
  { value: 'rollover_principal', label: 'Tự động tái tục Gốc', desc: 'Chỉ quay vòng tiền gốc, lãi chuyển về tài khoản' },
  { value: 'close', label: 'Tất toán khi đáo hạn', desc: 'Tất toán toàn bộ gốc và lãi về tài khoản' },
];

export function calculateMaturityDate(startDateStr: string, termMonths: number): string {
  if (termMonths <= 0) return startDateStr;
  const date = new Date(startDateStr);
  date.setMonth(date.getMonth() + termMonths);
  return date.toISOString().split('T')[0];
}

export function calculateEstimatedInterest(
  principal: number,
  annualRatePct: number,
  termMonths: number
): number {
  if (principal <= 0 || annualRatePct <= 0) return 0;
  if (termMonths <= 0) {
    return Math.round((principal * (annualRatePct / 100)) / 12);
  }
  return Math.round(principal * (annualRatePct / 100) * (termMonths / 12));
}

export function getDaysUntilMaturity(maturityDateStr?: string): number {
  if (!maturityDateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(maturityDateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
