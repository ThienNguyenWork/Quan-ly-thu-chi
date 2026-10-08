import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Check, Sparkles, FolderPlus } from 'lucide-react';
import { ParentCategoryGroup } from '../types/finance';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { financeService } from '../services/financeService';
import { useAuth } from '../context/AuthContext';

export const CategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ParentCategoryGroup[]>([]);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [isAddingSubcat, setIsAddingSubcat] = useState(false);

  const [newMainCategoryName, setNewMainCategoryName] = useState('');
  const [isAddingMainCat, setIsAddingMainCat] = useState(false);

  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const loadCategories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const groups = await financeService.getCategoryGroups(user.id);
      setCategories(groups);
      if (groups.length > 0) {
        setSelectedParentId((prev) => (prev ? prev : (groups[0].id || '')));
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategoryName.trim() || !user || !selectedParentId) return;

    try {
      const parent = categories.find((c) => c.id === selectedParentId);
      await financeService.addCustomCategory(user.id, newSubcategoryName.trim(), selectedParentId);
      setSuccessMsg(`Đã thêm danh mục con "${newSubcategoryName.trim()}" vào ${parent?.name || 'danh mục'}`);
      setNewSubcategoryName('');
      setIsAddingSubcat(false);
      await loadCategories();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi thêm danh mục';
      alert(msg);
    }
  };

  const handleAddMainCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMainCategoryName.trim() || !user) return;

    try {
      await financeService.addCustomCategory(user.id, newMainCategoryName.trim(), null);
      setSuccessMsg(`Đã thêm danh mục chính "${newMainCategoryName.trim()}" thành công!`);
      setNewMainCategoryName('');
      setIsAddingMainCat(false);
      await loadCategories();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi thêm danh mục chính';
      alert(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">
            Hệ thống danh mục chi tiêu (Supabase)
          </h2>
          <p className="text-xs text-neutral-500">
            Quản lý các danh mục chi tiêu mặc định và danh mục tùy chỉnh của bạn trên PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsAddingMainCat(!isAddingMainCat);
              setIsAddingSubcat(false);
            }}
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <FolderPlus size={14} />
            <span>+ Thêm danh mục cha</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAddingSubcat(!isAddingSubcat);
              setIsAddingMainCat(false);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>+ Thêm danh mục con</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <Check size={14} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form: Add Main Category */}
      {isAddingMainCat && (
        <form
          onSubmit={handleAddMainCategory}
          className="bg-white rounded-xl border border-emerald-200/80 p-5 shadow-xs space-y-4 animate-in fade-in"
        >
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Tạo danh mục chính mới</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Tên danh mục chính
            </label>
            <input
              type="text"
              required
              placeholder="VD: Nuôi thú cưng, Đầu tư, Kinh doanh..."
              value={newMainCategoryName}
              onChange={(e) => setNewMainCategoryName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingMainCat(false)}
              className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!newMainCategoryName.trim()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
            >
              Lưu danh mục chính
            </button>
          </div>
        </form>
      )}

      {/* Form: Add Subcategory */}
      {isAddingSubcat && (
        <form
          onSubmit={handleAddSubcategory}
          className="bg-white rounded-xl border border-emerald-200/80 p-5 shadow-xs space-y-4 animate-in fade-in"
        >
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Thêm mục chi tiêu con mới</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Chọn danh mục cha
              </label>
              <select
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id || cat.name} value={cat.id || cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Tên danh mục con mới
              </label>
              <input
                type="text"
                required
                placeholder="VD: Trà sữa, Tiền trọ, Rửa xe..."
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingSubcat(false)}
              className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!newSubcategoryName.trim()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
            >
              Lưu danh mục
            </button>
          </div>
        </form>
      )}

      {/* Grid of Categories and Subcategories */}
      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-400">
          Đang tải danh mục từ Supabase...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id || cat.name}
              className="bg-white rounded-xl border border-neutral-200/80 p-5 shadow-xs hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <CategoryIcon category={cat.name} size={18} />
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">{cat.name}</h3>
                    <span className="text-[11px] text-neutral-400">
                      {cat.subcategories.length} danh mục con
                    </span>
                  </div>
                </div>

                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
              </div>

              {/* Subcategories clean list */}
              <div className="flex flex-wrap gap-1.5">
                {cat.subcategories.map((sub) => (
                  <span
                    key={sub.id || sub.name}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-100/80 text-neutral-700 border border-neutral-200/40"
                  >
                    {sub.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
