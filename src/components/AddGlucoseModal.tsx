import React, { useState, useEffect } from 'react';
import { X, Droplet, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { GlucoseContextTag, GlucoseEntry, GlucoseUnit, AppSettings } from '../types';
import { TAG_LABELS, getGlucoseCategory, getCategoryDetails, convertMgDlToMmol, formatGlucose } from '../utils/diabetesCalc';
import { soundManager } from '../utils/audioAlert';

interface AddGlucoseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: Omit<GlucoseEntry, 'id'>) => void;
    settings: AppSettings;
}

export const AddGlucoseModal: React.FC<AddGlucoseModalProps> = ({
                                                                    isOpen,
                                                                    onClose,
                                                                    onSave,
                                                                    settings,
                                                                }) => {
    const [glucoseInput, setGlucoseInput] = useState<string>('5.5');
    const [tag, setTag] = useState<GlucoseContextTag>('before_meal');
    const [insulinShort, setInsulinShort] = useState<string>('');
    const [insulinLong, setInsulinLong] = useState<string>('');
    const [carbs, setCarbs] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [customTime, setCustomTime] = useState<string>(() => {
        const d = new Date();
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${mins}`;
    });

    // Keep time up-to-date whenever modal is opened
    useEffect(() => {
        if (isOpen) {
            const d = new Date();
            const hours = String(d.getHours()).padStart(2, '0');
            const mins = String(d.getMinutes()).padStart(2, '0');
            setCustomTime(`${hours}:${mins}`);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const numericValue = parseFloat(glucoseInput.replace(',', '.'));
    const mmolVal = isNaN(numericValue)
        ? 0
        : settings.glucoseUnit === 'mgdl'
            ? convertMgDlToMmol(numericValue)
            : numericValue;

    const category = mmolVal > 0 ? getGlucoseCategory(mmolVal, settings) : 'target';
    const categoryInfo = getCategoryDetails(category);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isNaN(numericValue) || numericValue <= 0) return;

        // Construct timestamp with today's date + custom time
        const [h, m] = customTime.split(':').map(Number);
        const date = new Date();
        if (date.getHours() === (h || 0) && date.getMinutes() === (m || 0)) {
            // Exact current time
        } else {
            date.setHours(h || 0, m || 0, 0, 0);
        }

        const newEntry: Omit<GlucoseEntry, 'id'> = {
            glucose: mmolVal,
            timestamp: date.toISOString(),
            tag,
            insulinShort: insulinShort ? parseFloat(insulinShort) : undefined,
            insulinLong: insulinLong ? parseFloat(insulinLong) : undefined,
            carbs: carbs ? parseFloat(carbs) : undefined,
            notes: notes.trim() || undefined,
        };

        if (settings.soundAlerts) {
            if (category === 'hypo') {
                soundManager.playHypoWarning();
            } else {
                soundManager.playChime();
            }
        }

        onSave(newEntry);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                            <Droplet className="w-4 h-4 fill-sky-600 dark:fill-sky-400" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">Внести замер сахара</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Дневник диабета 1 типа</p>
                        </div>
                    </div>
                    <button
                        id="close-add-glucose-modal"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Main Glucose Value Input */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="glucose-value-input" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Уровень глюкозы ({settings.glucoseUnit === 'mmol' ? 'ммоль/л' : 'мг/дл'})
                            </label>
                            <div className="flex items-center gap-1.5">
                                <label htmlFor="glucose-time-input" className="text-xs text-slate-400 dark:text-slate-500">Время:</label>
                                <input
                                    id="glucose-time-input"
                                    type="time"
                                    value={customTime}
                                    onChange={(e) => setCustomTime(e.target.value)}
                                    className="text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 focus:outline-sky-500"
                                />
                            </div>
                        </div>

                        <div className="relative flex items-center">
                            <input
                                id="glucose-value-input"
                                type="number"
                                step={settings.glucoseUnit === 'mmol' ? '0.1' : '1'}
                                min="0.5"
                                max={settings.glucoseUnit === 'mmol' ? '35.0' : '630'}
                                required
                                autoFocus
                                value={glucoseInput}
                                onChange={(e) => setGlucoseInput(e.target.value)}
                                className={`w-full text-3xl font-bold py-3 px-4 rounded-xl border transition-all text-center focus:outline-hidden ${
                                    category === 'hypo'
                                        ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 focus:ring-2 focus:ring-rose-300'
                                        : category === 'very_high'
                                            ? 'border-red-500 bg-red-50/40 dark:bg-red-950/30 text-red-700 dark:text-red-400 focus:ring-2 focus:ring-red-300'
                                            : category === 'high'
                                                ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 focus:ring-2 focus:ring-amber-300'
                                                : 'border-slate-300 dark:border-slate-700 bg-emerald-50/20 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:ring-2 focus:ring-sky-100'
                                }`}
                                placeholder="5.5"
                            />
                            <span className="absolute right-4 text-sm font-semibold text-slate-400 dark:text-slate-500 pointer-events-none">
                {settings.glucoseUnit === 'mmol' ? 'ммоль/л' : 'мг/дл'}
              </span>
                        </div>

                        {/* Quick value stepper buttons */}
                        <div className="flex gap-2 mt-2">
                            {[4.2, 5.5, 6.8, 8.2, 10.5].map((val) => {
                                const displayVal = settings.glucoseUnit === 'mgdl' ? Math.round(val * 18.0182) : val;
                                return (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setGlucoseInput(displayVal.toString())}
                                        className="flex-1 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                    >
                                        {displayVal}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Real-time clinical feedback */}
                        {mmolVal > 0 && (
                            <div
                                className={`mt-2.5 p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                                    category === 'hypo'
                                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                                        : category === 'very_high'
                                            ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-900 dark:text-red-200'
                                            : category === 'high'
                                                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                                                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                                }`}
                            >
                                {category === 'hypo' ? (
                                    <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                                ) : category === 'target' ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <div className="font-semibold">{categoryInfo.label}</div>
                                    <div className="text-[11px] opacity-90 mt-0.5">{categoryInfo.recommendation}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Context Tag Selection */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                            Контекст замера
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {(Object.keys(TAG_LABELS) as GlucoseContextTag[]).map((t) => {
                                const isSelected = tag === t;
                                const info = TAG_LABELS[t];
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setTag(t)}
                                        className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        {info.short}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Type 1 Diabetes Factors: Insulin & Carbs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                        {/* Short Insulin (Болюс) */}
                        <div>
                            <label htmlFor="short-insulin-input" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Короткий инсулин (ед.)
                            </label>
                            <input
                                id="short-insulin-input"
                                type="number"
                                step="0.5"
                                min="0"
                                max="50"
                                placeholder="напр. 6.0"
                                value={insulinShort}
                                onChange={(e) => setInsulinShort(e.target.value)}
                                className="w-full text-sm font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-sky-500"
                            />
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">Новорапид, Хумалог</span>
                        </div>

                        {/* Long Insulin (Базал) */}
                        <div>
                            <label htmlFor="long-insulin-input" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Длинный инсулин (ед.)
                            </label>
                            <input
                                id="long-insulin-input"
                                type="number"
                                step="1"
                                min="0"
                                max="80"
                                placeholder="напр. 14"
                                value={insulinLong}
                                onChange={(e) => setInsulinLong(e.target.value)}
                                className="w-full text-sm font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-sky-500"
                            />
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">Лантус, Тресиба</span>
                        </div>

                        {/* Bread Units / Carbs (ХЕ) */}
                        <div>
                            <label htmlFor="carbs-input" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                Углеводы ({settings.carbUnitName})
                            </label>
                            <input
                                id="carbs-input"
                                type="number"
                                step="0.5"
                                min="0"
                                max="30"
                                placeholder="напр. 4.5"
                                value={carbs}
                                onChange={(e) => setCarbs(e.target.value)}
                                className="w-full text-sm font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-sky-500"
                            />
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">1 ХЕ ≈ 10-12 г углев.</span>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label htmlFor="glucose-notes-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                            Примечание (что ели, активность, симптомы)
                        </label>
                        <input
                            id="glucose-notes-input"
                            type="text"
                            placeholder="Например: гречка с курицей, кофе, прогулка 30 минут"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-sky-500"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            Отмена
                        </button>
                        <button
                            id="save-glucose-submit-btn"
                            type="submit"
                            className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-sm font-semibold text-white shadow-sm hover:shadow transition-all cursor-pointer"
                        >
                            Сохранить замер
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
