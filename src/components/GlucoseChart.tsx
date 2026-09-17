import React, { useState, useMemo } from 'react';
import { GlucoseEntry, AppSettings } from '../types';
import { formatGlucose, getGlucoseCategory, getCategoryDetails, TAG_LABELS } from '../utils/diabetesCalc';

interface GlucoseChartProps {
    entries: GlucoseEntry[];
    settings: AppSettings;
    onToggleUnit?: () => void;
}

type PeriodFilter = 'today' | '7days' | '14days' | 'all';

export const GlucoseChart: React.FC<GlucoseChartProps> = ({ entries, settings, onToggleUnit }) => {
    const [period, setPeriod] = useState<PeriodFilter>('7days');
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const [hoveredEntryId, setHoveredEntryId] = useState<string | null>(null);

    // Filter entries according to period, sorted chronologically ascending (oldest on left -> newest on right)
    const filteredEntries = useMemo(() => {
        const now = new Date();
        const sorted = [...entries].sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime() || 0;
            const timeB = new Date(b.timestamp).getTime() || 0;
            if (timeA !== timeB) return timeA - timeB;
            // If timestamps match, ensure newer generated ID is placed further to the right
            return a.id.localeCompare(b.id);
        });

        if (period === 'today') {
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            return sorted.filter((e) => new Date(e.timestamp).getTime() >= todayStart);
        }
        if (period === '7days') {
            const past = now.getTime() - 7 * 24 * 3600 * 1000;
            return sorted.filter((e) => new Date(e.timestamp).getTime() >= past);
        }
        if (period === '14days') {
            const past = now.getTime() - 14 * 24 * 3600 * 1000;
            return sorted.filter((e) => new Date(e.timestamp).getTime() >= past);
        }
        return sorted;
    }, [entries, period]);

    const activeEntry = useMemo(() => {
        return filteredEntries.find((e) => e.id === selectedEntryId) || null;
    }, [filteredEntries, selectedEntryId]);

    // Chart dimensions & scaling
    const width = 800;
    const height = 295;
    const padding = { top: 24, right: 30, bottom: 50, left: 45 };

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // Scale Y: glucose min/max range with margin (e.g. 2.0 to 16.0 mmol)
    const yMin = 2.0;
    const yMax = Math.max(16.0, ...filteredEntries.map((e) => e.glucose + 1.5));

    const getY = (val: number) => {
        const clamped = Math.min(yMax, Math.max(yMin, val));
        return padding.top + plotHeight - ((clamped - yMin) / (yMax - yMin)) * plotHeight;
    };

    // Target corridor Y coordinates
    const yTargetMin = getY(settings.targetMin); // 3.9
    const yTargetMax = getY(settings.targetMax); // 10.0

    // Points mapping
    const points = useMemo(() => {
        if (filteredEntries.length === 0) return [];
        if (filteredEntries.length === 1) {
            return [
                {
                    entry: filteredEntries[0],
                    x: padding.left + plotWidth / 2,
                    y: getY(filteredEntries[0].glucose),
                },
            ];
        }

        return filteredEntries.map((entry, index) => {
            const x = padding.left + (index / (filteredEntries.length - 1)) * plotWidth;
            const y = getY(entry.glucose);
            return { entry, x, y };
        });
    }, [filteredEntries, plotWidth, yMin, yMax]);

    const hoveredPoint = useMemo(() => {
        return points.find((p) => p.entry.id === hoveredEntryId) || null;
    }, [points, hoveredEntryId]);

    const activeFloatingPoint = useMemo(() => {
        if (hoveredPoint) return hoveredPoint;
        if (selectedEntryId) {
            return points.find((p) => p.entry.id === selectedEntryId) || null;
        }
        return null;
    }, [hoveredPoint, points, selectedEntryId]);

    // Line path generator
    const linePath = useMemo(() => {
        if (points.length < 2) return '';
        return points.reduce((acc, pt, idx) => {
            return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
        }, '');
    }, [points]);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors duration-200 w-full">
            {/* Header with Period Tabs & Unit Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">График динамики гликемии</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Зеленая зона — целевой диапазон ({settings.targetMin} - {settings.targetMax} {settings.glucoseUnit === 'mmol' ? 'ммоль/л' : 'мг/дл'}) • Время: слева направо (свежие справа)
                    </p>
                </div>

                {/* Controls: Unit toggle & Period Selector */}
                <div className="flex items-center gap-2 flex-wrap">
                    {onToggleUnit && (
                        <button
                            onClick={onToggleUnit}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-sky-600 dark:text-sky-400 transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                            title="Переключить единицы: ммоль/л или мг/дл"
                        >
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">Ед:</span>
                            <span>{settings.glucoseUnit === 'mmol' ? 'ммоль/л' : 'мг/дл'}</span>
                        </button>
                    )}

                    {/* Period Selector */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
                        <button
                            onClick={() => setPeriod('today')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                period === 'today' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                        >
                            Сегодня
                        </button>
                        <button
                            onClick={() => setPeriod('7days')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                period === '7days' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                        >
                            7 дней
                        </button>
                        <button
                            onClick={() => setPeriod('14days')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                period === '14days' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                        >
                            14 дней
                        </button>
                        <button
                            onClick={() => setPeriod('all')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                period === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                        >
                            Все
                        </button>
                    </div>
                </div>
            </div>

            {/* SVG Chart */}
            {filteredEntries.length === 0 ? (
                <div className="h-60 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl">
                    <p className="text-sm font-medium text-slate-600">Нет данных о замерах за выбранный период</p>
                    <p className="text-xs text-slate-400 mt-1">Добавьте первый замер с помощью кнопки «+ Замер»</p>
                </div>
            ) : (
                <div className="relative overflow-x-auto">
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        className="w-full h-auto min-w-[500px] overflow-visible select-none"
                    >
                        <defs>
                            {/* Target corridor gradient */}
                            <linearGradient id="corridorGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.14" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.08" />
                            </linearGradient>
                        </defs>

                        {/* Target Corridor Background (3.9 - 10.0 mmol/L) */}
                        <rect
                            x={padding.left}
                            y={yTargetMax}
                            width={plotWidth}
                            height={Math.abs(yTargetMin - yTargetMax)}
                            fill="url(#corridorGrad)"
                        />

                        {/* Upper limit line (10.0 mmol/L) */}
                        <line
                            x1={padding.left}
                            y1={yTargetMax}
                            x2={padding.left + plotWidth}
                            y2={yTargetMax}
                            stroke="#d97706"
                            strokeDasharray="4 4"
                            strokeWidth="1.2"
                            opacity="0.75"
                        />
                        <text
                            x={padding.left + plotWidth - 6}
                            y={yTargetMax - 5}
                            textAnchor="end"
                            className="text-[10px] fill-amber-700 font-medium"
                        >
                            Верхняя цель: {settings.targetMax}
                        </text>

                        {/* Lower limit line (3.9 mmol/L - Hypo danger) */}
                        <line
                            x1={padding.left}
                            y1={yTargetMin}
                            x2={padding.left + plotWidth}
                            y2={yTargetMin}
                            stroke="#e11d48"
                            strokeDasharray="4 4"
                            strokeWidth="1.2"
                            opacity="0.8"
                        />
                        <text
                            x={padding.left + plotWidth - 6}
                            y={yTargetMin + 12}
                            textAnchor="end"
                            className="text-[10px] fill-rose-600 font-medium"
                        >
                            Гипогликемия: {settings.targetMin}
                        </text>

                        {/* Y Axis Grid & Labels */}
                        {[4, 8, 12, 16].map((gridVal) => {
                            const yPos = getY(gridVal);
                            return (
                                <g key={gridVal}>
                                    <line
                                        x1={padding.left}
                                        y1={yPos}
                                        x2={padding.left + plotWidth}
                                        y2={yPos}
                                        stroke="currentColor"
                                        className="text-slate-200 dark:text-slate-800"
                                        strokeWidth="1"
                                    />
                                    <text
                                        x={padding.left - 8}
                                        y={yPos + 4}
                                        textAnchor="end"
                                        className="text-[11px] fill-slate-400 dark:fill-slate-500 font-medium"
                                    >
                                        {gridVal}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Trend Connecting Line */}
                        {linePath && (
                            <path
                                d={linePath}
                                fill="none"
                                stroke="#0284c7"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {/* Vertical crosshair line on hovered point */}
                        {hoveredPoint && (
                            <line
                                x1={hoveredPoint.x}
                                y1={padding.top}
                                x2={hoveredPoint.x}
                                y2={height - padding.bottom}
                                stroke="#0ea5e9"
                                strokeDasharray="3 3"
                                strokeWidth="1.5"
                                opacity="0.6"
                                className="pointer-events-none"
                            />
                        )}

                        {/* Data Node Points */}
                        {points.map((pt) => {
                            const category = getGlucoseCategory(pt.entry.glucose, settings);
                            const catDetails = getCategoryDetails(category);
                            const isSelected = selectedEntryId === pt.entry.id;
                            const isHovered = hoveredEntryId === pt.entry.id;

                            return (
                                <g key={pt.entry.id}>
                                    {/* Outer halo circle for hovered / selected */}
                                    {(isHovered || isSelected) && (
                                        <circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={isHovered ? 13 : 10}
                                            fill={catDetails.dotColor}
                                            opacity={isHovered ? 0.3 : 0.2}
                                            className="pointer-events-none transition-all duration-150"
                                        />
                                    )}

                                    {/* Main Node Circle */}
                                    <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r={isHovered ? 6.5 : isSelected ? 5.5 : 4}
                                        fill={catDetails.dotColor}
                                        stroke="#ffffff"
                                        strokeWidth={isHovered ? 2.5 : 2}
                                        className="pointer-events-none transition-all duration-150"
                                    />

                                    {/* Insulin/Carb Indicator icon dot */}
                                    {(pt.entry.insulinShort || pt.entry.carbs) && (
                                        <circle
                                            cx={pt.x}
                                            cy={pt.y - (isHovered ? 11 : 8)}
                                            r={isHovered ? 2.5 : 2}
                                            fill="#0284c7"
                                            className="pointer-events-none transition-all duration-150"
                                        />
                                    )}

                                    {/* Transparent enlarged hit-circle for smooth hover without jitter */}
                                    <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r="18"
                                        fill="transparent"
                                        className="cursor-pointer"
                                        onMouseEnter={() => setHoveredEntryId(pt.entry.id)}
                                        onMouseLeave={() => setHoveredEntryId(null)}
                                        onClick={() => setSelectedEntryId((prev) => (prev === pt.entry.id ? null : pt.entry.id))}
                                    />
                                </g>
                            );
                        })}

                        {/* Stable Floating Tooltip directly on SVG */}
                        {activeFloatingPoint && (() => {
                            const { entry, x, y } = activeFloatingPoint;
                            const category = getGlucoseCategory(entry.glucose, settings);
                            const catDetails = getCategoryDetails(category);
                            const tagLabel = TAG_LABELS[entry.tag]?.label || '';
                            const date = new Date(entry.timestamp);
                            const timeStr = date.toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            const hasExtra = !!(entry.insulinShort || entry.insulinLong || entry.carbs);
                            const tipWidth = 148;
                            const tipHeight = hasExtra ? 58 : 46;
                            const tipY = y < 75 ? y + 14 : y - tipHeight - 12;
                            const tipX = Math.max(padding.left, Math.min(width - padding.right - tipWidth, x - tipWidth / 2));

                            return (
                                <g className="pointer-events-none transition-all duration-100">
                                    {/* Tooltip Card Background */}
                                    <rect
                                        x={tipX}
                                        y={tipY}
                                        width={tipWidth}
                                        height={tipHeight}
                                        rx="8"
                                        className="fill-slate-900/95 dark:fill-slate-800/95 stroke-slate-700/80 dark:stroke-slate-600/80"
                                        strokeWidth="1"
                                        filter="drop-shadow(0 4px 6px rgba(0,0,0,0.25))"
                                    />
                                    {/* Category color dot */}
                                    <circle cx={tipX + 14} cy={tipY + 16} r="4.5" fill={catDetails.dotColor} />
                                    {/* Glucose value & unit */}
                                    <text
                                        x={tipX + 24}
                                        y={tipY + 20}
                                        className="text-[13px] font-extrabold fill-white"
                                    >
                                        {formatGlucose(entry.glucose, settings.glucoseUnit)}
                                        <tspan className="text-[10px] font-normal fill-slate-300">
                                            {' '}{settings.glucoseUnit === 'mmol' ? 'ммоль/л' : 'мг/дл'}
                                        </tspan>
                                    </text>
                                    {/* Time & Tag */}
                                    <text
                                        x={tipX + 14}
                                        y={tipY + 35}
                                        className="text-[10px] font-medium fill-slate-300"
                                    >
                                        {timeStr} • {tagLabel}
                                    </text>
                                    {/* Insulin/carbs badge if present */}
                                    {hasExtra && (
                                        <text
                                            x={tipX + 14}
                                            y={tipY + 49}
                                            className="text-[9px] font-bold fill-sky-300"
                                        >
                                            {entry.insulinShort ? `Болюс ${entry.insulinShort} ед. ` : ''}
                                            {entry.carbs ? `${entry.carbs} ${settings.carbUnitName}` : ''}
                                        </text>
                                    )}
                                </g>
                            );
                        })()}

                        {/* X Axis Time Labels */}
                        {points.map((pt, idx) => {
                            // Only render label for first, last, and intermittent points to avoid clutter
                            const shouldShowLabel =
                                idx === 0 ||
                                idx === points.length - 1 ||
                                (points.length > 5 && idx % Math.ceil(points.length / 5) === 0);

                            if (!shouldShowLabel) return null;

                            const date = new Date(pt.entry.timestamp);
                            const timeStr = date.toLocaleTimeString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit',
                            });
                            const dayStr = date.toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                            });

                            return (
                                <text
                                    key={`label-${pt.entry.id}`}
                                    x={pt.x}
                                    y={height - padding.bottom + 18}
                                    textAnchor="middle"
                                    className="text-[10px] fill-slate-500 font-medium"
                                >
                                    {period === 'today' ? timeStr : `${dayStr} ${timeStr}`}
                                </text>
                            );
                        })}

                        {/* Direction Indicator: left (earlier) to right (latest) */}
                        {points.length > 1 && (
                            <g className="select-none pointer-events-none opacity-80">
                                <text
                                    x={padding.left}
                                    y={height - 10}
                                    textAnchor="start"
                                    className="text-[10px] fill-slate-400 dark:fill-slate-500 font-medium"
                                >
                                    ← Ранее
                                </text>
                                <text
                                    x={padding.left + plotWidth}
                                    y={height - 10}
                                    textAnchor="end"
                                    className="text-[10px] fill-sky-600 dark:fill-sky-400 font-bold"
                                >
                                    Свежие замеры →
                                </text>
                            </g>
                        )}
                    </svg>
                </div>
            )}

            {/* Interactive Tooltip Card for Selected Point */}
            {activeEntry && (
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-xs"
                            style={{
                                backgroundColor: getCategoryDetails(
                                    getGlucoseCategory(activeEntry.glucose, settings)
                                ).dotColor,
                            }}
                        >
                            {formatGlucose(activeEntry.glucose, settings.glucoseUnit)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                  {TAG_LABELS[activeEntry.tag].label}
                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(activeEntry.timestamp).toLocaleString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                  })}
                </span>
                            </div>
                            {activeEntry.notes && (
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 italic">«{activeEntry.notes}»</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
                        {activeEntry.insulinShort !== undefined && (
                            <span className="px-2.5 py-1 rounded-md bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 font-medium">
                Болюс: <strong>{activeEntry.insulinShort} ед.</strong>
              </span>
                        )}
                        {activeEntry.insulinLong !== undefined && (
                            <span className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 font-medium">
                Базал: <strong>{activeEntry.insulinLong} ед.</strong>
              </span>
                        )}
                        {activeEntry.carbs !== undefined && (
                            <span className="px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-medium">
                Углеводы: <strong>{activeEntry.carbs} {settings.carbUnitName}</strong>
              </span>
                        )}
                        <button
                            onClick={() => setSelectedEntryId(null)}
                            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline ml-2 cursor-pointer"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}

            {/* Chart Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Гипо (&lt; 3.9)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Норма (3.9 - 10.0)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Выше (10.1 - 13.9)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-700" />
                    <span>Гипер (&gt; 13.9)</span>
                </div>
            </div>
        </div>
    );
};
