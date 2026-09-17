import React, { useState } from 'react';
import {
    X,
    Plus,
    Trash2,
    Sparkles,
    Utensils,
    Coffee,
    Sun,
    Moon,
    Cookie,
    BookmarkPlus,
    Syringe,
} from 'lucide-react';
import { MealEntry, FoodItem, MealType, FavoriteMeal, AppSettings } from '../types';

interface AddMealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveMeal: (meal: Omit<MealEntry, 'id'>, saveToFavorites?: boolean) => void;
    favoriteMeals: FavoriteMeal[];
    settings: AppSettings;
}

export const AddMealModal: React.FC<AddMealModalProps> = ({
                                                              isOpen,
                                                              onClose,
                                                              onSaveMeal,
                                                              favoriteMeals,
                                                              settings,
                                                          }) => {
    const [mealType, setMealType] = useState<MealType>('breakfast');
    const [mealTitle, setMealTitle] = useState('');
    const [dateTime, setDateTime] = useState(() => {
        const now = new Date();
        const tzOffset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    });

    const [items, setItems] = useState<FoodItem[]>([
        {
            id: 'item-' + Date.now(),
            name: '',
            amount: '200 г',
            calories: 0,
            carbs: 0,
            breadUnits: 0,
        },
    ]);

    const [insulinBolus, setInsulinBolus] = useState('');
    const [notes, setNotes] = useState('');
    const [saveAsFavorite, setSaveAsFavorite] = useState(false);
    const [favoriteCategory, setFavoriteCategory] = useState('Завтрак');

    if (!isOpen) return null;

    const gramsPerXE = settings.gramsPerCarbUnit || 11;

    const handleUpdateItem = (id: string, field: keyof FoodItem, value: any) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                const updated = { ...item, [field]: value };
                if (field === 'carbs') {
                    const c = parseFloat(value) || 0;
                    updated.breadUnits = parseFloat((c / gramsPerXE).toFixed(1));
                }
                return updated;
            })
        );
    };

    const handleAddItem = () => {
        setItems((prev) => [
            ...prev,
            {
                id: 'item-' + Date.now() + Math.random(),
                name: '',
                amount: '100 г',
                calories: 0,
                carbs: 0,
                breadUnits: 0,
            },
        ]);
    };

    const handleRemoveItem = (id: string) => {
        if (items.length <= 1) return;
        setItems((prev) => prev.filter((it) => it.id !== id));
    };

    const handleQuickAddFavorite = (fav: FavoriteMeal) => {
        // If the first item is blank, replace it; otherwise append
        const isFirstBlank = items.length === 1 && !items[0].name.trim();
        const newItem: FoodItem = {
            id: 'item-' + Date.now() + Math.random(),
            name: fav.name,
            amount: fav.amount,
            calories: fav.calories,
            carbs: fav.carbs,
            breadUnits: fav.breadUnits,
        };

        if (isFirstBlank) {
            setItems([newItem]);
        } else {
            setItems((prev) => [...prev, newItem]);
        }
    };

    // Totals
    const totalCalories = items.reduce((sum, it) => sum + (Number(it.calories) || 0), 0);
    const totalCarbs = items.reduce((sum, it) => sum + (Number(it.carbs) || 0), 0);
    const totalXE = parseFloat((totalCarbs / gramsPerXE).toFixed(1));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validItems = items.filter((it) => it.name.trim().length > 0);
        if (validItems.length === 0) {
            alert('Пожалуйста, добавьте хотя бы одно название продукта или блюда.');
            return;
        }

        onSaveMeal(
            {
                timestamp: new Date(dateTime).toISOString(),
                mealType,
                title: mealTitle.trim() || undefined,
                items: validItems,
                totalCalories,
                totalCarbs,
                totalBreadUnits: totalXE,
                insulinBolus: insulinBolus ? parseFloat(insulinBolus) : undefined,
                notes: notes.trim() || undefined,
            },
            saveAsFavorite
        );

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto transition-colors">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                            <Utensils className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                                Запись приема пищи и подсчет ХЕ
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Учет граммов, калорийности и расчет хлебных единиц для инсулина
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    {/* Meal Type & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-7">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                Прием пищи
                            </label>
                            <div className="grid grid-cols-4 gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setMealType('breakfast')}
                                    className={`py-2 px-1.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                        mealType === 'breakfast'
                                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <Coffee className="w-4 h-4" />
                                    <span>Завтрак</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMealType('lunch')}
                                    className={`py-2 px-1.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                        mealType === 'lunch'
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <Sun className="w-4 h-4" />
                                    <span>Обед</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMealType('dinner')}
                                    className={`py-2 px-1.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                        mealType === 'dinner'
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <Moon className="w-4 h-4" />
                                    <span>Ужин</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMealType('snack')}
                                    className={`py-2 px-1.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                        mealType === 'snack'
                                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <Cookie className="w-4 h-4" />
                                    <span>Перекус</span>
                                </button>
                            </div>
                        </div>

                        <div className="sm:col-span-5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                Дата и время
                            </label>
                            <input
                                type="datetime-local"
                                value={dateTime}
                                onChange={(e) => setDateTime(e.target.value)}
                                className="w-full text-xs font-mono py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-sky-500 h-[46px]"
                            />
                        </div>
                    </div>

                    {/* Quick-insert from Favorite Meals */}
                    {favoriteMeals.length > 0 && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>Быстрый ввод из сохраненных часто употребляемых блюд:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {favoriteMeals.map((fav) => (
                                    <button
                                        key={fav.id}
                                        type="button"
                                        onClick={() => handleQuickAddFavorite(fav)}
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 text-xs text-slate-700 dark:text-slate-200 shadow-2xs transition-all cursor-pointer"
                                    >
                                        <Plus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                        <span>{fav.name}</span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      ({fav.carbs}г / {fav.breadUnits} ХЕ)
                    </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Products & Food Items Table/List */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                Продукты и блюда
                            </label>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Добавить продукт</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            {items.map((it) => (
                                <div
                                    key={it.id}
                                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center shadow-2xs"
                                >
                                    <div className="sm:col-span-5">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Название продукта (напр. Овсянка, Яблоко)"
                                            value={it.name}
                                            onChange={(e) => handleUpdateItem(it.id, 'name', e.target.value)}
                                            className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-emerald-500"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <input
                                            type="text"
                                            placeholder="Порция (200 г)"
                                            value={it.amount}
                                            onChange={(e) => handleUpdateItem(it.id, 'amount', e.target.value)}
                                            className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-emerald-500"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="ккал"
                                                value={it.calories === 0 ? '' : it.calories}
                                                onChange={(e) =>
                                                    handleUpdateItem(it.id, 'calories', parseFloat(e.target.value) || 0)
                                                }
                                                className="w-full text-xs py-1.5 pl-2 pr-6 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-emerald-500 font-medium"
                                            />
                                            <span className="absolute right-1.5 top-1.5 text-[10px] text-slate-400 dark:text-slate-500 pointer-events-none">
                        ккал
                      </span>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                placeholder="Углев."
                                                value={it.carbs === 0 ? '' : it.carbs}
                                                onChange={(e) =>
                                                    handleUpdateItem(it.id, 'carbs', parseFloat(e.target.value) || 0)
                                                }
                                                className="w-full text-xs py-1.5 pl-2 pr-5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:outline-emerald-500 font-bold text-amber-900 dark:text-amber-400"
                                            />
                                            <span className="absolute right-1.5 top-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-semibold pointer-events-none">
                        г
                      </span>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-1 flex items-center justify-between sm:justify-end gap-1">
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded sm:hidden">
                      {it.breadUnits} ХЕ
                    </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(it.id)}
                                            disabled={items.length <= 1}
                                            className="p-1 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 rounded cursor-pointer"
                                            title="Удалить строку"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Real-time calculated summary for this meal */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-900/60 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">Итого за прием пищи:</span>
                            <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Калории: <strong className="text-slate-900 dark:text-slate-100 text-sm">{totalCalories}</strong> ккал
                </span>
                                <span className="text-xs text-amber-800 dark:text-amber-400">
                  Углеводы: <strong className="text-amber-900 dark:text-amber-300 text-sm">{totalCarbs}</strong> г
                </span>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">Хлебные единицы:</span>
                            <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300 tracking-tight">
                                {totalXE} <span className="text-sm font-semibold">{settings.carbUnitName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bolus Insulin & Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                Введенный болюс инсулина (ед.)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    placeholder="напр. 4.5"
                                    value={insulinBolus}
                                    onChange={(e) => setInsulinBolus(e.target.value)}
                                    className="w-full text-sm font-bold py-2 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-sky-500"
                                />
                                <Syringe className="w-4 h-4 text-sky-500 absolute right-3 top-3 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                Заметки / самочувствие
                            </label>
                            <input
                                type="text"
                                placeholder="напр. болюс за 10 мин до еды"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-sky-500"
                            />
                        </div>
                    </div>

                    {/* Option: Save as favorite dish */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <input
                            id="save-fav-check"
                            type="checkbox"
                            checked={saveAsFavorite}
                            onChange={(e) => setSaveAsFavorite(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                        <label
                            htmlFor="save-fav-check"
                            className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer flex items-center gap-1"
                        >
                            <BookmarkPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Сохранить этот набор продуктов в «Часто употребляемые блюда» для быстрого ввода</span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
                        >
                            Сохранить прием пищи
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
