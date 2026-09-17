import React, { useState, useMemo } from 'react';
import {
    Plus,
    Trash2,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    ShieldAlert,
    Filter,
    Download,
    FileText,
    Loader2,
} from 'lucide-react';
import { GlucoseEntry, AppSettings, GlucoseContextTag } from '../types';
import {
    calculateStatistics,
    formatGlucose,
    getGlucoseCategory,
    getCategoryDetails,
    TAG_LABELS,
} from '../utils/diabetesCalc';
import { GlucoseChart } from './GlucoseChart';
import { exportGlucoseToCSV, exportGlucoseToPDF } from '../utils/exportData';

interface GlucoseTrackerProps {
    entries: GlucoseEntry[];
    settings: AppSettings;
    onAddEntry: () => void;
    onDeleteEntry: (id: string) => void;
    onToggleUnit?: () => void;
}

export const GlucoseTracker: React.FC<GlucoseTrackerProps> = ({
                                                                  entries,
                                                                  settings,
                                                                  onAddEntry,
                                                                  onDeleteEntry,
                                                                  onToggleUnit,
                                                              }) => {
    const [filterTag, setFilterTag] = useState<string>('all');
    const [isExportingPDF, setIsExportingPDF] = useState(false);

    const handleExportCSV = () => {
        if (entries.length === 0) {
            alert('Нет замеров для экспорта.');
            return;
        }
        exportGlucoseToCSV(entries, settings);
    };

    const handleExportPDF = async () => {
        if (entries.length === 0) {
            alert('Нет замеров для экспорта.');
            return;
        }
        setIsExportingPDF(true);
        try {
            await exportGlucoseToPDF(entries, settings);
        } catch (err) {
            console.error('Failed to generate PDF:', err);
            alert('Произошла ошибка при формировании PDF. Попробуйте еще раз.');
        } finally {
            setIsExportingPDF(false);
        }
    };

    const stats = useMemo(() => calculateStatistics(entries, settings), [entries, settings]);

    // Sort entries descending by timestamp
    const sortedEntries = useMemo(() => {
        return [...entries].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }, [entries]);

    const displayedEntries = useMemo(() => {
        if (filterTag === 'all') return sortedEntries;
        return sortedEntries.filter((e) => e.tag === filterTag);
    }, [sortedEntries, filterTag]);

    // Today's measurements count
    const todayCount = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return entries.filter((e) => e.timestamp.startsWith(today)).length;
    }, [entries]);

    return (
        <div className="space-y-6 w-full">
            {/* Overview Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Time in Range (TIR) Card */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
                    <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              В целевом (TIR)
            </span>
                        <div className={`w-2.5 h-2.5 rounded-full ${stats.tirPercent >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.tirPercent}%</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">цель: &gt;70%</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {stats.tirPercent >= 70 ? 'Отличная компенсация СД1' : 'Рекомендуется коррекция доз'}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
                        <div
                            className={`h-full ${stats.tirPercent >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(100, stats.tirPercent)}%` }}
                        />
                    </div>
                </div>

                {/* Average Glucose Card */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
                    <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Средний сахар
            </span>
                        <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
              {formatGlucose(stats.averageMmol, settings.glucoseUnit)}
            </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {settings.glucoseUnit === 'mmol' ? 'ммоль/л' : 'мг/дл'}
            </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        Вариабельность (SD): ±{stats.standardDeviation}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-100 dark:bg-sky-950">
                        <div className="h-full bg-sky-500" style={{ width: '60%' }} />
                    </div>
                </div>

                {/* Estimated HbA1c Card */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
                    <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Расчетный HbA1c
            </span>
                        <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-semibold px-1.5 py-0.5 rounded">
              ADAG
            </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
              {stats.estimatedHbA1c > 0 ? `${stats.estimatedHbA1c}%` : '—'}
            </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">цель: &lt;7.0%</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Гликированный гемоглобин</p>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
                        <div
                            className={`h-full ${stats.estimatedHbA1c > 0 && stats.estimatedHbA1c <= 7.0 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(100, (stats.estimatedHbA1c / 10) * 100)}%` }}
                        />
                    </div>
                </div>

                {/* Today's Measurements Card */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
                    <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Замеров сегодня
            </span>
                        <CheckCircle2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">{todayCount}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">замеров</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {todayCount >= 4 ? 'Норма замеров выполнена' : 'Рекомендуется 4+ замеров в сутки'}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
                        <div className="h-full bg-slate-700 dark:bg-slate-400" style={{ width: `${Math.min(100, (todayCount / 4) * 100)}%` }} />
                    </div>
                </div>
            </div>

            {/* Target Range Distribution Breakdown Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Распределение замеров по диапазонам
                    </h4>
                    <span className="text-xs text-slate-400 dark:text-slate-500">Всего {stats.count} замеров в базе</span>
                </div>

                {/* Stacked Progress Bar */}
                <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
                    {stats.hypoPercent > 0 && (
                        <div
                            className="bg-rose-500 h-full rounded-l-full transition-all"
                            style={{ width: `${stats.hypoPercent}%` }}
                            title={`Гипогликемия: ${stats.hypoPercent}%`}
                        />
                    )}
                    {stats.tirPercent > 0 && (
                        <div
                            className="bg-emerald-500 h-full transition-all"
                            style={{ width: `${stats.tirPercent}%` }}
                            title={`В норме: ${stats.tirPercent}%`}
                        />
                    )}
                    {stats.hyperPercent > 0 && (
                        <div
                            className="bg-amber-500 h-full rounded-r-full transition-all"
                            style={{ width: `${stats.hyperPercent}%` }}
                            title={`Выше нормы: ${stats.hyperPercent}%`}
                        />
                    )}
                </div>

                {/* Distribution Legend & Target Benchmarks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
                        <div>
                            <span className="font-bold text-rose-600 dark:text-rose-400">{stats.hypoPercent}%</span>
                            <span className="text-slate-400 dark:text-slate-500 ml-1">Ниже 3.9 (цель &lt;4%)</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        <div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.tirPercent}%</span>
                            <span className="text-slate-400 dark:text-slate-500 ml-1">Норма 3.9-10 (цель &gt;70%)</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                        <div>
                            <span className="font-bold text-amber-600 dark:text-amber-400">{stats.hyperPercent}%</span>
                            <span className="text-slate-400 dark:text-slate-500 ml-1">Выше 10 (цель &lt;25%)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive SVG Trend Chart */}
            <GlucoseChart entries={entries} settings={settings} onToggleUnit={onToggleUnit} />

            {/* Measurements Log List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
                {/* Header and Filter */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Журнал замеров сахара</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Зафиксировано доз инсулина и углеводов</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                        {/* Unit Switcher */}
                        {onToggleUnit && (
                            <button
                                onClick={onToggleUnit}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                                title="Переключить единицы: ммоль/л или мг/дл"
                            >
                                <span className="text-slate-400 dark:text-slate-500 font-normal">Ед:</span>
                                <span className="font-bold text-sky-600 dark:text-sky-400">
                  {settings.glucoseUnit === 'mmol' ? 'ммоль/л' : 'мг/дл'}
                </span>
                            </button>
                        )}

                        {/* Tag Filter */}
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 w-full sm:w-auto">
                            <Filter className="w-3.5 h-3.5 text-slate-400" />
                            <select
                                aria-label="Фильтр по контексту замера"
                                value={filterTag}
                                onChange={(e) => setFilterTag(e.target.value)}
                                className="bg-transparent focus:outline-hidden text-xs font-medium cursor-pointer w-full sm:w-auto dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                            >
                                <option value="all">Все замеры</option>
                                {(Object.keys(TAG_LABELS) as GlucoseContextTag[]).map((t) => (
                                    <option key={t} value={t}>
                                        {TAG_LABELS[t].label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Export buttons: CSV & PDF */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                                onClick={handleExportCSV}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                                title="Экспорт всех замеров в файл CSV (Excel)"
                            >
                                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                <span>CSV</span>
                            </button>

                            <button
                                onClick={handleExportPDF}
                                disabled={isExportingPDF}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                                title="Экспорт медицинского отчета в файл PDF"
                            >
                                {isExportingPDF ? (
                                    <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                                ) : (
                                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                                )}
                                <span>PDF</span>
                            </button>
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={onAddEntry}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs cursor-pointer flex-shrink-0"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Добавить</span>
                        </button>
                    </div>
                </div>

                {/* List Content */}
                {displayedEntries.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                        Замеров не найдено. Нажмите «Добавить», чтобы занести первый замер!
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {displayedEntries.map((entry) => {
                            const category = getGlucoseCategory(entry.glucose, settings);
                            const catDetails = getCategoryDetails(category);
                            const tagInfo = TAG_LABELS[entry.tag] || {
                                label: 'Замер',
                                short: 'Замер',
                                color: 'bg-slate-100 text-slate-700',
                            };
                            const date = new Date(entry.timestamp);

                            return (
                                <div
                                    key={entry.id}
                                    className="p-4 sm:px-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4"
                                >
                                    {/* Left: Value & Status Badge */}
                                    <div className="flex items-center gap-3.5">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-xs flex-shrink-0"
                                            style={{ backgroundColor: catDetails.dotColor }}
                                        >
                                            {formatGlucose(entry.glucose, settings.glucoseUnit)}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${tagInfo.color}`}>
                          {tagInfo.short}
                        </span>
                                                <span className="text-xs text-slate-400 dark:text-slate-500">
                          {date.toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                          })}{' '}
                                                    в{' '}
                                                    {date.toLocaleTimeString('ru-RU', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                        </span>
                                            </div>

                                            {/* Insulin and Carbs Pills */}
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                {entry.insulinShort !== undefined && (
                                                    <span className="text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/80 px-2 py-0.5 rounded-md">
                            Болюс: {entry.insulinShort} ед.
                          </span>
                                                )}
                                                {entry.insulinLong !== undefined && (
                                                    <span className="text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/80 px-2 py-0.5 rounded-md">
                            Базал: {entry.insulinLong} ед.
                          </span>
                                                )}
                                                {entry.carbs !== undefined && (
                                                    <span className="text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/80 px-2 py-0.5 rounded-md">
                            {entry.carbs} {settings.carbUnitName}
                          </span>
                                                )}
                                            </div>

                                            {entry.notes && (
                                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">«{entry.notes}»</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => onDeleteEntry(entry.id)}
                                            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                            title="Удалить запись"
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
        </div>
    );
};
