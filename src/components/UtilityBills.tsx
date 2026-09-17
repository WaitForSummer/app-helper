import React, { useState, useMemo } from 'react';
import {
    Zap,
    Phone,
    CheckCircle2,
    AlertCircle,
    Plus,
    Trash2,
    Calendar,
    CreditCard,
    History,
    Check,
    RotateCcw,
    Receipt,
    Hash,
} from 'lucide-react';
import { UtilityBill, BillType } from '../types';

interface UtilityBillsProps {
    bills: UtilityBill[];
    onTogglePaid: (id: string) => void;
    onAddBill: (bill: Omit<UtilityBill, 'id'>) => void;
    onDeleteBill: (id: string) => void;
}

export const UtilityBills: React.FC<UtilityBillsProps> = ({
                                                              bills,
                                                              onTogglePaid,
                                                              onAddBill,
                                                              onDeleteBill,
                                                          }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'electricity' | 'phone'>('all');
    const [showAddModal, setShowAddModal] = useState(false);

    // New Bill form state
    const [billType, setBillType] = useState<BillType>('electricity');
    const [billTitle, setBillTitle] = useState('Счет за электроэнергию (Свет)');
    const [providerOrAccount, setProviderOrAccount] = useState('Мосэнергосбыт / Энергосбыт (Л/с: 48192-302-81)');
    const [amountDue, setAmountDue] = useState('1850');
    const [dueDate, setDueDate] = useState(() => {
        const d = new Date();
        d.setDate(25);
        return d.toISOString().split('T')[0];
    });
    const [meterReadingPrev, setMeterReadingPrev] = useState('14530');
    const [meterReadingCurr, setMeterReadingCurr] = useState('14820');
    const [phoneNumber, setPhoneNumber] = useState('+7 (916) 482-19-45');
    const [tariffName, setTariffName] = useState('Безлимит + 30 Гб');
    const [notes, setNotes] = useState('');

    // Calculations
    const electricityBills = useMemo(() => bills.filter((b) => b.type === 'electricity'), [bills]);
    const phoneBills = useMemo(() => bills.filter((b) => b.type === 'phone'), [bills]);

    const unpaidBills = useMemo(() => bills.filter((b) => !b.isPaid), [bills]);
    const totalDueUnpaid = useMemo(
        () => unpaidBills.reduce((acc, b) => acc + b.amountDue, 0),
        [unpaidBills]
    );
    const totalPaid = useMemo(
        () => bills.filter((b) => b.isPaid).reduce((acc, b) => acc + b.amountDue, 0),
        [bills]
    );

    const displayedBills = useMemo(() => {
        if (activeTab === 'electricity') return electricityBills;
        if (activeTab === 'phone') return phoneBills;
        return bills;
    }, [bills, activeTab, electricityBills, phoneBills]);

    const handleTypeChange = (type: BillType) => {
        setBillType(type);
        if (type === 'electricity') {
            setBillTitle('Счет за свет (Электроэнергия)');
            setProviderOrAccount('Энергосбыт (Л/с: ...)');
            setAmountDue('1800');
        } else if (type === 'phone') {
            setBillTitle('Мобильная связь (Номер телефона)');
            setProviderOrAccount('МТС / Билайн / МегаФон');
            setAmountDue('650');
        } else {
            setBillTitle('Коммунальный платеж');
            setProviderOrAccount('ЖКХ / Управляющая компания');
            setAmountDue('2500');
        }
    };

    const handleCreateBill = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(amountDue);
        if (isNaN(amount) || amount <= 0) return;

        onAddBill({
            type: billType,
            title: billTitle.trim(),
            providerOrAccount: providerOrAccount.trim(),
            amountDue: amount,
            dueDate,
            isPaid: false,
            meterReadingPrevious: meterReadingPrev ? parseFloat(meterReadingPrev) : undefined,
            meterReadingCurrent: meterReadingCurr ? parseFloat(meterReadingCurr) : undefined,
            phoneNumber: phoneNumber.trim() || undefined,
            tariffName: tariffName.trim() || undefined,
            notes: notes.trim() || undefined,
        });

        setShowAddModal(false);
    };

    return (
        <div className="space-y-6 w-full">
            {/* Header Overview Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Оплата счетов: Свет и Телефон</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Контроль начислений, учет счетчиков электроэнергии и дат абонплаты связи
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Добавить счет</span>
                </button>
            </div>

            {/* Summary Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Unpaid sum */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>К оплате сейчас</span>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="mt-2 text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
                        {totalDueUnpaid.toLocaleString('ru-RU')} ₽
                    </div>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {unpaidBills.length > 0 ? `Ожидает оплаты: ${unpaidBills.length} счетов` : 'Все текущие счета оплачены!'}
                    </p>
                </div>

                {/* Paid sum */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Оплачено за период</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="mt-2 text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {totalPaid.toLocaleString('ru-RU')} ₽
                    </div>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Включая квитанции за свет и связь</p>
                </div>

                {/* Quick Shortcuts to Specific Bill Categories */}
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-colors">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Быстрый переход:</span>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                            onClick={() => setActiveTab('electricity')}
                            className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === 'electricity'
                                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Счет за свет</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('phone')}
                            className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === 'phone'
                                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Телефон</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium w-fit flex-wrap">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activeTab === 'all'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                >
                    Все счета ({bills.length})
                </button>
                <button
                    onClick={() => setActiveTab('electricity')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activeTab === 'electricity'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Электроэнергия ({electricityBills.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab('phone')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activeTab === 'phone'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                >
                    <Phone className="w-3.5 h-3.5 text-sky-500" />
                    <span>Связь и номера ({phoneBills.length})</span>
                </button>
            </div>

            {/* Bills Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedBills.map((bill) => {
                    const isElec = bill.type === 'electricity';
                    const isPhone = bill.type === 'phone';
                    const kwhConsumption =
                        bill.meterReadingCurrent !== undefined && bill.meterReadingPrevious !== undefined
                            ? bill.meterReadingCurrent - bill.meterReadingPrevious
                            : null;

                    return (
                        <div
                            key={bill.id}
                            className={`rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                                bill.isPaid
                                    ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-90'
                                    : 'bg-white dark:bg-slate-900 border-amber-200/80 dark:border-amber-900/70 shadow-xs ring-1 ring-amber-100 dark:ring-amber-950/40'
                            }`}
                        >
                            {/* Top Row: Type Icon, Title & Status */}
                            <div>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                isElec
                                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                                    : isPhone
                                                        ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                            }`}
                                        >
                                            {isElec ? <Zap className="w-5 h-5" /> : isPhone ? <Phone className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight">
                                                {bill.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{bill.providerOrAccount}</p>
                                        </div>
                                    </div>

                                    <span
                                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex-shrink-0 ${
                                            bill.isPaid
                                                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
                                                : 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80'
                                        }`}
                                    >
                    {bill.isPaid ? 'Оплачено' : 'К оплате'}
                  </span>
                                </div>

                                {/* Specific details for Electricity */}
                                {isElec && (
                                    <div className="mt-3.5 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100/80 dark:border-amber-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500 dark:text-slate-400">Показания счетчика:</span>
                                            <span className="font-mono font-semibold">
                        {bill.meterReadingPrevious ?? '—'} → {bill.meterReadingCurrent ?? '—'}
                      </span>
                                        </div>
                                        {kwhConsumption !== null && (
                                            <div className="flex items-center justify-between pt-1 border-t border-amber-200/50 dark:border-amber-800/50">
                                                <span className="text-slate-500 dark:text-slate-400">Расход за месяц:</span>
                                                <strong className="text-amber-800 dark:text-amber-300 font-bold">{kwhConsumption} кВт⋅ч</strong>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Specific details for Phone */}
                                {isPhone && (
                                    <div className="mt-3.5 p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100/80 dark:border-sky-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                                        {bill.phoneNumber && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500 dark:text-slate-400">Номер телефона:</span>
                                                <span className="font-mono font-bold text-sky-900 dark:text-sky-300">{bill.phoneNumber}</span>
                                            </div>
                                        )}
                                        {bill.tariffName && (
                                            <div className="flex items-center justify-between pt-1 border-t border-sky-200/50 dark:border-sky-800/50">
                                                <span className="text-slate-500 dark:text-slate-400">Тариф:</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-200">{bill.tariffName}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {bill.notes && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">«{bill.notes}»</p>
                                )}
                            </div>

                            {/* Bottom Row: Amount Due, Due Date & Action */}
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                <div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                        {bill.amountDue.toLocaleString('ru-RU')} ₽
                                    </div>
                                    <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                      {bill.isPaid && bill.paidDate
                          ? `Оплачено ${new Date(bill.paidDate).toLocaleDateString('ru-RU')}`
                          : `Срок: до ${new Date(bill.dueDate).toLocaleDateString('ru-RU')}`}
                    </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onTogglePaid(bill.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                            bill.isPaid
                                                ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                        }`}
                                    >
                                        {bill.isPaid ? (
                                            <>
                                                <RotateCcw className="w-3.5 h-3.5" />
                                                <span>Вернуть</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                <span>Оплатить</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => onDeleteBill(bill.id)}
                                        className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                        title="Удалить"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Bill Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto transition-colors">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Добавить счет к оплате</h3>

                        <form onSubmit={handleCreateBill} className="space-y-4">
                            {/* Type selection */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Категория счета
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('electricity')}
                                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                                            billType === 'electricity'
                                                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <Zap className="w-4 h-4" />
                                        <span>Свет (электро)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('phone')}
                                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                                            billType === 'phone'
                                                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span>Телефон</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('other_utility')}
                                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                                            billType === 'other_utility'
                                                ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-600 shadow-xs'
                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        <Receipt className="w-4 h-4" />
                                        <span>Другое ЖКХ</span>
                                    </button>
                                </div>
                            </div>

                            {/* Title & Provider */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Название счета
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={billTitle}
                                    onChange={(e) => setBillTitle(e.target.value)}
                                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-sky-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Поставщик / Лицевой счет
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={providerOrAccount}
                                    onChange={(e) => setProviderOrAccount(e.target.value)}
                                    placeholder="напр. Энергосбыт (Л/с 12345678)"
                                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-sky-500"
                                />
                            </div>

                            {/* Amount & Due Date */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                        Сумма к оплате (₽)
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        min="0"
                                        required
                                        value={amountDue}
                                        onChange={(e) => setAmountDue(e.target.value)}
                                        className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-sky-500 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                        Срок оплаты (до)
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-sky-500"
                                    />
                                </div>
                            </div>

                            {/* Conditional: Electricity meter inputs */}
                            {billType === 'electricity' && (
                                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-2.5">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                    Показания электросчетчика (кВт⋅ч)
                  </span>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div>
                                            <label className="text-[11px] text-amber-800 dark:text-amber-300">Предыдущие:</label>
                                            <input
                                                type="number"
                                                placeholder="напр. 14500"
                                                value={meterReadingPrev}
                                                onChange={(e) => setMeterReadingPrev(e.target.value)}
                                                className="w-full text-xs font-mono py-1.5 px-2 bg-white dark:bg-slate-800 dark:text-slate-100 rounded border border-amber-300 dark:border-amber-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] text-amber-800 dark:text-amber-300">Текущие:</label>
                                            <input
                                                type="number"
                                                placeholder="напр. 14820"
                                                value={meterReadingCurr}
                                                onChange={(e) => setMeterReadingCurr(e.target.value)}
                                                className="w-full text-xs font-mono py-1.5 px-2 bg-white dark:bg-slate-800 dark:text-slate-100 rounded border border-amber-300 dark:border-amber-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Conditional: Phone number & Tariff inputs */}
                            {billType === 'phone' && (
                                <div className="p-3 bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 rounded-xl space-y-2.5">
                  <span className="text-xs font-bold text-sky-900 dark:text-sky-200 block">
                    Реквизиты номера телефона
                  </span>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div>
                                            <label className="text-[11px] text-sky-800 dark:text-sky-300">Номер телефона:</label>
                                            <input
                                                type="text"
                                                placeholder="+7 (999) 000-00-00"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="w-full text-xs font-mono py-1.5 px-2 bg-white dark:bg-slate-800 dark:text-slate-100 rounded border border-sky-300 dark:border-sky-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] text-sky-800 dark:text-sky-300">Тариф / Пакет:</label>
                                            <input
                                                type="text"
                                                placeholder="напр. Мой Онлайн"
                                                value={tariffName}
                                                onChange={(e) => setTariffName(e.target.value)}
                                                className="w-full text-xs py-1.5 px-2 bg-white dark:bg-slate-800 dark:text-slate-100 rounded border border-sky-300 dark:border-sky-700"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Примечание
                                </label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="напр. оплатить через СберБанк Онлайн до 25 числа"
                                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-sky-500"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-sm font-semibold text-white shadow-sm cursor-pointer"
                                >
                                    Сохранить счет
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
