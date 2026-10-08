import React from 'react';
import { Plus, Edit2, Trash2, Calendar, CreditCard } from 'lucide-react';
import { DailyExpenseGroup, Transaction } from '../../types/finance';
import { formatVND } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

interface DailyExpensesProps {
  groups: DailyExpenseGroup[];
  onAddExpense: () => void;
  onEditExpense: (tx: Transaction) => void;
  onDeleteExpense: (txId: string) => void;
}

export const DailyExpenses: React.FC<DailyExpensesProps> = ({
  groups,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200/80 p-10 text-center shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
          <Calendar size={24} />
        </div>
        <h3 className="text-base font-semibold text-neutral-800">
          Chưa có khoản chi nào trong tháng này
        </h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          Bắt đầu ghi chép các khoản chi tiêu hằng ngày để theo dõi ngân sách và dòng tiền của bạn.
        </p>
        <button
          type="button"
          onClick={onAddExpense}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={15} />
          <span>+ Thêm khoản chi</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200/80 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
            Chi tiêu theo ngày
          </h2>
          <p className="text-xs text-neutral-500">
            Danh sách giao dịch sắp xếp từ mới nhất đến cũ nhất
          </p>
        </div>
        <button
          type="button"
          onClick={onAddExpense}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={14} />
          <span>Thêm chi tiêu</span>
        </button>
      </div>

      <div className="divide-y divide-neutral-100">
        {groups.map((group) => (
          <div key={group.date} className="p-4 sm:p-5">
            {/* Date Header Row */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-800">
                  {group.formattedDate}
                </span>
                <span className="text-xs text-neutral-400">
                  ({group.transactions.length} giao dịch)
                </span>
              </div>
              <div className="text-xs font-bold text-rose-600 tabular-nums">
                -{formatVND(group.totalAmount)}
              </div>
            </div>

            {/* List of items on this date */}
            <div className="space-y-1">
              {group.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-neutral-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryIcon category={tx.category} size={16} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-neutral-900 truncate">
                          {tx.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 truncate mt-0.5">
                        <span>{tx.category}</span>
                        {tx.subcategory && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{tx.subcategory}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <CreditCard size={11} className="text-neutral-400" />
                          {tx.payment_method}
                        </span>
                        {tx.note && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="italic truncate max-w-xs">{tx.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Amount and Hover Actions */}
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="text-right">
                      <span className="text-sm font-bold text-rose-600 tabular-nums">
                        -{formatVND(tx.amount)}
                      </span>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditExpense(tx)}
                        title="Chỉnh sửa"
                        className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/70 rounded transition-colors cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteExpense(tx.id)}
                        title="Xóa"
                        className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
