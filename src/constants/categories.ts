import { DefaultCategoryGroup, PaymentMethod, IncomeType } from '../types/finance';

export const DEFAULT_PARENT_CATEGORIES: DefaultCategoryGroup[] = [
  {
    name: 'Ăn uống & vui chơi',
    icon: 'UtensilsCrossed',
    color: '#F97316', // Orange
    subcategories: [
      'Ăn uống',
      'Cà phê',
      'Ăn vặt',
      'Nhà hàng',
      'Đi chơi',
      'Giải trí',
      'Phim',
      'Game',
    ],
  },
  {
    name: 'Di chuyển',
    icon: 'Car',
    color: '#0284C7', // Sky Blue
    subcategories: [
      'Xăng xe',
      'Gửi xe',
      'Taxi',
      'Grab',
      'Bảo dưỡng xe',
      'Sửa xe',
      'Phí cầu đường',
    ],
  },
  {
    name: 'Mua sắm',
    icon: 'ShoppingBag',
    color: '#EC4899', // Pink
    subcategories: [
      'Quần áo',
      'Giày dép',
      'Mỹ phẩm',
      'Đồ gia dụng',
      'Đồ cá nhân',
      'Quà tặng',
    ],
  },
  {
    name: 'Thiết bị điện tử',
    icon: 'Laptop',
    color: '#8B5CF6', // Purple
    subcategories: [
      'Điện thoại',
      'Máy tính',
      'Linh kiện PC',
      'Phụ kiện',
      'Thiết bị gaming',
      'Phần mềm',
      'Thiết bị điện tử khác',
    ],
  },
  {
    name: 'Du lịch',
    icon: 'Plane',
    color: '#06B6D4', // Cyan
    subcategories: [
      'Vé máy bay',
      'Khách sạn',
      'Ăn uống khi du lịch',
      'Di chuyển khi du lịch',
      'Vé tham quan',
      'Chi phí du lịch khác',
    ],
  },
  {
    name: 'Hóa đơn & sinh hoạt',
    icon: 'Receipt',
    color: '#EAB308', // Amber/Yellow
    subcategories: [
      'Tiền điện',
      'Tiền nước',
      'Internet',
      'Điện thoại',
      'Tiền nhà',
      'Phí dịch vụ',
    ],
  },
  {
    name: 'Tài chính',
    icon: 'Landmark',
    color: '#EF4444', // Red
    subcategories: [
      'Trả nợ',
      'Cho vay',
      'Phí ngân hàng',
      'Thanh toán thẻ',
      'Khoản tài chính khác',
    ],
  },
  {
    name: 'Sức khỏe',
    icon: 'HeartPulse',
    color: '#10B981', // Emerald
    subcategories: [
      'Khám bệnh',
      'Thuốc',
      'Bảo hiểm',
      'Chăm sóc sức khỏe',
    ],
  },
  {
    name: 'Giáo dục',
    icon: 'GraduationCap',
    color: '#3B82F6', // Blue
    subcategories: [
      'Học phí',
      'Khóa học',
      'Sách',
      'Tài liệu',
    ],
  },
  {
    name: 'Khác',
    icon: 'HelpCircle',
    color: '#64748B', // Slate
    subcategories: [
      'Chi tiêu khác',
    ],
  },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Tiền mặt',
  'Chuyển khoản',
  'Thẻ ngân hàng',
  'Ví điện tử',
  'Khác',
];

export const INCOME_TYPES: IncomeType[] = [
  'Lương',
  'Thưởng',
  'Freelance',
  'Thu nhập khác',
];

export const MONTH_NAMES_VI = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Ăn uống & vui chơi': '#F97316',
  'Di chuyển': '#0284C7',
  'Mua sắm': '#EC4899',
  'Thiết bị điện tử': '#8B5CF6',
  'Du lịch': '#06B6D4',
  'Hóa đơn & sinh hoạt': '#EAB308',
  'Tài chính': '#EF4444',
  'Sức khỏe': '#10B981',
  'Giáo dục': '#3B82F6',
  'Khác': '#64748B',
};

export const CATEGORY_ICONS: Record<string, string> = {
  'Ăn uống & vui chơi': 'UtensilsCrossed',
  'Di chuyển': 'Car',
  'Mua sắm': 'ShoppingBag',
  'Thiết bị điện tử': 'Laptop',
  'Du lịch': 'Plane',
  'Hóa đơn & sinh hoạt': 'Receipt',
  'Tài chính': 'Landmark',
  'Sức khỏe': 'HeartPulse',
  'Giáo dục': 'GraduationCap',
  'Khác': 'HelpCircle',
};
