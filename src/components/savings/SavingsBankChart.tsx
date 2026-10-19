import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { BankDistribution } from '../../types/savings';
import { formatVND } from '../../utils/formatters';
import { DISTINCT_CHART_COLORS, getDistinctBankColor } from '../../constants/banks';
import { Landmark } from 'lucide-react';

interface SavingsBankChartProps {
  distribution: BankDistribution[];
}

export const SavingsBankChart: React.FC<SavingsBankChartProps> = ({ distribution }) => {
  const [hoveredBankCode, setHoveredBankCode] = useState<string | null>(null);

  const totalAmount = useMemo(() => {
    return distribution.reduce((sum, d) => sum + d.totalAmount, 0);
  }, [distribution]);

  // Assign guaranteed distinct, high-contrast colors to each bank in the chart
  const coloredData = useMemo(() => {
    const usedColors = new Set<string>();
    let fallbackIdx = 0;

    return distribution.map((d, index) => {
      let assignedColor = getDistinctBankColor(d.bankCode, index);

      // If this color is already used by another bank in the same chart, pick next unique from DISTINCT_CHART_COLORS
      if (usedColors.has(assignedColor.toLowerCase())) {
        while (fallbackIdx < DISTINCT_CHART_COLORS.length && usedColors.has(DISTINCT_CHART_COLORS[fallbackIdx].toLowerCase())) {
          fallbackIdx++;
        }
        if (fallbackIdx < DISTINCT_CHART_COLORS.length) {
          assignedColor = DISTINCT_CHART_COLORS[fallbackIdx];
          fallbackIdx++;
        }
      }
      usedColors.add(assignedColor.toLowerCase());

      return {
        ...d,
        name: d.bankName,
        value: d.totalAmount,
        color: assignedColor,
        percentage: d.percentage,
        code: d.bankCode,
      };
    });
  }, [distribution]);

  if (distribution.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Landmark size={18} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
              Phân bổ tiết kiệm theo ngân hàng
            </h3>
            <p className="text-xs text-neutral-500">
              Tỷ trọng và số tiền tiết kiệm đang gửi tại từng ngân hàng
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-lg tabular-nums shrink-0">
          {distribution.length} ngân hàng
        </span>
      </div>

      {/* Main Container: Donut Chart on Left, Clear Legend on Right */}
      <div className="flex flex-col lg:flex-row items-center gap-6 pt-2">
        {/* Donut Chart */}
        <div className="w-full sm:w-56 h-52 shrink-0 flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={coloredData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={2.5}
                dataKey="value"
                onMouseEnter={(_, index) => {
                  if (coloredData[index]) {
                    setHoveredBankCode(coloredData[index].code);
                  }
                }}
                onMouseLeave={() => setHoveredBankCode(null)}
              >
                {coloredData.map((entry) => {
                  const isHovered = hoveredBankCode === entry.code;
                  return (
                    <Cell
                      key={`cell-${entry.code}`}
                      fill={entry.color}
                      stroke={isHovered ? '#0f172a' : '#ffffff'}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="transition-all duration-200 cursor-pointer"
                      style={{
                        transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: 'center center',
                      }}
                    />
                  );
                })}
              </Pie>
              <Tooltip
                formatter={(val: any) => [formatVND(Number(val) || 0), 'Số tiền']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  padding: '8px 12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Summary Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              Tổng số dư
            </span>
            <span className="text-xs sm:text-sm font-bold text-neutral-900 tabular-nums truncate max-w-[110px]">
              {totalAmount >= 1000000000
                ? `${(totalAmount / 1000000000).toFixed(2)} tỷ`
                : `${(totalAmount / 1000000).toFixed(0)} tr ₫`}
            </span>
          </div>
        </div>

        {/* Legend beside chart: clear bank name, distinct matching color, passbook count, amount, and percentage */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {coloredData.map((item) => {
            const isHovered = hoveredBankCode === item.code;

            return (
              <div
                key={item.code}
                onMouseEnter={() => setHoveredBankCode(item.code)}
                onMouseLeave={() => setHoveredBankCode(null)}
                className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer space-y-1.5 ${
                  isHovered
                    ? 'border-neutral-400 bg-neutral-100/90 shadow-2xs ring-1 ring-neutral-400/30'
                    : 'border-neutral-200/80 bg-neutral-50/60 hover:bg-neutral-50 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs gap-2">
                  {/* Bank Marker & Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-md shrink-0 shadow-xs"
                      style={{ backgroundColor: item.color }}
                      title={`Màu đại diện: ${item.name}`}
                    />
                    <span className="font-bold text-neutral-900 truncate">
                      {item.bankName}
                    </span>
                    <span className="text-[11px] text-neutral-500 font-medium shrink-0">
                      ({item.bookCount} sổ)
                    </span>
                  </div>

                  {/* Amount and Percentage */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-bold text-neutral-900 tabular-nums">
                      {formatVND(item.totalAmount)}
                    </span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white tabular-nums shrink-0"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar in identical color */}
                <div className="w-full bg-neutral-200/70 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
