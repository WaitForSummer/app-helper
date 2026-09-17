import React, { useState } from 'react';
import {
    X,
    Plus,
    Trash2,
    Bookmark,
    Sparkles,
    Utensils,
    Check,
} from 'lucide-react';
import { FavoriteMeal, AppSettings } from '../types';

interface FavoriteMealsModalProps {
    isOpen: boolean;
    onClose: () => void;
    favoriteMeals: FavoriteMeal[];
    onAddFavoriteMeal: (meal: Omit<FavoriteMeal, 'id'>) => void;
    onDeleteFavoriteMeal: (id: string) => void;
    settings: AppSettings;
}

export const FavoriteMealsModal: React.FC<FavoriteMealsModalProps> = ({
                                                                          isOpen,
                                                                          onClose,
                                                                          favoriteMeals,
                                                                          onAddFavoriteMeal,
                                                                          onDeleteFavoriteMeal,
                                                                          settings,
                                                                      }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Завтрак');
    const [amount, setAmount] = useState('200 г');
    const [calories, setCalories] = useState('');
    const [carbs, setCarbs] = useState('');
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const gramsPerXE = settings.gramsPerCarbUnit || 11;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const c = parseFloat(carbs) || 0;
        const bu = parseFloat((c / gramsPerXE).toFixed(1));

        onAddFavoriteMeal({
            name: name.trim(),
            category: category.trim() || undefined,
            amount: amount.trim() || '1 порция',
            calories: parseFloat(calories) || 0,
            carbs: c,
            breadUnits: bu,
            notes: notes.trim() || undefined,
        });

        setName('');
        setCalories('');
        setCarbs('');
        setNotes('');
        setShowAddForm(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto transition-colors">
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                            <Bookmark className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                                Часто употребляемые блюда
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Шаблоны для быстрого добавления в дневник питания в 1 клик
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

                <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    {/* Add form toggle */}
                    {!showAddForm ? (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Создать новое частое блюдо</span>
                        </button>
                    ) : (
                        <form onSubmit={handleSave} className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/30 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                                    Новый шаблон блюда
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                                >
                                    Отмена
                                </button>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    Название блюда / продукта
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="напр. Гречка с индейкой"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                        Категория
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-500"
                                    >
                                        <option value="Завтрак">Завтрак</option>
                                        <option value="Обед">Обед</option>
                                        <option value="Ужин">Ужин</option>
                                        <option value="Перекус">Перекус</option>
                                        <option value="Гарниры">Гарниры</option>
                                        <option value="Напитки">Напитки</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                        Порция
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="250 г"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                        Калории (ккал)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="ккал"
                                        value={calories}
                                        onChange={(e) => setCalories(e.target.value)}
                                        className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                        Углеводы (граммы)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        required
                                        placeholder="напр. 35"
                                        value={carbs}
                                        onChange={(e) => setCarbs(e.target.value)}
                                        className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-amber-900 dark:text-amber-400 focus:outline-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                        Расчет ХЕ (~{gramsPerXE}г)
                                    </label>
                                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-800 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                        {carbs ? (parseFloat(carbs) / gramsPerXE).toFixed(1) : '0'}{' '}
                                        {settings.carbUnitName}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                                    Примечание (необязательно)
                                </label>
                                <input
                                    type="text"
                                    placeholder="напр. медленные углеводы, без сахара"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-emerald-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                            >
                                Сохранить шаблон
                            </button>
                        </form>
                    )}

                    {/* List of saved dishes */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {favoriteMeals.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                                Пока нет сохраненных блюд. Добавьте свои любимые завтраки или перекусы для быстрого ввода.
                            </div>
                        ) : (
                            favoriteMeals.map((fav) => (
                                <div key={fav.id} className="py-3 flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{fav.name}</span>
                                            {fav.category && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {fav.category}
                        </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            <span>Порция: {fav.amount}</span>
                                            <span>•</span>
                                            <span>{fav.calories} ккал</span>
                                            <span>•</span>
                                            <strong className="text-amber-800 dark:text-amber-400">{fav.carbs} г углев.</strong>
                                            <span>•</span>
                                            <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                                                {fav.breadUnits} {settings.carbUnitName}
                                            </strong>
                                        </div>

                                        {fav.notes && (
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 italic">{fav.notes}</p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => onDeleteFavoriteMeal(fav.id)}
                                        className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                        title="Удалить из избранного"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
