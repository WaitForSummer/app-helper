import React, { useState, useMemo } from 'react';
import {
    Utensils,
    Plus,
    Bookmark,
    Calendar,
    Coffee,
    Sun,
    Moon,
    Cookie,
    Trash2,
    Syringe,
    ChevronDown,
    ChevronUp,
    BookmarkPlus,
    Flame,
    Wheat,
    PieChart,
    HelpCircle,
} from 'lucide-react';
import { MealEntry, FavoriteMeal, AppSettings, MealType } from '../types';
import { AddMealModal } from './AddMealModal';
import { FavoriteMealsModal } from './FavoriteMealsModal';

interface FoodDiaryProps {
    meals: MealEntry[];
    onAddMeal: (meal: Omit<MealEntry, 'id'>, saveToFavorites?: boolean) => void;
    onDeleteMeal: (id: string) => void;
    favoriteMeals: FavoriteMeal[];
    onAddFavoriteMeal: (meal: Omit<FavoriteMeal, 'id'>) => void;
    onDeleteFavoriteMeal: (id: string) => void;
    settings: AppSettings;
}

const MEAL_TYPE_CONFIG: Record<
    MealType,
    { label: string; icon: any; colorClass: string; badgeClass: string }
> = {
    breakfast: {
        label: 'Завтрак',
        icon: Coffee,
        colorClass: 'text-amber-600',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    },
    lunch: {
        label: 'Обед',
        icon: Sun,
        colorClass: 'text-emerald-600',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    },
    dinner: {
        label: 'Ужин',
        icon: Moon,
        colorClass: 'text-indigo-600',
        badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    },
    snack: {
        label: 'Перекус',
        icon: Cookie,
        colorClass: 'text-sky-600',
        badgeClass: 'bg-sky-100 text-sky-900 border-sky-200',
    },
};

export const FoodDiary: React.FC<FoodDiaryProps> = ({
                                                        meals,
                                                        onAddMeal,
                                                        onDeleteMeal,
                                                        favoriteMeals,
                                                        onAddFavoriteMeal,
                                                        onDeleteFavoriteMeal,
                                                        settings,
                                                    }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFavModalOpen, setIsFavModalOpen] = useState(false);
    const [filterPeriod, setFilterPeriod] = useState<'today' | 'yesterday' | 'all'>('today');
    const [expandedMealIds, setExpandedMealIds] = useState<Record<string, boolean>>({});
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => {
            setToastMessage(null);
        }, 3500);
    };

    const toggleExpand = (id: string) => {
        setExpandedMealIds((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    // Filtered meals
    const filteredMeals = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const sorted = [...meals].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        if (filterPeriod === 'today') {
            return sorted.filter((m) => m.timestamp.startsWith(todayStr));
        }
        if (filterPeriod === 'yesterday') {
            return sorted.filter((m) => m.timestamp.startsWith(yesterdayStr));
        }
        return sorted;
    }, [meals, filterPeriod]);

    // Totals for filtered view
    const totals = useMemo(() => {
        return filteredMeals.reduce(
            (acc, m) => {
                acc.calories += m.totalCalories || 0;
                acc.carbs += m.totalCarbs || 0;
                acc.breadUnits += m.totalBreadUnits || 0;
                acc.bolus += m.insulinBolus || 0;
                return acc;
            },
            { calories: 0, carbs: 0, breadUnits: 0, bolus: 0 }
        );
    }, [filteredMeals]);

    const handleSaveMealAndFav = (
        newMeal: Omit<MealEntry, 'id'>,
        saveToFavorites?: boolean
    ) => {
        onAddMeal(newMeal, saveToFavorites);
        if (saveToFavorites && newMeal.items.length > 0) {
            // Create favorite meal entry from this meal
            const firstItem = newMeal.items[0];
            const title =
                newMeal.title ||
                newMeal.items.map((i) => i.name).join(' + ');

            onAddFavoriteMeal({
                name: title,
                category: MEAL_TYPE_CONFIG[newMeal.mealType]?.label || 'Блюдо',
                amount: newMeal.items.map((i) => i.amount).join(', '),
                calories: newMeal.totalCalories,
                carbs: newMeal.totalCarbs,
                breadUnits: newMeal.totalBreadUnits,
                notes: newMeal.notes,
            });
        }
    };

    return (
        <div className="space-y-6 w-full">
            {/* Top Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Журнал питания и подсчет ХЕ</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Учет продуктов, расчет калорийности и хлебных единиц для компенсации СД1
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setIsFavModalOpen(true)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/70 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                        <Bookmark className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Частые блюда ({favoriteMeals.length})</span>
                    </button>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Записать прием пищи</span>
                    </button>
                </div>
            </div>

            {/* Clinical Diabetes Nutrition Tip */}
            <div className="bg-sky-50/70 dark:bg-sky-950/50 border border-sky-200/80 dark:border-sky-900/60 rounded-2xl p-4 sm:p-5 flex items-start gap-3 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Wheat className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300">
          <span className="font-bold text-sky-950 dark:text-sky-200 block text-sm mb-0.5">
            Памятка по подсчету Хлебных Единиц (ХЕ) для СД1:
          </span>
                    1 ХЕ принимается равной ~{settings.gramsPerCarbUnit || 11} г чистых углеводов. Точный учет ХЕ необходим для расчета болюса ультракороткого инсулина с учетом вашего индивидуального углеводного коэффициента (УК) на завтрак, обед и ужин.
                </div>
            </div>

            {/* Summary Highlights for selected period */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Калории</span>
                        <Flame className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {totals.calories} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">ккал</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">За выбранный период</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Углеводы</span>
                        <PieChart className="w-4 h-4 text-sky-500" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-sky-700 dark:text-sky-400">
                        {totals.carbs} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">г</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Чистые углеводы</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs ring-1 ring-emerald-200 dark:ring-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/20 transition-colors">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        <span>Хлебные единицы</span>
                        <Wheat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="mt-2 text-2xl font-black text-emerald-800 dark:text-emerald-300">
                        {totals.breadUnits.toFixed(1)} <span className="text-xs font-normal">{settings.carbUnitName}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">Всего к компенсации</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Болюс инсулина</span>
                        <Syringe className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-purple-700 dark:text-purple-400">
                        {totals.bolus.toFixed(1)} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">ед.</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Введено на еду</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
                    <button
                        onClick={() => setFilterPeriod('today')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            filterPeriod === 'today'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                    >
                        Сегодня
                    </button>
                    <button
                        onClick={() => setFilterPeriod('yesterday')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            filterPeriod === 'yesterday'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                    >
                        Вчера
                    </button>
                    <button
                        onClick={() => setFilterPeriod('all')}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            filterPeriod === 'all'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                    >
                        Все записи ({meals.length})
                    </button>
                </div>

                <span className="text-xs text-slate-500 dark:text-slate-400">
          Приемов пищи: <strong>{filteredMeals.length}</strong>
        </span>
            </div>

            {/* Floating Toast Notification */}
            {toastMessage && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold rounded-xl flex items-center justify-between shadow-xs animate-in fade-in duration-200">
                    <span>{toastMessage}</span>
                    <button
                        onClick={() => setToastMessage(null)}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline text-xs cursor-pointer ml-2"
                    >
                        Закрыть
                    </button>
                </div>
            )}

            {/* Meals List */}
            <div className="space-y-4">
                {filteredMeals.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200 dark:border-slate-800 text-center shadow-xs transition-colors">
                        <Utensils className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            Нет записанных приемов пищи за этот период
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                            Запишите завтрак, обед или перекус, указав граммы продуктов и рассчитав ХЕ.
                        </p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Записать прием пищи</span>
                        </button>
                    </div>
                ) : (
                    filteredMeals.map((meal) => {
                        const config = MEAL_TYPE_CONFIG[meal.mealType] || MEAL_TYPE_CONFIG.snack;
                        const Icon = config.icon;
                        const isExpanded = expandedMealIds[meal.id] ?? true;
                        const mealDate = new Date(meal.timestamp);

                        return (
                            <div
                                key={meal.id}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700"
                            >
                                {/* Header */}
                                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs ${config.colorClass}`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${config.badgeClass}`}>
                          {config.label}
                        </span>
                                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono">
                          {mealDate.toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                          })}
                                                    {' · '}
                                                    {mealDate.toLocaleDateString('ru-RU', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })}
                        </span>
                                            </div>
                                            {meal.title && (
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{meal.title}</h4>
                                            )}
                                        </div>
                                    </div>

                                    {/* Summary badges */}
                                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                        <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                                            <span className="text-slate-500 dark:text-slate-400">Калории: </span>
                                            <strong className="text-slate-900 dark:text-slate-100 font-bold">{meal.totalCalories}</strong> ккал
                                        </div>
                                        <div className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/70 text-xs text-amber-900 dark:text-amber-300 border border-amber-100 dark:border-amber-800/70">
                                            <span>Углеводы: </span>
                                            <strong className="font-bold">{meal.totalCarbs}</strong> г
                                        </div>
                                        <div className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-xs text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 font-bold">
                                            <span>{meal.totalBreadUnits}</span> {settings.carbUnitName}
                                        </div>
                                        {meal.insulinBolus !== undefined && (
                                            <div className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/70 text-xs text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800/70 font-bold flex items-center gap-1">
                                                <Syringe className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                                <span>{meal.insulinBolus} ед.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Items breakdown list */}
                                <div className="p-4 sm:p-5">
                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                                        <span>Состав приема пищи ({meal.items.length} поз.):</span>
                                        <button
                                            onClick={() => toggleExpand(meal.id)}
                                            className="flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                        >
                                            <span>{isExpanded ? 'Свернуть' : 'Развернуть'}</span>
                                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden mb-3">
                                            {meal.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="p-2.5 sm:px-3.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <span className="font-medium text-slate-900 dark:text-slate-100">{item.name}</span>
                                                        <span className="text-slate-400 dark:text-slate-500 ml-2">({item.amount})</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-right flex-shrink-0">
                                                        <span className="text-slate-500 dark:text-slate-400">{item.calories} ккал</span>
                                                        <span className="text-amber-800 dark:text-amber-400 font-semibold">{item.carbs} г</span>
                                                        <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded">
                              {item.breadUnits} ХЕ
                            </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {meal.notes && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 mt-2">
                                            Примечание: {meal.notes}
                                        </p>
                                    )}

                                    {/* Actions Footer */}
                                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <button
                                            onClick={() => {
                                                const title = meal.title || meal.items.map((i) => i.name).join(' + ');
                                                onAddFavoriteMeal({
                                                    name: title,
                                                    category: MEAL_TYPE_CONFIG[meal.mealType]?.label || 'Блюдо',
                                                    amount: meal.items.map((i) => i.amount).join(', '),
                                                    calories: meal.totalCalories,
                                                    carbs: meal.totalCarbs,
                                                    breadUnits: meal.totalBreadUnits,
                                                    notes: meal.notes,
                                                });
                                                showToast(`«${title}» сохранено в часто употребляемые блюда!`);
                                            }}
                                            className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-semibold cursor-pointer"
                                        >
                                            <BookmarkPlus className="w-3.5 h-3.5" />
                                            <span>Сохранить это блюдо в избранное</span>
                                        </button>

                                        <button
                                            onClick={() => onDeleteMeal(meal.id)}
                                            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                            title="Удалить запись"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modals */}
            <AddMealModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSaveMeal={handleSaveMealAndFav}
                favoriteMeals={favoriteMeals}
                settings={settings}
            />

            <FavoriteMealsModal
                isOpen={isFavModalOpen}
                onClose={() => setIsFavModalOpen(false)}
                favoriteMeals={favoriteMeals}
                onAddFavoriteMeal={onAddFavoriteMeal}
                onDeleteFavoriteMeal={onDeleteFavoriteMeal}
                settings={settings}
            />
        </div>
    );
};
