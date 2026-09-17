import React, { useState, useMemo } from 'react';
import {
    Plus,
    Trash2,
    Sparkles,
    Check,
    ShoppingBag,
    Filter,
    Tag,
    Tags,
    LayoutGrid,
    List,
    X,
    FolderPlus,
} from 'lucide-react';
import { ShoppingItem, ShoppingCategoryItem } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ShoppingListProps {
    items: ShoppingItem[];
    onToggleItem: (id: string) => void;
    onAddItem: (item: Omit<ShoppingItem, 'id' | 'createdAt'>) => void;
    onDeleteItem: (id: string) => void;
    onClearPurchased: () => void;
}

export const DEFAULT_SHOPPING_CATEGORIES: ShoppingCategoryItem[] = [
    { id: 'groceries', name: 'Продукты', icon: '🥗', color: 'emerald', isDefault: true },
    { id: 'pharmacy', name: 'Аптека', icon: '💊', color: 'indigo', isDefault: true },
    { id: 'household', name: 'Хозтовары', icon: '🧹', color: 'amber', isDefault: true },
    { id: 'diabetes_supplies', name: 'Диа-товары', icon: '🩺', color: 'sky', isDefault: true },
    { id: 'hypo_fast_carbs', name: 'Для гипо', icon: '⚡', color: 'orange', isDefault: true },
    { id: 'other', name: 'Прочее', icon: '🛒', color: 'slate', isDefault: true },
];

const COLOR_MAP: Record<string, { badge: string; border: string; bgLight: string; text: string; dot: string }> = {
    emerald: {
        badge: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80',
        border: 'border-emerald-200/80 dark:border-emerald-800/60',
        bgLight: 'bg-emerald-50/70 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        dot: 'bg-emerald-500',
    },
    indigo: {
        badge: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/80',
        border: 'border-indigo-200/80 dark:border-indigo-800/60',
        bgLight: 'bg-indigo-50/70 dark:bg-indigo-950/30',
        text: 'text-indigo-700 dark:text-indigo-300',
        dot: 'bg-indigo-500',
    },
    amber: {
        badge: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80',
        border: 'border-amber-200/80 dark:border-amber-800/60',
        bgLight: 'bg-amber-50/70 dark:bg-amber-950/30',
        text: 'text-amber-700 dark:text-amber-300',
        dot: 'bg-amber-500',
    },
    sky: {
        badge: 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/80',
        border: 'border-sky-200/80 dark:border-sky-800/60',
        bgLight: 'bg-sky-50/70 dark:bg-sky-950/30',
        text: 'text-sky-700 dark:text-sky-300',
        dot: 'bg-sky-500',
    },
    orange: {
        badge: 'bg-orange-100 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border-orange-200/80 dark:border-orange-800/80',
        border: 'border-orange-200/80 dark:border-orange-800/60',
        bgLight: 'bg-orange-50/70 dark:bg-orange-950/30',
        text: 'text-orange-700 dark:text-orange-300',
        dot: 'bg-orange-500',
    },
    purple: {
        badge: 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/80',
        border: 'border-purple-200/80 dark:border-purple-800/60',
        bgLight: 'bg-purple-50/70 dark:bg-purple-950/30',
        text: 'text-purple-700 dark:text-purple-300',
        dot: 'bg-purple-500',
    },
    rose: {
        badge: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/80',
        border: 'border-rose-200/80 dark:border-rose-800/60',
        bgLight: 'bg-rose-50/70 dark:bg-rose-950/30',
        text: 'text-rose-700 dark:text-rose-300',
        dot: 'bg-rose-500',
    },
    slate: {
        badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        border: 'border-slate-200 dark:border-slate-700',
        bgLight: 'bg-slate-50/70 dark:bg-slate-800/30',
        text: 'text-slate-700 dark:text-slate-300',
        dot: 'bg-slate-500',
    },
};

const EMOJI_OPTIONS = ['🥗', '💊', '🧹', '🛒', '🩺', '⚡', '🧴', '🧼', '🍎', '🍞', '📦', '🏠', '👕', '🚗', '🐾', '🔧'];
const COLOR_OPTIONS = [
    { id: 'emerald', label: 'Изумрудный', class: 'bg-emerald-500' },
    { id: 'indigo', label: 'Индиго', class: 'bg-indigo-500' },
    { id: 'amber', label: 'Янтарный', class: 'bg-amber-500' },
    { id: 'sky', label: 'Небесный', class: 'bg-sky-500' },
    { id: 'orange', label: 'Оранжевый', class: 'bg-orange-500' },
    { id: 'purple', label: 'Фиолетовый', class: 'bg-purple-500' },
    { id: 'rose', label: 'Розовый', class: 'bg-rose-500' },
    { id: 'slate', label: 'Серый', class: 'bg-slate-500' },
];

// Popular diabetes quick-add presets
const QUICK_PRESETS = [
    { title: 'Тест-полоски для глюкометра', category: 'diabetes_supplies', amount: '2 уп.' },
    { title: 'Иглы для шприц-ручек (4 мм)', category: 'diabetes_supplies', amount: '1 кор. (100 шт)' },
    { title: 'Спиртовые салфетки для инъекций', category: 'pharmacy', amount: '100 шт' },
    { title: 'Сок яблочный 0.2л (при гипогликемии)', category: 'hypo_fast_carbs', amount: '4 шт' },
    { title: 'Таблетки декстрозы / Dextro4', category: 'hypo_fast_carbs', amount: '2 уп.' },
    { title: 'Гречневая крупа / овсянка', category: 'groceries', amount: '1 кг' },
    { title: 'Бумажные полотенца / салфетки', category: 'household', amount: '2 уп.' },
    { title: 'Антибактериальное мыло', category: 'household', amount: '1 шт' },
];

export const ShoppingList: React.FC<ShoppingListProps> = ({
                                                              items,
                                                              onToggleItem,
                                                              onAddItem,
                                                              onDeleteItem,
                                                              onClearPurchased,
                                                          }) => {
    // Custom categories stored in localStorage
    const [customCategories, setCustomCategories] = useLocalStorage<ShoppingCategoryItem[]>(
        't1d_shopping_custom_categories',
        []
    );

    const allCategories = useMemo(() => {
        return [...DEFAULT_SHOPPING_CATEGORIES, ...customCategories];
    }, [customCategories]);

    // View & Filter states
    const [filter, setFilter] = useState<'all' | 'pending' | 'purchased'>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');

    // Form states
    const [newTitle, setNewTitle] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newItemCategory, setNewItemCategory] = useState<string>('groceries');

    // Category modal states
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatIcon, setNewCatIcon] = useState('🛒');
    const [newCatColor, setNewCatColor] = useState('emerald');

    const pendingCount = useMemo(() => items.filter((i) => !i.isPurchased).length, [items]);
    const purchasedCount = useMemo(() => items.filter((i) => i.isPurchased).length, [items]);

    const getCategoryDetails = (catIdOrName: string) => {
        const found = allCategories.find(
            (c) => c.id === catIdOrName || c.name.toLowerCase() === catIdOrName.toLowerCase()
        );
        if (found) {
            const style = COLOR_MAP[found.color || 'slate'] || COLOR_MAP.slate;
            return {
                id: found.id,
                name: found.name,
                icon: found.icon || '🛒',
                color: found.color || 'slate',
                isDefault: !!found.isDefault,
                badgeClass: style.badge,
                borderClass: style.border,
                bgLightClass: style.bgLight,
                textClass: style.text,
                dotClass: style.dot,
            };
        }
        // Backward compatibility mappings
        if (catIdOrName === 'groceries') {
            const style = COLOR_MAP.emerald;
            return { id: 'groceries', name: 'Продукты', icon: '🥗', color: 'emerald', isDefault: true, badgeClass: style.badge, borderClass: style.border, bgLightClass: style.bgLight, textClass: style.text, dotClass: style.dot };
        }
        if (catIdOrName === 'pharmacy') {
            const style = COLOR_MAP.indigo;
            return { id: 'pharmacy', name: 'Аптека', icon: '💊', color: 'indigo', isDefault: true, badgeClass: style.badge, borderClass: style.border, bgLightClass: style.bgLight, textClass: style.text, dotClass: style.dot };
        }
        if (catIdOrName === 'household') {
            const style = COLOR_MAP.amber;
            return { id: 'household', name: 'Хозтовары', icon: '🧹', color: 'amber', isDefault: true, badgeClass: style.badge, borderClass: style.border, bgLightClass: style.bgLight, textClass: style.text, dotClass: style.dot };
        }
        if (catIdOrName === 'diabetes_supplies') {
            const style = COLOR_MAP.sky;
            return { id: 'diabetes_supplies', name: 'Диа-товары', icon: '🩺', color: 'sky', isDefault: true, badgeClass: style.badge, borderClass: style.border, bgLightClass: style.bgLight, textClass: style.text, dotClass: style.dot };
        }
        if (catIdOrName === 'hypo_fast_carbs') {
            const style = COLOR_MAP.orange;
            return { id: 'hypo_fast_carbs', name: 'Для гипо', icon: '⚡', color: 'orange', isDefault: true, badgeClass: style.badge, borderClass: style.border, bgLightClass: style.bgLight, textClass: style.text, dotClass: style.dot };
        }
        const style = COLOR_MAP.slate;
        return {
            id: catIdOrName,
            name: catIdOrName || 'Прочее',
            icon: '🛒',
            color: 'slate',
            isDefault: false,
            badgeClass: style.badge,
            borderClass: style.border,
            bgLightClass: style.bgLight,
            textClass: style.text,
            dotClass: style.dot,
        };
    };

    // Filtered items by status (all/pending/purchased) & category
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            // Status filter
            if (filter === 'pending' && item.isPurchased) return false;
            if (filter === 'purchased' && !item.isPurchased) return false;

            // Category filter
            if (selectedCategory !== 'all') {
                const itemCatDetails = getCategoryDetails(item.category);
                if (itemCatDetails.id !== selectedCategory && item.category !== selectedCategory) {
                    return false;
                }
            }
            return true;
        });
    }, [items, filter, selectedCategory, allCategories]);

    // Grouped items by category for the grouped view mode
    const groupedCategories = useMemo(() => {
        const groups: Array<{
            categoryInfo: ReturnType<typeof getCategoryDetails>;
            items: ShoppingItem[];
            pendingCount: number;
        }> = [];

        // Group all filtered items
        filteredItems.forEach((item) => {
            const catDetails = getCategoryDetails(item.category);
            let group = groups.find((g) => g.categoryInfo.id === catDetails.id);
            if (!group) {
                group = {
                    categoryInfo: catDetails,
                    items: [],
                    pendingCount: 0,
                };
                groups.push(group);
            }
            group.items.push(item);
            if (!item.isPurchased) {
                group.pendingCount += 1;
            }
        });

        return groups;
    }, [filteredItems, allCategories]);

    // Handle adding new custom category
    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newCatName.trim();
        if (!trimmed) return;

        // Check if category already exists
        const exists = allCategories.some(
            (c) => c.name.toLowerCase() === trimmed.toLowerCase() || c.id === trimmed.toLowerCase()
        );
        if (exists) {
            alert(`Категория «${trimmed}» уже существует.`);
            return;
        }

        const newCatId = 'cat-' + Date.now();
        const newCategoryItem: ShoppingCategoryItem = {
            id: newCatId,
            name: trimmed,
            icon: newCatIcon || '🛒',
            color: newCatColor || 'emerald',
            isDefault: false,
        };

        setCustomCategories((prev) => [...prev, newCategoryItem]);
        setNewItemCategory(newCatId);
        setNewCatName('');
        setIsCategoryModalOpen(false);
    };

    const handleDeleteCategory = (catId: string) => {
        setCustomCategories((prev) => prev.filter((c) => c.id !== catId));
        if (newItemCategory === catId) {
            setNewItemCategory('groceries');
        }
        if (selectedCategory === catId) {
            setSelectedCategory('all');
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        onAddItem({
            title: newTitle.trim(),
            amount: newAmount.trim() || undefined,
            category: newItemCategory,
            isPurchased: false,
        });

        setNewTitle('');
        setNewAmount('');
    };

    const handleQuickAdd = (preset: typeof QUICK_PRESETS[0]) => {
        onAddItem({
            title: preset.title,
            category: preset.category,
            amount: preset.amount,
            isPurchased: false,
        });
    };

    return (
        <div className="space-y-6 w-full">
            {/* Header Overview Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Список покупок</h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Упорядочивайте покупки и задачи по категориям: Продукты, Аптека, Хозтовары и др.
                    </p>
                </div>

                {/* Action buttons & Stats */}
                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                    <div className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/80 border border-sky-100 dark:border-sky-900 text-xs">
                        <span className="text-slate-500 dark:text-slate-400">К покупке: </span>
                        <strong className="text-sky-800 dark:text-sky-300 text-sm font-bold">{pendingCount}</strong>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Куплено: </span>
                        <strong className="text-slate-700 dark:text-slate-200 text-sm font-bold">{purchasedCount}</strong>
                    </div>

                    {/* Manage Categories Button */}
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
                        title="Создать и настроить категории покупок"
                    >
                        <Tags className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span>Категории</span>
                        {customCategories.length > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-sky-600 text-white text-[10px] font-bold">
                +{customCategories.length}
              </span>
                        )}
                    </button>

                    {purchasedCount > 0 && (
                        <button
                            onClick={onClearPurchased}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                        >
                            Очистить купленные
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Diabetes Presets (One-click add) */}
            <div className="bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-900/60 rounded-2xl p-4 sm:p-5 transition-colors">
                <div className="flex items-center gap-2 mb-2.5">
                    <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-sky-200">
                        Быстрое добавление частых товаров в 1 клик
                    </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                    {QUICK_PRESETS.map((preset, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleQuickAdd(preset)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-sky-100/60 dark:hover:bg-slate-700 border border-sky-200/80 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                        >
                            <Plus className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                            <span>{preset.title}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">({preset.amount})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Add New Item Form */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Добавить товар или покупку
                    </h3>
                    <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>+ Создать категорию</span>
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-5">
                        <input
                            type="text"
                            required
                            placeholder="Наименование (напр. Молоко 2.5%, Спирт, Мыло)"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-sky-500"
                        />
                    </div>
                    <div className="sm:col-span-3">
                        <input
                            type="text"
                            placeholder="Кол-во (напр. 2 уп, 1 кг, 1 шт)"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-sky-500"
                        />
                    </div>
                    <div className="sm:col-span-3 flex items-center gap-1">
                        <select
                            value={newItemCategory}
                            onChange={(e) => {
                                if (e.target.value === '__add_new__') {
                                    setIsCategoryModalOpen(true);
                                } else {
                                    setNewItemCategory(e.target.value);
                                }
                            }}
                            className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-sky-500 cursor-pointer"
                        >
                            {allCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                            <option value="__add_new__">+ Новая категория...</option>
                        </select>
                    </div>
                    <div className="sm:col-span-1">
                        <button
                            type="submit"
                            className="w-full h-full min-h-[38px] flex items-center justify-center rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-xs transition-colors cursor-pointer"
                            title="Добавить товар"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Main Container: Controls, Category Filters & List/Grouped View */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
                {/* Navigation Bar: Status filters + View Mode Toggle */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                filter === 'all'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                        >
                            Все ({items.length})
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                filter === 'pending'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                        >
                            К покупке ({pendingCount})
                        </button>
                        <button
                            onClick={() => setFilter('purchased')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                filter === 'purchased'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                        >
                            Куплено ({purchasedCount})
                        </button>
                    </div>

                    {/* View Mode Toggle: Grouped by Category vs Flat List */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
                            <button
                                onClick={() => setViewMode('grouped')}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                    viewMode === 'grouped'
                                        ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs font-bold'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                                }`}
                                title="Группировать задачи по категориям"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>По категориям</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                    viewMode === 'list'
                                        ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs font-bold'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                                }`}
                                title="Отобразить сплошным списком"
                            >
                                <List className="w-3.5 h-3.5" />
                                <span>Списком</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Category Chips Bar for Quick Filtering */}
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex-shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Категория:
          </span>
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            selectedCategory === 'all'
                                ? 'bg-sky-600 text-white shadow-2xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        Все
                    </button>
                    {allCategories.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        const categoryItemCount = items.filter((i) => {
                            const d = getCategoryDetails(i.category);
                            return d.id === cat.id;
                        }).length;

                        if (categoryItemCount === 0 && cat.isDefault && !['groceries', 'pharmacy', 'household'].includes(cat.id)) {
                            // Hide empty non-primary default categories in chips unless active to save space
                            if (!isSelected) return null;
                        }

                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                    isSelected
                                        ? 'bg-sky-600 text-white shadow-2xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.name}</span>
                                {categoryItemCount > 0 && (
                                    <span
                                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                            isSelected
                                                ? 'bg-white/25 text-white'
                                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                    {categoryItemCount}
                  </span>
                                )}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 whitespace-nowrap font-medium transition-colors cursor-pointer ml-auto flex-shrink-0"
                    >
                        <Plus className="w-3 h-3" />
                        <span>Новая</span>
                    </button>
                </div>

                {/* Items Display: Grouped or Flat List */}
                {filteredItems.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                        {filter === 'purchased'
                            ? 'Пока нет отмеченных купленных товаров.'
                            : filter === 'pending'
                                ? 'Все запланированные покупки в этой категории уже приобретены!'
                                : selectedCategory !== 'all'
                                    ? 'В этой категории пока нет товаров. Добавьте товар выше.'
                                    : 'Список покупок пуст. Добавьте первый товар с помощью формы выше.'}
                    </div>
                ) : viewMode === 'grouped' ? (
                    /* Grouped View Mode */
                    <div className="p-4 sm:p-5 space-y-5">
                        {groupedCategories.map((group) => (
                            <div
                                key={group.categoryInfo.id}
                                className={`rounded-xl border ${group.categoryInfo.borderClass} overflow-hidden shadow-2xs bg-white dark:bg-slate-900`}
                            >
                                {/* Category Group Header */}
                                <div
                                    className={`p-3 sm:px-4 flex items-center justify-between ${group.categoryInfo.bgLightClass} border-b ${group.categoryInfo.borderClass}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">{group.categoryInfo.icon}</span>
                                        <h4 className={`font-bold text-sm ${group.categoryInfo.textClass}`}>
                                            {group.categoryInfo.name}
                                        </h4>
                                        <span
                                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${group.categoryInfo.badgeClass}`}
                                        >
                      {group.items.length}{' '}
                                            {group.pendingCount > 0 ? `(к покупке: ${group.pendingCount})` : '(все куплены)'}
                    </span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setNewItemCategory(group.categoryInfo.id);
                                            window.scrollTo({ top: 220, behavior: 'smooth' });
                                        }}
                                        className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 flex items-center gap-0.5 cursor-pointer transition-colors"
                                        title="Добавить товар в эту категорию"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>Добавить</span>
                                    </button>
                                </div>

                                {/* Items in this category */}
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {group.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`p-3 sm:px-4 flex items-center justify-between gap-3 transition-colors ${
                                                item.isPurchased
                                                    ? 'bg-slate-50/50 dark:bg-slate-800/20 opacity-60'
                                                    : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {/* Checkbox button */}
                                                <button
                                                    onClick={() => onToggleItem(item.id)}
                                                    className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                                                        item.isPurchased
                                                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                                            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800'
                                                    }`}
                                                    title={item.isPurchased ? 'Отметить как не куплено' : 'Отметить как куплено'}
                                                >
                                                    {item.isPurchased && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                </button>

                                                {/* Title & Amount */}
                                                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                          <span
                              onClick={() => onToggleItem(item.id)}
                              className={`text-sm font-medium cursor-pointer transition-all ${
                                  item.isPurchased
                                      ? 'line-through text-slate-400 dark:text-slate-500'
                                      : 'text-slate-800 dark:text-slate-100 hover:text-sky-700 dark:hover:text-sky-400'
                              }`}
                          >
                            {item.title}
                          </span>
                                                    {item.amount && (
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                              {item.amount}
                            </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Delete */}
                                            <button
                                                onClick={() => onDeleteItem(item.id)}
                                                className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                                title="Удалить"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Flat List View Mode */
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredItems.map((item) => {
                            const catDetails = getCategoryDetails(item.category);

                            return (
                                <div
                                    key={item.id}
                                    className={`p-3.5 sm:px-5 flex items-center justify-between gap-3 transition-colors ${
                                        item.isPurchased
                                            ? 'bg-slate-50/70 dark:bg-slate-800/30 opacity-70'
                                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {/* Checkbox button */}
                                        <button
                                            onClick={() => onToggleItem(item.id)}
                                            className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                                                item.isPurchased
                                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                                    : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800'
                                            }`}
                                            title={item.isPurchased ? 'Отметить как не куплено' : 'Отметить как куплено'}
                                        >
                                            {item.isPurchased && <Check className="w-4 h-4 stroke-[3]" />}
                                        </button>

                                        {/* Text & Category */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                        <span
                            onClick={() => onToggleItem(item.id)}
                            className={`text-sm font-medium cursor-pointer transition-all ${
                                item.isPurchased
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-800 dark:text-slate-100 hover:text-sky-700 dark:hover:text-sky-400'
                            }`}
                        >
                          {item.title}
                        </span>
                                                {item.amount && (
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {item.amount}
                          </span>
                                                )}
                                                <span
                                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catDetails.badgeClass}`}
                                                >
                          {catDetails.icon} {catDetails.name}
                        </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <button
                                            onClick={() => onDeleteItem(item.id)}
                                            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                            title="Удалить"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Category Creation & Management Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                                    <Tags className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Категории покупок</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Создавайте свои категории для порядка в задачах</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-5 space-y-5 max-h-[75vh] overflow-y-auto">
                            {/* Add New Category Form */}
                            <form onSubmit={handleCreateCategory} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                    <FolderPlus className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                                    <span>Создать новую категорию</span>
                                </h4>

                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                                        Название (напр. Хозтовары, Одежда, Детское)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Название категории..."
                                        value={newCatName}
                                        onChange={(e) => setNewCatName(e.target.value)}
                                        className="w-full text-sm py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-sky-500"
                                    />
                                </div>

                                {/* Emoji icon selector */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                                        Иконка: <span className="text-base font-bold ml-1">{newCatIcon}</span>
                                    </label>
                                    <div className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                        {EMOJI_OPTIONS.map((emoji) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => setNewCatIcon(emoji)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all cursor-pointer ${
                                                    newCatIcon === emoji
                                                        ? 'bg-sky-100 dark:bg-sky-950 border-2 border-sky-500 scale-110'
                                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Color selector */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                                        Цвет оформления:
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {COLOR_OPTIONS.map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => setNewCatColor(c.id)}
                                                className={`w-6 h-6 rounded-full ${c.class} transition-all cursor-pointer flex items-center justify-center ${
                                                    newCatColor === c.id
                                                        ? 'ring-2 ring-offset-2 ring-sky-500 dark:ring-offset-slate-900 scale-110'
                                                        : 'opacity-70 hover:opacity-100'
                                                }`}
                                                title={c.label}
                                            >
                                                {newCatColor === c.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Создать категорию</span>
                                </button>
                            </form>

                            {/* List of existing categories */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                                    Список всех категорий ({allCategories.length})
                                </h4>
                                <div className="space-y-1.5">
                                    {allCategories.map((cat) => {
                                        const style = COLOR_MAP[cat.color || 'slate'] || COLOR_MAP.slate;
                                        const isCustom = !cat.isDefault;
                                        const itemsInCat = items.filter((i) => {
                                            const d = getCategoryDetails(i.category);
                                            return d.id === cat.id;
                                        }).length;

                                        return (
                                            <div
                                                key={cat.id}
                                                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{cat.icon}</span>
                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {cat.name}
                          </span>
                                                    <span
                                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.badge}`}
                                                    >
                            {itemsInCat} шт.
                          </span>
                                                    {cat.isDefault && (
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              (базовая)
                            </span>
                                                    )}
                                                </div>

                                                {isCustom && (
                                                    <button
                                                        onClick={() => handleDeleteCategory(cat.id)}
                                                        className="p-1 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                                                        title="Удалить категорию"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex justify-end">
                            <button
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

