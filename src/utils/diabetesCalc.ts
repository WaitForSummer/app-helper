import { GlucoseEntry, GlucoseRangeCategory, GlucoseUnit, AppSettings, GlucoseContextTag } from '../types';

export const TAG_LABELS: Record<GlucoseContextTag, { label: string; short: string; color: string }> = {
    fasting: { label: 'Натощак (утро)', short: 'Натощак', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    before_meal: { label: 'Перед едой', short: 'До еды', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    after_meal: { label: 'Через 2ч после еды', short: 'После еды', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    bedtime: { label: 'Перед сном', short: 'На ночь', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    night: { label: 'Ночной замер (03:00)', short: 'Ночь', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    exercise: { label: 'Спорт / Физнагрузка', short: 'Спорт', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    unwell: { label: 'Плохое самочувствие', short: 'Симптом', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export function convertMmolToMgDl(mmol: number): number {
    return Math.round(mmol * 18.0182);
}

export function convertMgDlToMmol(mgdl: number): number {
    return Number((mgdl / 18.0182).toFixed(1));
}

export function formatGlucose(mmol: number, unit: GlucoseUnit): string {
    if (unit === 'mgdl') {
        return `${convertMmolToMgDl(mmol)}`;
    }
    return mmol.toFixed(1);
}

export function getGlucoseCategory(mmol: number, settings: AppSettings): GlucoseRangeCategory {
    if (mmol < settings.hypoThreshold) return 'hypo';
    if (mmol <= settings.hyperThreshold) return 'target';
    if (mmol <= settings.veryHighThreshold) return 'high';
    return 'very_high';
}

export function getCategoryDetails(category: GlucoseRangeCategory) {
    switch (category) {
        case 'hypo':
            return {
                label: 'Гипогликемия',
                badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
                dotColor: '#e11d48',
                textColor: 'text-rose-600',
                recommendation: 'Срочно примите 15-20 г быстрых углеводов: 200 мл сладкого сока, 4 куска сахара или декстрозу. Перемерьте через 15 минут!',
            };
        case 'target':
            return {
                label: 'В целевом диапазоне',
                badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                dotColor: '#059669',
                textColor: 'text-emerald-600',
                recommendation: 'Отличный уровень! Целевой диапазон для диабета 1 типа соблюден.',
            };
        case 'high':
            return {
                label: 'Выше целевого',
                badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
                dotColor: '#d97706',
                textColor: 'text-amber-600',
                recommendation: 'Уровень повышен. Учтите активный инсулин («инсулин на борту»), выпейте чистой воды.',
            };
        case 'very_high':
            return {
                label: 'Значительная гипергликемия',
                badgeClass: 'bg-red-100 text-red-900 border-red-300',
                dotColor: '#b91c1c',
                textColor: 'text-red-700',
                recommendation: 'Высокий сахар! Проверьте кетоны в моче полоской, сделайте коррекционную подколку и пейте воду.',
            };
    }
}

export interface GlucoseStatistics {
    count: number;
    averageMmol: number;
    minMmol: number;
    maxMmol: number;
    tirPercent: number; // Time in Range %
    hypoPercent: number; // % < 3.9
    hyperPercent: number; // % > 10.0
    veryHighPercent: number; // % > 13.9
    estimatedHbA1c: number; // ADAG formula: (avg + 2.59) / 1.59
    standardDeviation: number;
}

export function calculateStatistics(entries: GlucoseEntry[], settings: AppSettings): GlucoseStatistics {
    if (!entries.length) {
        return {
            count: 0,
            averageMmol: 0,
            minMmol: 0,
            maxMmol: 0,
            tirPercent: 0,
            hypoPercent: 0,
            hyperPercent: 0,
            veryHighPercent: 0,
            estimatedHbA1c: 0,
            standardDeviation: 0,
        };
    }

    const values = entries.map((e) => e.glucose);
    const sum = values.reduce((acc, v) => acc + v, 0);
    const avg = sum / values.length;

    let hypoCount = 0;
    let targetCount = 0;
    let hyperCount = 0;
    let veryHighCount = 0;

    values.forEach((val) => {
        if (val < settings.hypoThreshold) hypoCount++;
        else if (val <= settings.hyperThreshold) targetCount++;
        else if (val <= settings.veryHighThreshold) hyperCount++;
        else veryHighCount++;
    });

    const total = values.length;
    const variance = values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / total;
    const sd = Math.sqrt(variance);

    // ADAG formula: HbA1c (%) = (average glucose in mmol/L + 2.59) / 1.59
    const estimatedHbA1c = Number(((avg + 2.59) / 1.59).toFixed(1));

    return {
        count: total,
        averageMmol: Number(avg.toFixed(1)),
        minMmol: Number(Math.min(...values).toFixed(1)),
        maxMmol: Number(Math.max(...values).toFixed(1)),
        tirPercent: Math.round((targetCount / total) * 100),
        hypoPercent: Math.round((hypoCount / total) * 100),
        hyperPercent: Math.round(((hyperCount + veryHighCount) / total) * 100),
        veryHighPercent: Math.round((veryHighCount / total) * 100),
        estimatedHbA1c: isNaN(estimatedHbA1c) ? 0 : estimatedHbA1c,
        standardDeviation: Number(sd.toFixed(1)),
    };
}
