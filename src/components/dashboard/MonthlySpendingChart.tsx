import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { MonthlyChartPoint } from '../../types/finance';
import { formatVND } from '../../utils/formatters';

interface MonthlySpendingChartProps {
  chartData: MonthlyChartPoint[];
  currentYear: number;
  onYearChange: (year: number) => void;
}

export const MonthlySpendingChart: React.FC<MonthlySpendingChartProps> = ({
  chartData,
  currentYear,
  onYearChange,
}) => {
  const [showIncome, setShowIncome] = useState(true);

  // Available year selector options
  const years = [2024, 2025, 2026, 2027];

  const formatYAxis = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(0)}tr`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(0)}k`;
    }
    return `${val}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const expenseItem = payload.find((p: any) => p.dataKey === 'expense');
      const incomeItem = payload.find((p: any) => p.dataKey === 'income');

      return (
        <div className="bg-white border border-neutral-200 rounded-xl p-3 shadow-lg text-xs space-y-1 min-w-36">
          <p className="font-bold text-neutral-900 border-b border-neutral-100 pb-1">
            {label} / {currentYear}
          </p>
          {expenseItem && (
            <div className="flex items-center justify-between text-rose-600 gap-3">
              <span>Chi tiêu:</span>
              <span className="font-semibold tabular-nums">
                {formatVND(expenseItem.value)}
              </span>
            </div>
          )}
          {incomeItem && (
            <div className="flex items-center justify-between text-emerald-600 gap-3">
              <span>Thu nhập:</span>
              <span className="font-semibold tabular-nums">
                {formatVND(incomeItem.value)}
              </span>
            </div>
          )}
          {expenseItem && incomeItem && (
            <div className="flex items-center justify-between text-neutral-600 pt-1 border-t border-neutral-100 gap-3 font-medium">
              <span>Còn lại:</span>
              <span className="tabular-nums">
                {formatVND(incomeItem.value - expenseItem.value)}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
            Chi tiêu theo từng tháng trong năm {currentYear}
          </h2>
          <p className="text-xs text-neutral-500">
            Biểu đồ đối sánh chi tiêu và thu nhập xuyên suốt 12 tháng
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Thu nhập */}
          <button
            type="button"
            onClick={() => setShowIncome(!showIncome)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer border ${
              showIncome
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-neutral-50 text-neutral-500 border-neutral-200'
            }`}
          >
            {showIncome ? 'Hiển thị thu nhập: Bật' : 'Hiển thị thu nhập: Tắt'}
          </button>

          {/* Year selector segmented buttons */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/60">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => onYearChange(y)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer tabular-nums ${
                  currentYear === y
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="label"
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
            />
            <Bar
              dataKey="expense"
              name="Chi tiêu"
              fill="#F43F5E"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            {showIncome && (
              <Bar
                dataKey="income"
                name="Thu nhập"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
