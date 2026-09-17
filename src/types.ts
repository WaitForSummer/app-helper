export type GlucoseUnit = 'mmol' | 'mgdl';

export type GlucoseContextTag =
    | 'fasting'      // Натощак
    | 'before_meal'  // Перед едой
    | 'after_meal'   // Через 2ч после еды
    | 'bedtime'      // Перед сном
    | 'night'        // Ночной (03:00)
    | 'exercise'     // Спорт / активность
    | 'unwell';      // Плохое самочувствие / подозрение на гипо

export interface GlucoseEntry {
    id: string;
    glucose: number; // stored in mmol/L
    timestamp: string; // ISO string
    tag: GlucoseContextTag;
    insulinShort?: number; // Короткий инсулин (ед.)
    insulinLong?: number;  // Продленный инсулин (ед.)
    carbs?: number;        // ХЕ (Хлебные единицы)
    notes?: string;        // Примечание
}

export type GlucoseRangeCategory = 'hypo' | 'target' | 'high' | 'very_high';

export interface Reminder {
    id: string;
    title: string;
    time: string; // HH:mm
    type: 'glucose' | 'insulin_long' | 'insulin_short' | 'custom';
    enabled: boolean;
    repeatDaily: boolean;
    note?: string;
}

export interface DoctorAppointment {
    id: string;
    doctorType: string; // e.g. "Эндокринолог", "Офтальмолог", "Анализ HbA1c"
    doctorName?: string;
    clinicAddress?: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    notes?: string;
    completed: boolean;
}

export interface ShoppingCategoryItem {
    id: string;
    name: string;
    icon: string;
    color?: string;
    isDefault?: boolean;
}

export type ShoppingCategory =
    | 'groceries'
    | 'pharmacy'
    | 'household'
    | 'diabetes_supplies'
    | 'hypo_fast_carbs'
    | 'other'
    | (string & {});

export interface ShoppingItem {
    id: string;
    title: string;
    category: string;
    amount?: string;
    isPurchased: boolean;
    createdAt: string;
}

export type BillType = 'electricity' | 'phone' | 'internet' | 'other_utility';

export interface UtilityBill {
    id: string;
    type: BillType;
    title: string; // e.g. "Электроэнергия (Квартира)", "Мобильный номер (+7 999 123-45-67)"
    providerOrAccount: string; // Лицевой счет или Оператор (МТС, Мосэнергосбыт)
    amountDue: number; // руб.
    dueDate: string; // YYYY-MM-DD
    isPaid: boolean;
    paidDate?: string;
    // Extra fields for electricity
    meterReadingPrevious?: number;
    meterReadingCurrent?: number;
    // Extra fields for phone
    phoneNumber?: string;
    tariffName?: string;
    notes?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
    id: string;
    name: string;
    amount: string; // e.g. "200 г", "1 шт"
    calories: number; // ккал
    carbs: number; // граммы углеводов
    breadUnits: number; // ХЕ (Хлебные единицы)
}

export interface MealEntry {
    id: string;
    timestamp: string; // ISO string
    mealType: MealType;
    title?: string;
    items: FoodItem[];
    totalCalories: number;
    totalCarbs: number;
    totalBreadUnits: number;
    insulinBolus?: number; // Введенный болюс на этот прием пищи
    notes?: string;
}

export interface FavoriteMeal {
    id: string;
    name: string;
    category?: string; // e.g. "Завтрак", "Гарниры", "Перекусы"
    amount: string; // e.g. "200 г"
    calories: number;
    carbs: number; // граммы углеводов
    breadUnits: number; // ХЕ
    notes?: string;
}

export type AppTheme = 'light' | 'dark';

export interface AppSettings {
    glucoseUnit: GlucoseUnit;
    targetMin: number; // default 3.9 mmol/L
    targetMax: number; // default 10.0 mmol/L
    hypoThreshold: number; // default 3.9
    hyperThreshold: number; // default 10.0
    veryHighThreshold: number; // default 13.9
    soundAlerts: boolean;
    carbUnitName: string; // default "ХЕ" (10-12 г углев.)
    gramsPerCarbUnit: number; // default 11g
    theme: AppTheme; // 'light' or 'dark'
}
