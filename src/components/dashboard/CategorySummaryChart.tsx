import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategorySpending } from '../../types/finance';
import { formatVND } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { Tag } from 'lucide-react';

interface CategorySummaryChartProps {
  categories: CategorySpending[];
  totalExpense: number;
}

export const CategorySummaryChart: React.FC<CategorySummaryChartProps> = ({
  categories,
  totalExpense,
}) => {
  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200/80 p-8 text-center shadow-xs flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center mb-3">
          <Tag size={20} />
        </div>
        <h3 className="text-sm font-semibold text-neutral-800">
          Chưa có danh mục chi tiêu
        </h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs">
          Khi bạn ghi nhận các khoản chi, biểu đồ phân bổ danh mục sẽ tự động xuất hiện tại đây.
        </p>
      </div>
    );
  }

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategorySpending;
      return (
        <div className="bg-white border border-neutral-200 rounded-xl p-3 shadow-lg text-xs space-y-1">
          <p className="font-bold text-neutral-900">{data.category}</p>
          <div className="flex items-center justify-between gap-3 text-neutral-700">
            <span>Chi phí:</span>
            <span className="font-bold text-rose-600 tabular-nums">
              {formatVND(data.amount)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-neutral-500">
            <span>Tỷ trọng:</span>
            <span className="font-semibold tabular-nums">{data.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
            Cơ cấu chi tiêu theo danh mục
          </h2>
          <p className="text-xs text-neutral-500">
            Tổng chi: <span className="font-semibold text-rose-600 tabular-nums">{formatVND(totalExpense)}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Donut Chart */}
        <div className="md:col-span-5 h-56 sm:h-64 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                stroke="#FFFFFF"
                strokeWidth={2}
              >
                {categories.map((entry) => (
                  <Cell key={entry.category} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text in donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] text-neutral-400 font-medium">Danh mục</span>
            <span className="text-base font-bold text-neutral-800 tabular-nums">
              {categories.length} nhóm
            </span>
          </div>
        </div>

        {/* Detailed Category List with percentage bars */}
        <div className="md:col-span-7 space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <div key={cat.category} className="group p-2 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <CategoryIcon category={cat.category} size={14} className="p-1.5" />
                  <span className="font-semibold text-neutral-900 truncate">
                    {cat.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-neutral-900 tabular-nums">
                    {formatVND(cat.amount)}
                  </span>
                  <span className="text-[11px] font-medium text-neutral-400 w-10 text-right tabular-nums">
                    {cat.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
