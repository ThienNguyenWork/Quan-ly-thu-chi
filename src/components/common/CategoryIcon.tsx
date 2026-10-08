import React from 'react';
import { 
  UtensilsCrossed, 
  Car, 
  ShoppingBag, 
  Laptop, 
  Plane, 
  Receipt, 
  Landmark, 
  HeartPulse, 
  GraduationCap, 
  HelpCircle,
  TrendingUp,
  Tag,
  LucideIcon
} from 'lucide-react';
import { CATEGORY_COLORS } from '../../constants/categories';

interface CategoryIconProps {
  category: string;
  className?: string;
  size?: number;
  showBg?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  'Ăn uống & vui chơi': UtensilsCrossed,
  'Di chuyển': Car,
  'Mua sắm': ShoppingBag,
  'Thiết bị điện tử': Laptop,
  'Du lịch': Plane,
  'Hóa đơn & sinh hoạt': Receipt,
  'Tài chính': Landmark,
  'Sức khỏe': HeartPulse,
  'Giáo dục': GraduationCap,
  'Khác': HelpCircle,
  'Thu nhập': TrendingUp,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  category, 
  className = '', 
  size = 18,
  showBg = true
}) => {
  const IconComponent = iconMap[category] || Tag;
  const color = CATEGORY_COLORS[category] || '#64748B';

  if (!showBg) {
    return <IconComponent size={size} style={{ color }} className={className} />;
  }

  return (
    <div 
      className={`inline-flex items-center justify-center rounded-lg p-2.5 shrink-0 transition-transform ${className}`}
      style={{ backgroundColor: `${color}18`, color }}
    >
      <IconComponent size={size} strokeWidth={2} />
    </div>
  );
};
