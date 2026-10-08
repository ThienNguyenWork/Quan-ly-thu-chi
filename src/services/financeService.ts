import { supabase } from '../lib/supabase';
import {
  Transaction,
  CategorySpending,
  DailyExpenseGroup,
  MonthSummaryStats,
  MonthlyChartPoint,
  ParentCategoryGroup,
  DbCategory,
  DbPaymentMethod,
} from '../types/finance';
import { 
  DEFAULT_PARENT_CATEGORIES, 
  CATEGORY_COLORS, 
  CATEGORY_ICONS, 
  MONTH_NAMES_VI 
} from '../constants/categories';
import { formatDateWithDayVI } from '../utils/formatters';

// In-memory Promise lock per user to prevent concurrent initialization race conditions
const userInitLocks = new Map<string, Promise<void>>();

export const financeService = {
  /**
   * Initializes profile, default payment methods, and default categories
   * for a newly registered or first-time user.
   * Safe against multiple simultaneous calls (locks per user) and idempotent.
   */
  async initUserData(userId: string, email: string, fullName: string): Promise<void> {
    if (!userId) return;

    // 1. In-memory lock: if an initialization is already in flight for this user, reuse its promise
    const existingLock = userInitLocks.get(userId);
    if (existingLock) {
      return existingLock;
    }

    const initPromise = (async () => {
      try {
        // 1. Ensure Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (!profile) {
          await supabase.from('profiles').upsert({
            id: userId,
            full_name: fullName || email.split('@')[0] || 'Người dùng',
            currency: 'VND',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        // 2. Ensure Payment Methods (Idempotent per method name)
        const { data: existingPMs } = await supabase
          .from('payment_methods')
          .select('id, name')
          .eq('user_id', userId);

        const existingPMNames = new Set(
          (existingPMs || []).map((pm: any) => (pm.name || '').trim().toLowerCase())
        );

        const defaultMethods = ['Tiền mặt', 'Chuyển khoản', 'Thẻ ngân hàng', 'Ví điện tử'];
        const pmsToInsert = defaultMethods
          .filter((name) => !existingPMNames.has(name.trim().toLowerCase()))
          .map((name) => ({
            user_id: userId,
            name,
            icon: null,
            is_default: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

        if (pmsToInsert.length > 0) {
          await supabase.from('payment_methods').insert(pmsToInsert);
        }

        // 3. Ensure Categories (Strictly Idempotent per parent name and subcategory name)
        // Fetch ALL existing categories for this user
        const { data: existingCats } = await supabase
          .from('categories')
          .select('id, name, parent_id')
          .eq('user_id', userId);

        const existingList = (existingCats || []) as DbCategory[];
        const parentNameToId = new Map<string, string>();
        const existingSubcatSet = new Set<string>(); // key: `${parentId}:${subName.toLowerCase()}`

        for (const c of existingList) {
          const normName = (c.name || '').trim().toLowerCase();
          if (!c.parent_id) {
            if (!parentNameToId.has(normName)) {
              parentNameToId.set(normName, c.id);
            }
          } else {
            existingSubcatSet.add(`${c.parent_id}:${normName}`);
          }
        }

        // Iterate through default categories and only insert what doesn't already exist
        for (const parent of DEFAULT_PARENT_CATEGORIES) {
          const pNormName = parent.name.trim().toLowerCase();
          let parentId = parentNameToId.get(pNormName);

          // If parent category does not exist for this user, insert it
          if (!parentId) {
            const { data: insertedParent, error: pError } = await supabase
              .from('categories')
              .insert({
                user_id: userId,
                name: parent.name.trim(),
                parent_id: null,
                icon: parent.icon,
                is_default: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select('id')
              .single();

            if (!pError && insertedParent && insertedParent.id) {
              const newId = String(insertedParent.id);
              parentId = newId;
              parentNameToId.set(pNormName, newId);
            }
          }

          // If parent exists (or was just created), check subcategories
          if (parentId && parent.subcategories.length > 0) {
            const subcatsToInsert: Array<{
              user_id: string;
              name: string;
              parent_id: string;
              icon: null;
              is_default: boolean;
              created_at: string;
              updated_at: string;
            }> = [];

            for (const subName of parent.subcategories) {
              const subNorm = subName.trim().toLowerCase();
              const subKey = `${parentId}:${subNorm}`;

              if (!existingSubcatSet.has(subKey)) {
                subcatsToInsert.push({
                  user_id: userId,
                  name: subName.trim(),
                  parent_id: parentId,
                  icon: null,
                  is_default: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
                existingSubcatSet.add(subKey); // Track immediately to prevent duplicates within batch
              }
            }

            if (subcatsToInsert.length > 0) {
              await supabase.from('categories').insert(subcatsToInsert);
            }
          }
        }
      } catch (err) {
        console.error('Error in initUserData:', err);
      } finally {
        // Clear lock once complete
        userInitLocks.delete(userId);
      }
    })();

    userInitLocks.set(userId, initPromise);
    return initPromise;
  },

  /**
   * Fetch payment methods from Supabase for the current user.
   * Scoped to user_id (with fallback to system defaults) and defensively deduplicated by name.
   */
  async getPaymentMethods(userId: string): Promise<DbPaymentMethod[]> {
    let list: DbPaymentMethod[] = [];
    const { data: userPMs, error: userErr } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (!userErr && userPMs && userPMs.length > 0) {
      list = userPMs as DbPaymentMethod[];
    } else {
      // Fallback to global defaults if any exist with null user_id
      const { data: sysPMs } = await supabase
        .from('payment_methods')
        .select('*')
        .is('user_id', null)
        .eq('is_default', true)
        .order('created_at', { ascending: true });

      if (sysPMs && sysPMs.length > 0) {
        list = sysPMs as DbPaymentMethod[];
      }
    }

    if (list.length === 0) {
      return [
        { id: 'pm-1', user_id: userId, name: 'Tiền mặt', icon: null, is_default: true, created_at: '' },
        { id: 'pm-2', user_id: userId, name: 'Chuyển khoản', icon: null, is_default: true, created_at: '' },
        { id: 'pm-3', user_id: userId, name: 'Thẻ ngân hàng', icon: null, is_default: true, created_at: '' },
        { id: 'pm-4', user_id: userId, name: 'Ví điện tử', icon: null, is_default: true, created_at: '' },
      ];
    }

    // Defensive deduplication by name
    const seenNames = new Set<string>();
    const uniqueList: DbPaymentMethod[] = [];
    for (const pm of list) {
      const lower = (pm.name || '').trim().toLowerCase();
      if (!seenNames.has(lower)) {
        seenNames.add(lower);
        uniqueList.push(pm);
      }
    }
    return uniqueList;
  },

  /**
   * Fetch categories from Supabase and group into Parent -> Subcategories.
   * Scoped to user_id, preserves system defaults if user has none,
   * and defensively consolidates duplicate parent/subcategory records.
   */
  async getCategoryGroups(userId: string): Promise<ParentCategoryGroup[]> {
    let allCategories: DbCategory[] = [];

    // Prioritize categories belonging to the current user
    const { data: userCats, error: userErr } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (!userErr && userCats && userCats.length > 0) {
      allCategories = userCats as DbCategory[];
    } else {
      // Check for global system default categories (user_id IS NULL)
      const { data: sysCats } = await supabase
        .from('categories')
        .select('*')
        .is('user_id', null)
        .eq('is_default', true)
        .order('created_at', { ascending: true });

      if (sysCats && sysCats.length > 0) {
        allCategories = sysCats as DbCategory[];
      }
    }

    if (allCategories.length === 0) {
      // Fallback to static defaults
      return DEFAULT_PARENT_CATEGORIES.map((p) => ({
        id: p.name,
        name: p.name,
        icon: p.icon,
        color: p.color,
        subcategories: p.subcategories.map((s, idx) => ({ id: `${p.name}-${idx}`, name: s })),
      }));
    }

    const parents = allCategories.filter((c: DbCategory) => !c.parent_id);
    const subcats = allCategories.filter((c: DbCategory) => !!c.parent_id);

    // Defensive consolidation: Group parents by normalized name
    const groupByName = new Map<string, ParentCategoryGroup>();
    const parentNameToIds = new Map<string, Set<string>>();

    for (const p of parents) {
      const normName = (p.name || '').trim();
      const lower = normName.toLowerCase();

      if (!parentNameToIds.has(lower)) {
        parentNameToIds.set(lower, new Set<string>());
      }
      parentNameToIds.get(lower)!.add(p.id);

      if (!groupByName.has(lower)) {
        groupByName.set(lower, {
          id: p.id,
          name: normName,
          icon: p.icon || CATEGORY_ICONS[normName] || 'Tag',
          color: CATEGORY_COLORS[normName] || '#64748B',
          subcategories: [],
        });
      }
    }

    // Attach children to matching parent groups (handling any duplicate parent IDs)
    for (const [lower, group] of groupByName.entries()) {
      const matchingParentIds = parentNameToIds.get(lower) || new Set<string>();
      const children = subcats.filter((s: DbCategory) => s.parent_id && matchingParentIds.has(s.parent_id));

      const seenSubNames = new Set<string>();
      const uniqueSubs: { id: string; name: string }[] = [];

      for (const c of children) {
        const subNorm = (c.name || '').trim();
        const subLower = subNorm.toLowerCase();
        if (!seenSubNames.has(subLower)) {
          seenSubNames.add(subLower);
          uniqueSubs.push({ id: c.id, name: subNorm });
        }
      }

      group.subcategories = uniqueSubs;
    }

    return Array.from(groupByName.values());
  },

  /**
   * Add a custom category or subcategory
   */
  async addCustomCategory(userId: string, name: string, parentId?: string | null): Promise<DbCategory | null> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: name.trim(),
        parent_id: parentId || null,
        icon: null,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      throw new Error(error.message);
    }
    return data as DbCategory;
  },

  /**
   * Get all expenses for a user with category and payment method details
   */
  async getExpenses(
    userId: string,
    filters?: {
      year?: number;
      month?: number;
      search?: string;
      category?: string;
      paymentMethod?: string;
    }
  ): Promise<Transaction[]> {
    let query = supabase
      .from('expenses')
      .select(`
        id,
        user_id,
        category_id,
        payment_method_id,
        amount,
        description,
        note,
        expense_date,
        created_at,
        updated_at,
        category:categories!category_id (
          id,
          name,
          parent_id,
          icon
        ),
        payment_method:payment_methods!payment_method_id (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false });

    // Date range if year / month specified
    if (filters?.year) {
      if (filters.month) {
        const mStr = String(filters.month).padStart(2, '0');
        const startDate = `${filters.year}-${mStr}-01`;
        // Last day of month
        const lastDay = new Date(filters.year, filters.month, 0).getDate();
        const endDate = `${filters.year}-${mStr}-${String(lastDay).padStart(2, '0')}`;
        query = query.gte('expense_date', startDate).lte('expense_date', endDate);
      } else {
        query = query.gte('expense_date', `${filters.year}-01-01`).lte('expense_date', `${filters.year}-12-31`);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }

    // Fetch all parent categories to resolve parent category names for subcategories
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, name, parent_id');
    const catMap = new Map<string, { name: string; parent_id: string | null }>();
    if (allCategories) {
      for (const c of allCategories) {
        catMap.set(c.id, { name: c.name, parent_id: c.parent_id });
      }
    }

    const transactions: Transaction[] = (data || []).map((item: any) => {
      let mainCategory = 'Khác';
      let subCategory: string | undefined = undefined;

      if (item.category) {
        if (item.category.parent_id) {
          // This is a subcategory
          subCategory = item.category.name;
          const parent = catMap.get(item.category.parent_id);
          mainCategory = parent ? parent.name : item.category.name;
        } else {
          mainCategory = item.category.name;
        }
      }

      return {
        id: item.id,
        user_id: item.user_id,
        category_id: item.category_id,
        category: mainCategory,
        subcategory: subCategory,
        amount: Number(item.amount),
        type: 'expense',
        description: item.description,
        transaction_date: item.expense_date,
        payment_method_id: item.payment_method_id,
        payment_method: item.payment_method?.name || 'Tiền mặt',
        note: item.note || undefined,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };
    });

    // Client-side filtering for search, category name, payment method
    let filtered = transactions;
    if (filters?.category && filters.category !== 'all') {
      filtered = filtered.filter((t) => t.category === filters.category);
    }
    if (filters?.paymentMethod && filters.paymentMethod !== 'all') {
      filtered = filtered.filter((t) => t.payment_method === filters.paymentMethod);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          (t.note && t.note.toLowerCase().includes(q)) ||
          (t.subcategory && t.subcategory.toLowerCase().includes(q))
      );
    }

    return filtered;
  },

  /**
   * Create Expense
   */
  async createExpense(
    userId: string,
    data: {
      category_id?: string | null;
      category_name?: string;
      subcategory_name?: string;
      payment_method_id?: string | null;
      payment_method_name?: string;
      amount: number;
      description: string;
      expense_date: string;
      note?: string | null;
    }
  ) {
    let finalCategoryId = data.category_id;
    let finalPaymentMethodId = data.payment_method_id;

    // Resolve or lookup category_id if not provided
    if (!finalCategoryId && data.category_name) {
      // Find subcategory or category with this name belonging to this user
      const targetName = data.subcategory_name || data.category_name;
      let { data: foundCat } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('name', targetName)
        .limit(1)
        .maybeSingle();

      if (!foundCat) {
        // Fallback to global default category if any
        const { data: sysCat } = await supabase
          .from('categories')
          .select('id')
          .is('user_id', null)
          .eq('is_default', true)
          .eq('name', targetName)
          .limit(1)
          .maybeSingle();
        foundCat = sysCat;
      }

      if (foundCat) {
        finalCategoryId = foundCat.id;
      }
    }

    // Resolve payment_method_id if not provided
    if (!finalPaymentMethodId && data.payment_method_name) {
      let { data: foundPM } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('user_id', userId)
        .eq('name', data.payment_method_name)
        .limit(1)
        .maybeSingle();

      if (!foundPM) {
        const { data: sysPM } = await supabase
          .from('payment_methods')
          .select('id')
          .is('user_id', null)
          .eq('is_default', true)
          .eq('name', data.payment_method_name)
          .limit(1)
          .maybeSingle();
        foundPM = sysPM;
      }

      if (foundPM) {
        finalPaymentMethodId = foundPM.id;
      }
    }

    const { data: inserted, error } = await supabase
      .from('expenses')
      .insert({
        user_id: userId,
        category_id: finalCategoryId || null,
        payment_method_id: finalPaymentMethodId || null,
        amount: data.amount,
        description: data.description.trim(),
        expense_date: data.expense_date,
        note: data.note ? data.note.trim() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting expense:', error);
      throw new Error(error.message);
    }
    return inserted;
  },

  /**
   * Update Expense
   */
  async updateExpense(
    userId: string,
    expenseId: string,
    data: {
      category_id?: string | null;
      category_name?: string;
      subcategory_name?: string;
      payment_method_id?: string | null;
      payment_method_name?: string;
      amount: number;
      description: string;
      expense_date: string;
      note?: string | null;
    }
  ) {
    let finalCategoryId = data.category_id;
    let finalPaymentMethodId = data.payment_method_id;

    if (!finalCategoryId && data.category_name) {
      const targetName = data.subcategory_name || data.category_name;
      let { data: foundCat } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('name', targetName)
        .limit(1)
        .maybeSingle();

      if (!foundCat) {
        const { data: sysCat } = await supabase
          .from('categories')
          .select('id')
          .is('user_id', null)
          .eq('is_default', true)
          .eq('name', targetName)
          .limit(1)
          .maybeSingle();
        foundCat = sysCat;
      }

      if (foundCat) finalCategoryId = foundCat.id;
    }

    if (!finalPaymentMethodId && data.payment_method_name) {
      let { data: foundPM } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('user_id', userId)
        .eq('name', data.payment_method_name)
        .limit(1)
        .maybeSingle();

      if (!foundPM) {
        const { data: sysPM } = await supabase
          .from('payment_methods')
          .select('id')
          .is('user_id', null)
          .eq('is_default', true)
          .eq('name', data.payment_method_name)
          .limit(1)
          .maybeSingle();
        foundPM = sysPM;
      }

      if (foundPM) finalPaymentMethodId = foundPM.id;
    }

    const { error } = await supabase
      .from('expenses')
      .update({
        category_id: finalCategoryId || null,
        payment_method_id: finalPaymentMethodId || null,
        amount: data.amount,
        description: data.description.trim(),
        expense_date: data.expense_date,
        note: data.note ? data.note.trim() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', expenseId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating expense:', error);
      throw new Error(error.message);
    }
  },

  /**
   * Delete Expense
   */
  async deleteExpense(userId: string, expenseId: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting expense:', error);
      throw new Error(error.message);
    }
  },

  /**
   * Get all incomes for a user
   */
  async getIncomes(
    userId: string,
    filters?: {
      year?: number;
      month?: number;
      search?: string;
    }
  ): Promise<Transaction[]> {
    let query = supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .order('income_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters?.year) {
      if (filters.month) {
        const mStr = String(filters.month).padStart(2, '0');
        const startDate = `${filters.year}-${mStr}-01`;
        const lastDay = new Date(filters.year, filters.month, 0).getDate();
        const endDate = `${filters.year}-${mStr}-${String(lastDay).padStart(2, '0')}`;
        query = query.gte('income_date', startDate).lte('income_date', endDate);
      } else {
        query = query.gte('income_date', `${filters.year}-01-01`).lte('income_date', `${filters.year}-12-31`);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching incomes:', error);
      return [];
    }

    let list: Transaction[] = (data || []).map((item) => ({
      id: item.id,
      user_id: item.user_id,
      category: 'Thu nhập',
      subcategory: item.income_type || 'Lương',
      amount: Number(item.amount),
      type: 'income',
      description: item.description,
      transaction_date: item.income_date,
      payment_method: 'Chuyển khoản',
      note: item.note || undefined,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          (t.note && t.note.toLowerCase().includes(q)) ||
          (t.subcategory && t.subcategory.toLowerCase().includes(q))
      );
    }

    return list;
  },

  /**
   * Create Income
   */
  async createIncome(
    userId: string,
    data: {
      amount: number;
      description: string;
      income_date: string;
      income_type: string;
      note?: string | null;
    }
  ) {
    const { data: inserted, error } = await supabase
      .from('incomes')
      .insert({
        user_id: userId,
        amount: data.amount,
        description: data.description.trim(),
        income_date: data.income_date,
        income_type: data.income_type,
        note: data.note ? data.note.trim() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting income:', error);
      throw new Error(error.message);
    }
    return inserted;
  },

  /**
   * Update Income
   */
  async updateIncome(
    userId: string,
    incomeId: string,
    data: {
      amount: number;
      description: string;
      income_date: string;
      income_type: string;
      note?: string | null;
    }
  ) {
    const { error } = await supabase
      .from('incomes')
      .update({
        amount: data.amount,
        description: data.description.trim(),
        income_date: data.income_date,
        income_type: data.income_type,
        note: data.note ? data.note.trim() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', incomeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating income:', error);
      throw new Error(error.message);
    }
  },

  /**
   * Delete Income
   */
  async deleteIncome(userId: string, incomeId: string) {
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', incomeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting income:', error);
      throw new Error(error.message);
    }
  },

  /**
   * Get all transactions (expenses + incomes)
   */
  async getAllTransactions(
    userId: string,
    filters?: {
      year?: number;
      month?: number;
      type?: 'expense' | 'income';
      category?: string;
      paymentMethod?: string;
      search?: string;
    }
  ): Promise<Transaction[]> {
    if (filters?.type === 'expense') {
      return this.getExpenses(userId, filters);
    }
    if (filters?.type === 'income') {
      return this.getIncomes(userId, filters);
    }

    const [exp, inc] = await Promise.all([
      this.getExpenses(userId, filters),
      this.getIncomes(userId, filters),
    ]);

    const combined = [...exp, ...inc];
    return combined.sort((a, b) => {
      const cmp = b.transaction_date.localeCompare(a.transaction_date);
      if (cmp !== 0) return cmp;
      return (b.created_at || '').localeCompare(a.created_at || '');
    });
  },

  /**
   * Get month summary statistics
   */
  async getMonthStats(userId: string, month: number, year: number): Promise<MonthSummaryStats> {
    const [expenses, incomes] = await Promise.all([
      this.getExpenses(userId, { year, month }),
      this.getIncomes(userId, { year, month }),
    ]);

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    return {
      month,
      year,
      totalIncome,
      totalExpense,
      remainingBalance: totalIncome - totalExpense,
      transactionCount: expenses.length + incomes.length,
      expenseCount: expenses.length,
      incomeCount: incomes.length,
    };
  },

  /**
   * Get Category Spending breakdown for donut and ranked lists
   */
  async getCategorySpending(userId: string, month: number, year: number): Promise<CategorySpending[]> {
    const expenses = await this.getExpenses(userId, { year, month });
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    const map = new Map<string, { amount: number; count: number }>();
    for (const exp of expenses) {
      const cat = exp.category || 'Khác';
      const cur = map.get(cat) || { amount: 0, count: 0 };
      map.set(cat, {
        amount: cur.amount + exp.amount,
        count: cur.count + 1,
      });
    }

    const result: CategorySpending[] = [];
    map.forEach((val, catName) => {
      const pct = totalExpense > 0 ? (val.amount / totalExpense) * 100 : 0;
      result.push({
        category: catName,
        amount: val.amount,
        percentage: Math.round(pct * 10) / 10,
        count: val.count,
        color: CATEGORY_COLORS[catName] || '#64748B',
        icon: CATEGORY_ICONS[catName] || 'Tag',
      });
    });

    return result.sort((a, b) => b.amount - a.amount);
  },

  /**
   * Get daily expense groups (newest to oldest)
   */
  async getDailyExpenses(userId: string, month: number, year: number): Promise<DailyExpenseGroup[]> {
    const expenses = await this.getExpenses(userId, { year, month });

    const groupsMap = new Map<string, Transaction[]>();
    for (const exp of expenses) {
      const d = exp.transaction_date;
      const arr = groupsMap.get(d) || [];
      arr.push(exp);
      groupsMap.set(d, arr);
    }

    const sortedDates = Array.from(groupsMap.keys()).sort((a, b) => b.localeCompare(a));

    return sortedDates.map((dateStr) => {
      const txs = groupsMap.get(dateStr) || [];
      const totalAmount = txs.reduce((sum, item) => sum + item.amount, 0);
      return {
        date: dateStr,
        formattedDate: formatDateWithDayVI(dateStr),
        totalAmount,
        transactions: txs,
      };
    });
  },

  /**
   * Get 12-month chart data (Jan - Dec) for a given year
   */
  async getYearlyChartData(userId: string, year: number): Promise<MonthlyChartPoint[]> {
    const [expenses, incomes] = await Promise.all([
      this.getExpenses(userId, { year }),
      this.getIncomes(userId, { year }),
    ]);

    const points: MonthlyChartPoint[] = Array.from({ length: 12 }, (_, idx) => ({
      month: idx + 1,
      label: MONTH_NAMES_VI[idx],
      income: 0,
      expense: 0,
      net: 0,
    }));

    for (const exp of expenses) {
      const parts = exp.transaction_date.split('-');
      const m = parseInt(parts[1], 10);
      if (m >= 1 && m <= 12) {
        points[m - 1].expense += exp.amount;
      }
    }

    for (const inc of incomes) {
      const parts = inc.transaction_date.split('-');
      const m = parseInt(parts[1], 10);
      if (m >= 1 && m <= 12) {
        points[m - 1].income += inc.amount;
      }
    }

    return points.map((p) => ({
      ...p,
      net: p.income - p.expense,
    }));
  },
};
