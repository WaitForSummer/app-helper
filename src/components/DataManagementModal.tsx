import React, { useState } from 'react';
import {
    Download,
    Upload,
    Printer,
    FileText,
    Sliders,
    RotateCcw,
    CheckCircle2,
    Volume2,
    Shield,
    HeartPulse,
    FileSpreadsheet,
    Loader2,
    Sun,
    Moon,
    Palette,
} from 'lucide-react';
import {
    AppSettings,
    GlucoseEntry,
    ShoppingItem,
    UtilityBill,
    DoctorAppointment,
    Reminder,
    MealEntry,
    FavoriteMeal,
} from '../types';
import { calculateStatistics, formatGlucose } from '../utils/diabetesCalc';
import { exportGlucoseToCSV, exportGlucoseToPDF } from '../utils/exportData';

interface DataManagementModalProps {
    settings: AppSettings;
    onUpdateSettings: (newSettings: AppSettings) => void;
    glucoseEntries: GlucoseEntry[];
    shoppingItems: ShoppingItem[];
    bills: UtilityBill[];
    appointments: DoctorAppointment[];
    reminders: Reminder[];
    meals?: MealEntry[];
    favoriteMeals?: FavoriteMeal[];
    onImportData: (data: {
        glucoseEntries?: GlucoseEntry[];
        shoppingItems?: ShoppingItem[];
        bills?: UtilityBill[];
        appointments?: DoctorAppointment[];
        reminders?: Reminder[];
        meals?: MealEntry[];
        favoriteMeals?: FavoriteMeal[];
    }) => void;
    onResetData: () => void;
    onToggleTheme?: () => void;
    onToggleUnit?: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
                                                                            settings,
                                                                            onUpdateSettings,
                                                                            glucoseEntries,
                                                                            shoppingItems,
                                                                            bills,
                                                                            appointments,
                                                                            reminders,
                                                                            meals = [],
                                                                            favoriteMeals = [],
                                                                            onImportData,
                                                                            onResetData,
                                                                            onToggleTheme,
                                                                            onToggleUnit,
                                                                        }) => {
    const [targetMin, setTargetMin] = useState(settings.targetMin.toString());
    const [targetMax, setTargetMax] = useState(settings.targetMax.toString());
    const [soundAlerts, setSoundAlerts] = useState(settings.soundAlerts);
    const [saveMessage, setSaveMessage] = useState('');
    const [isExportingPDF, setIsExportingPDF] = useState(false);

    const stats = calculateStatistics(glucoseEntries, settings);

    const handleExportCSV = () => {
        if (glucoseEntries.length === 0) {
            alert('Нет записей для экспорта.');
            return;
        }
        exportGlucoseToCSV(glucoseEntries, settings);
    };

    const handleExportPDF = async () => {
        if (glucoseEntries.length === 0) {
            alert('Нет записей для экспорта.');
            return;
        }
        setIsExportingPDF(true);
        try {
            await exportGlucoseToPDF(glucoseEntries, settings);
        } catch (err) {
            console.error('PDF export error:', err);
            alert('Не удалось создать PDF файл.');
        } finally {
            setIsExportingPDF(false);
        }
    };

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        const min = parseFloat(targetMin);
        const max = parseFloat(targetMax);
        if (!isNaN(min) && !isNaN(max) && min < max) {
            onUpdateSettings({
                ...settings,
                targetMin: min,
                targetMax: max,
                hypoThreshold: min,
                hyperThreshold: max,
                soundAlerts,
            });
            setSaveMessage('Настройки успешно обновлены!');
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const handleExportJSON = () => {
        const backupData = {
            version: 2,
            exportedAt: new Date().toISOString(),
            settings,
            glucoseEntries,
            shoppingItems,
            bills,
            appointments,
            reminders,
            meals,
            favoriteMeals,
        };

        const dataStr =
            'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute(
            'download',
            `diabetes_backup_${new Date().toISOString().split('T')[0]}.json`
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string);
                onImportData(parsed);
                alert('Данные успешно импортированы!');
            } catch (err) {
                alert('Ошибка при чтении файла бэкапа. Проверьте формат JSON.');
            }
        };
        reader.readAsText(file);
    };

    const handlePrintReport = () => {
        window.print();
    };

    return (
        <div className="space-y-6 w-full">
            {/* Title & Quick Export Buttons */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center">
                            <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Экспорт данных и настройки</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Выгрузка замеров сахара в CSV/PDF для врача, целевые коридоры и резервная копия
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Экспорт CSV</span>
                    </button>

                    <button
                        onClick={handleExportPDF}
                        disabled={isExportingPDF}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                        {isExportingPDF ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <FileText className="w-4 h-4" />
                        )}
                        <span>Экспорт PDF</span>
                    </button>

                    <button
                        onClick={handlePrintReport}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold shadow-xs cursor-pointer"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Печать</span>
                    </button>
                </div>
            </div>

            {/* Theme and Interface Appearance (Accessible on Mobile & Desktop) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            Оформление и тема приложения
                        </h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {settings.theme === 'dark' ? '🌙 Темная тема активна' : '☀️ Светлая тема активна'}
          </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Выберите комфортный режим отображения. Переключатель темы также всегда закреплен в правом верхнем углу шапки.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {/* Light Theme Option Card */}
                    <button
                        type="button"
                        id="settings-theme-light-btn"
                        onClick={() => {
                            if (settings.theme !== 'light') {
                                if (onToggleTheme) onToggleTheme();
                                else onUpdateSettings({ ...settings, theme: 'light' });
                            }
                        }}
                        className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between min-h-[56px] ${
                            settings.theme === 'light'
                                ? 'border-sky-500 bg-sky-50/90 dark:border-sky-500 dark:bg-sky-950/60 ring-2 ring-sky-200 dark:ring-sky-900 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/80 dark:border-slate-800 dark:hover:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                                <Sun className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Светлая тема</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Дневной режим с высокой контрастностью</p>
                            </div>
                        </div>
                        {settings.theme === 'light' && (
                            <CheckCircle2 className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                        )}
                    </button>

                    {/* Dark Theme Option Card */}
                    <button
                        type="button"
                        id="settings-theme-dark-btn"
                        onClick={() => {
                            if (settings.theme !== 'dark') {
                                if (onToggleTheme) onToggleTheme();
                                else onUpdateSettings({ ...settings, theme: 'dark' });
                            }
                        }}
                        className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between min-h-[56px] ${
                            settings.theme === 'dark'
                                ? 'border-sky-500 bg-sky-50/90 dark:border-sky-500 dark:bg-sky-950/60 ring-2 ring-sky-200 dark:ring-sky-900 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/80 dark:border-slate-800 dark:hover:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                                <Moon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Темная (ночная) тема</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Снижает нагрузку на глаза в темное время</p>
                            </div>
                        </div>
                        {settings.theme === 'dark' && (
                            <CheckCircle2 className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                        )}
                    </button>
                </div>

                {/* Glucose Units Switcher inside Settings */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Единицы измерения гликемии
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            По умолчанию в РФ и СНГ используется ммоль/л, в США и ЕС — мг/дл
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                if (settings.glucoseUnit !== 'mmol') {
                                    onUpdateSettings({ ...settings, glucoseUnit: 'mmol' });
                                }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                settings.glucoseUnit === 'mmol'
                                    ? 'bg-sky-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            ммоль/л
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (settings.glucoseUnit !== 'mgdl') {
                                    onUpdateSettings({ ...settings, glucoseUnit: 'mgdl' });
                                }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                settings.glucoseUnit === 'mgdl'
                                    ? 'bg-sky-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            мг/дл
                        </button>
                    </div>
                </div>
            </div>

            {/* Dedicated Export Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CSV Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-900/60 shadow-xs flex flex-col justify-between transition-colors">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                                <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Выгрузка в CSV (Excel)</h3>
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Табличный формат с UTF-8 BOM</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                            Включает дату, точное время, уровень сахара, оценку диапазона, контекст (натощак, после еды), дозы короткого и продленного инсулина, углеводы (ХЕ) и все текстовые заметки пользователя.
                        </p>
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        <span>Скачать таблицу .CSV</span>
                    </button>
                </div>

                {/* PDF Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-sky-200 dark:border-sky-900/60 shadow-xs flex flex-col justify-between transition-colors">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Медицинская выписка в PDF</h3>
                                <span className="text-[11px] text-sky-700 dark:text-sky-400 font-semibold">Готовый документ для врача</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                            Официальный макет с расчетными показателями TIR (время в целевом диапазоне), средним гликемическим профилем, расчетным HbA1c, цветной таблицей всех замеров и графами для подписей.
                        </p>
                    </div>
                    <button
                        onClick={handleExportPDF}
                        disabled={isExportingPDF}
                        className="mt-4 w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {isExportingPDF ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Генерация PDF документа...</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                <span>Скачать документ .PDF</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Clinical Target Range Settings */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    <span>Индивидуальные целевые показатели гликемии (ммоль/л)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    По стандартам ассоциации эндокринологов (ADA/EASD) целевой коридор для диабета 1 типа: 3.9 – 10.0 ммоль/л
                </p>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                Нижняя граница (порог гипогликемии)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="2.5"
                                max="6.0"
                                value={targetMin}
                                onChange={(e) => setTargetMin(e.target.value)}
                                className="w-full text-sm font-bold py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-sky-500"
                            />
                            <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5 block">
                Значения ниже считаются гипогликемией
              </span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                Верхняя граница цели (порог гипергликемии)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="7.0"
                                max="14.0"
                                value={targetMax}
                                onChange={(e) => setTargetMax(e.target.value)}
                                className="w-full text-sm font-bold py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-sky-500"
                            />
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 block">
                Значения выше считаются превышением цели
              </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 pt-2">
                        <input
                            id="sound-alert-toggle"
                            type="checkbox"
                            checked={soundAlerts}
                            onChange={(e) => setSoundAlerts(e.target.checked)}
                            className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                        />
                        <label htmlFor="sound-alert-toggle" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                            Включить звуковые сигналы при замере и предупреждениях о гипогликемии
                        </label>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                            Сохранить параметры
                        </button>
                        {saveMessage && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{saveMessage}</span>
              </span>
                        )}
                    </div>
                </form>
            </div>

            {/* Doctor Summary Report Preview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs print:p-0 print:border-none transition-colors">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            Сводная выписка для врача-эндокринолога
                        </h3>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">Сформировано: {new Date().toLocaleDateString('ru-RU')}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-5">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Время в целевом (TIR)</div>
                        <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{stats.tirPercent}%</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">Цель &gt; 70%</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Средний сахар</div>
                        <div className="text-xl font-bold text-sky-700 dark:text-sky-400 mt-1">{stats.averageMmol} ммоль/л</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">SD: ±{stats.standardDeviation}</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Расчетный HbA1c</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.estimatedHbA1c}%</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">Цель &lt; 7.0%</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Частота гипо (&lt;3.9)</div>
                        <div className="text-xl font-bold text-rose-700 dark:text-rose-400 mt-1">{stats.hypoPercent}%</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">Цель &lt; 4%</div>
                    </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 bg-sky-50 dark:bg-sky-950/40 p-3 rounded-xl border border-sky-100 dark:border-sky-900/60">
                    💡 <strong>Рекомендация:</strong> Распечатайте эту сводку или сохраните в PDF для планового визита к эндокринологу. Она содержит ключевые маркеры компенсации СД1, достаточные для оценки доз инсулина и выписки льготных рецептов.
                </p>
            </div>

            {/* Backup & Data Management */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Резервная копия и безопасность данных</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Все ваши данные о сахаре, списках и счетах надежно хранятся на вашем устройстве и доступны офлайн. Вы можете скачать резервную копию или загрузить ее на другом телефоне/компьютере.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleExportJSON}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        <span>Скачать резервную копию (JSON)</span>
                    </button>

                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Восстановить из файла</span>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportJSON}
                            className="hidden"
                        />
                    </label>

                    <button
                        onClick={() => {
                            if (window.confirm('Вы уверены, что хотите сбросить данные к демонстрационным?')) {
                                onResetData();
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold transition-colors cursor-pointer ml-auto"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Сбросить данные</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
