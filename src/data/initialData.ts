import { GlucoseEntry, Reminder, DoctorAppointment, ShoppingItem, UtilityBill, AppSettings } from '../types';

export const defaultSettings: AppSettings = {
    glucoseUnit: 'mmol',
    targetMin: 3.9,
    targetMax: 10.0,
    hypoThreshold: 3.9,
    hyperThreshold: 10.0,
    veryHighThreshold: 13.9,
    soundAlerts: true,
    carbUnitName: 'ХЕ',
    gramsPerCarbUnit: 11,
    theme: 'light',
};

// Generate realistic log entries strictly in the past so new measurements always appear on the right
const now = new Date();
const formatPastHoursISO = (hoursAgo: number) => {
    return new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();
};

export const initialGlucoseEntries: GlucoseEntry[] = [
    // Today (in ascending chronological order: earlier morning -> afternoon, all strictly in past)
    {
        id: 'g-1',
        glucose: 5.6,
        timestamp: formatPastHoursISO(7.5),
        tag: 'fasting',
        insulinLong: 14,
        notes: 'Натощак после пробуждения',
    },
    {
        id: 'g-2',
        glucose: 7.8,
        timestamp: formatPastHoursISO(5.0),
        tag: 'after_meal',
        carbs: 4.5,
        insulinShort: 5,
        notes: 'Овсянка с ягодами, кофе',
    },
    {
        id: 'g-3',
        glucose: 5.2,
        timestamp: formatPastHoursISO(2.5),
        tag: 'before_meal',
        insulinShort: 6,
        carbs: 5.0,
        notes: 'Гречка с индейкой и салат',
    },
    {
        id: 'g-4',
        glucose: 6.9,
        timestamp: formatPastHoursISO(0.8),
        tag: 'after_meal',
        notes: 'Через 2 часа после обеда, прогулка 30 мин',
    },
    // Yesterday
    {
        id: 'g-5',
        glucose: 3.6,
        timestamp: formatPastHoursISO(16),
        tag: 'bedtime',
        notes: 'Легкая гипогликемия. Выпил 150 мл яблочного сока',
    },
    {
        id: 'g-6',
        glucose: 8.4,
        timestamp: formatPastHoursISO(20),
        tag: 'before_meal',
        carbs: 5.5,
        insulinShort: 7,
        notes: 'Ужин: паста из тв. сортов с рыбой',
    },
    {
        id: 'g-7',
        glucose: 6.1,
        timestamp: formatPastHoursISO(25),
        tag: 'after_meal',
        notes: 'Отличное самочувствие',
    },
    {
        id: 'g-8',
        glucose: 5.4,
        timestamp: formatPastHoursISO(31),
        tag: 'fasting',
        insulinLong: 14,
        notes: 'Хороший утренний сахар',
    },
    // 2 days ago
    {
        id: 'g-9',
        glucose: 11.2,
        timestamp: formatPastHoursISO(44),
        tag: 'after_meal',
        insulinShort: 1.5,
        notes: 'Подколка 1.5 ед. на коррекцию после пиццы',
    },
    {
        id: 'g-10',
        glucose: 6.3,
        timestamp: formatPastHoursISO(51),
        tag: 'before_meal',
        carbs: 4.0,
        insulinShort: 5,
        notes: 'Обед дома',
    },
    {
        id: 'g-11',
        glucose: 5.8,
        timestamp: formatPastHoursISO(56),
        tag: 'fasting',
        notes: 'Утро, базальный введен',
    },
    // 3 days ago
    {
        id: 'g-12',
        glucose: 6.7,
        timestamp: formatPastHoursISO(72),
        tag: 'after_meal',
        notes: 'Через 2 часа после обеда',
    },
    {
        id: 'g-13',
        glucose: 5.3,
        timestamp: formatPastHoursISO(78),
        tag: 'fasting',
        insulinLong: 14,
    },
];

export const initialReminders: Reminder[] = [
    {
        id: 'rem-1',
        title: 'Утренний замер сахара натощак',
        time: '08:00',
        type: 'glucose',
        enabled: true,
        repeatDaily: true,
        note: 'До завтрака, перед введением болюса',
    },
    {
        id: 'rem-2',
        title: 'Замер через 2 часа после обеда',
        time: '15:30',
        type: 'glucose',
        enabled: true,
        repeatDaily: true,
        note: 'Контроль пика действия ультракороткого инсулина',
    },
    {
        id: 'rem-3',
        title: 'Инсулин продленного действия (Базал)',
        time: '22:00',
        type: 'insulin_long',
        enabled: true,
        repeatDaily: true,
        note: '14 единиц (в бедро / ягодицу)',
    },
    {
        id: 'rem-4',
        title: 'Замер сахара перед сном',
        time: '23:00',
        type: 'glucose',
        enabled: true,
        repeatDaily: true,
        note: 'Убедиться, что сахар не ниже 5.5 ммоль/л на ночь',
    },
    {
        id: 'rem-5',
        title: 'Ночной контрольный замер (03:00)',
        time: '03:00',
        type: 'glucose',
        enabled: false,
        repeatDaily: true,
        note: 'Проверка эффекта Сомоджи или феномена утренней зари',
    },
];

export const initialAppointments: DoctorAppointment[] = [
    {
        id: 'apt-1',
        doctorType: 'Эндокринолог',
        doctorName: 'Др. Смирнова Е. В.',
        clinicAddress: 'Городская поликлиника №7, каб. 312',
        date: new Date(now.getTime() + 4 * 24 * 3600 * 1000).toISOString().split('T')[0], // 4 days from now
        time: '11:30',
        notes: 'Плановый осмотр, продление электронных рецептов на инсулин и тест-полоски',
        completed: false,
    },
    {
        id: 'apt-2',
        doctorType: 'Анализ крови на гликированный гемоглобин (HbA1c)',
        doctorName: 'Лаборатория Инвитро / Гемотест',
        clinicAddress: 'ул. Ленина, д. 45',
        date: new Date(now.getTime() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0], // 10 days from now
        time: '08:45',
        notes: 'Строго натощак. Сдается каждые 3 месяца для оценки компенсации',
        completed: false,
    },
    {
        id: 'apt-3',
        doctorType: 'Офтальмолог (осмотр глазного дна)',
        doctorName: 'Др. Васильев А. Н.',
        clinicAddress: 'Диабетический центр, каб. 18',
        date: new Date(now.getTime() - 28 * 24 * 3600 * 1000).toISOString().split('T')[0], // 28 days ago
        time: '14:00',
        notes: 'С расширением зрачка (фундус-линза). Признаков диабетической ретинопатии нет.',
        completed: true,
    },
];

export const initialShoppingItems: ShoppingItem[] = [
    {
        id: 'sh-1',
        title: 'Тест-полоски для глюкометра (50 шт.)',
        category: 'diabetes_supplies',
        amount: '2 упаковки',
        isPurchased: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'sh-2',
        title: 'Иглы для шприц-ручек 4мм или 5мм',
        category: 'diabetes_supplies',
        amount: '1 коробка (100 шт.)',
        isPurchased: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'sh-3',
        title: 'Сок яблочный 0.2л с сахаром (в карманы и сумку)',
        category: 'hypo_fast_carbs',
        amount: '6 пачек',
        isPurchased: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'sh-4',
        title: 'Таблетки декстрозы / Dextro4 (при гипогликемии)',
        category: 'hypo_fast_carbs',
        amount: '3 упаковки',
        isPurchased: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'sh-5',
        title: 'Спиртовые антисептические салфетки',
        category: 'diabetes_supplies',
        amount: '100 шт.',
        isPurchased: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'sh-6',
        title: 'Гречневая крупа ядрица и цельнозерновой хлеб',
        category: 'groceries',
        amount: '1 кг + 1 буханка',
        isPurchased: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'sh-7',
        title: 'Свежие огурцы, томаты, зелень (0 ХЕ)',
        category: 'groceries',
        amount: '1.5 кг',
        isPurchased: false,
        createdAt: new Date().toISOString(),
    },
];

export const initialUtilityBills: UtilityBill[] = [
    {
        id: 'bill-elec-1',
        type: 'electricity',
        title: 'Электроэнергия (Счет за свет)',
        providerOrAccount: 'Мосэнергосбыт / Энергосбыт (Л/с: 48192-302-81)',
        amountDue: 1840,
        dueDate: '2026-09-25',
        isPaid: false,
        meterReadingPrevious: 14210,
        meterReadingCurrent: 14530,
        notes: 'Расход: 320 кВт⋅ч. Оплатить до 25 числа, чтобы не начислялись пени',
    },
    {
        id: 'bill-phone-1',
        type: 'phone',
        title: 'Мобильная связь (Номер телефона)',
        providerOrAccount: 'МТС Тарифище / Мой Онлайн',
        phoneNumber: '+7 (916) 482-19-45',
        tariffName: 'Смарт Безлимит + 30 Гб',
        amountDue: 650,
        dueDate: '2026-09-20',
        isPaid: false,
        notes: 'Дата очередного списания ежемесячной абонплаты 20 числа',
    },
    {
        id: 'bill-phone-2',
        type: 'phone',
        title: 'Второй номер (Рабочий телефон / Сенсор CGM)',
        providerOrAccount: 'Билайн / Теле2',
        phoneNumber: '+7 (903) 771-34-12',
        tariffName: 'Связь для умных устройств / CGM ридер',
        amountDue: 250,
        dueDate: '2026-09-28',
        isPaid: true,
        paidDate: '2026-09-02',
        notes: 'Сим-карта в ридере мониторинга глюкозы. Оплачено за сентябрь.',
    },
    {
        id: 'bill-elec-hist',
        type: 'electricity',
        title: 'Электроэнергия за прошлый месяц',
        providerOrAccount: 'Энергосбыт (Л/с: 48192-302-81)',
        amountDue: 1720,
        dueDate: '2026-08-25',
        isPaid: true,
        paidDate: '2026-08-22',
        meterReadingPrevious: 13910,
        meterReadingCurrent: 14210,
        notes: 'Оплачено вовремя через интернет-банк',
    },
];
