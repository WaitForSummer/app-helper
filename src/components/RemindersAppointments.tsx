import React, { useState, useEffect } from 'react';
import {
    Bell,
    Clock,
    Calendar,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Volume2,
    Play,
    RotateCcw,
    Stethoscope,
    Building2,
} from 'lucide-react';
import { Reminder, DoctorAppointment } from '../types';
import { soundManager } from '../utils/audioAlert';

interface RemindersAppointmentsProps {
    reminders: Reminder[];
    onToggleReminder: (id: string) => void;
    onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
    onDeleteReminder: (id: string) => void;
    appointments: DoctorAppointment[];
    onToggleAppointment: (id: string) => void;
    onAddAppointment: (appointment: Omit<DoctorAppointment, 'id'>) => void;
    onDeleteAppointment: (id: string) => void;
}

export const RemindersAppointments: React.FC<RemindersAppointmentsProps> = ({
                                                                                reminders,
                                                                                onToggleReminder,
                                                                                onAddReminder,
                                                                                onDeleteReminder,
                                                                                appointments,
                                                                                onToggleAppointment,
                                                                                onAddAppointment,
                                                                                onDeleteAppointment,
                                                                            }) => {
    // Quick Timer state (20-min hypo check & 2-hour post-meal)
    type TimerMode = 'twenty_min' | 'two_hour';
    const [timerMode, setTimerMode] = useState<TimerMode>('twenty_min');
    const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

    // Notification permission state
    const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(() => {
        return typeof window !== 'undefined' && 'Notification' in window
            ? Notification.permission
            : 'default';
    });

    // Modal / form states
    const [showAddReminderModal, setShowAddReminderModal] = useState(false);
    const [newReminderTitle, setNewReminderTitle] = useState('Замер через 2 часа после еды');
    const [newReminderTime, setNewReminderTime] = useState('14:30');
    const [newReminderType, setNewReminderType] = useState<Reminder['type']>('glucose');
    const [newReminderNote, setNewReminderNote] = useState('');

    const [showAddAptModal, setShowAddAptModal] = useState(false);
    const [newAptType, setNewAptType] = useState('Эндокринолог');
    const [newAptDoctor, setNewAptDoctor] = useState('');
    const [newAptClinic, setNewAptClinic] = useState('');
    const [newAptDate, setNewAptDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d.toISOString().split('T')[0];
    });
    const [newAptTime, setNewAptTime] = useState('10:00');
    const [newAptNotes, setNewAptNotes] = useState('');

    // Quick timer ticker
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isTimerRunning && timerSecondsLeft > 0) {
            interval = setInterval(() => {
                setTimerSecondsLeft((prev) => {
                    if (prev <= 1) {
                        setIsTimerRunning(false);
                        soundManager.playChime();
                        if ('Notification' in window && Notification.permission === 'granted') {
                            if (timerMode === 'twenty_min') {
                                new Notification('⏰ Прошло 20 минут!', {
                                    body: 'Проверьте уровень сахара после купирования гипогликемии (или паузы перед едой).',
                                    icon: '/icon.svg',
                                });
                            } else {
                                new Notification('⏰ Пора замерить сахар!', {
                                    body: 'Прошло 2 часа после приема пищи. Проверьте гликемию глюкометром.',
                                    icon: '/icon.svg',
                                });
                            }
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTimerRunning, timerSecondsLeft, timerMode]);

    const startTimer = (mode: TimerMode) => {
        const totalSec = mode === 'twenty_min' ? 20 * 60 : 120 * 60;
        setTimerMode(mode);
        setTimerSecondsLeft(totalSec);
        setIsTimerRunning(true);
        soundManager.playChime();
    };

    const cancelTimer = () => {
        setIsTimerRunning(false);
        setTimerSecondsLeft(0);
    };

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const perm = await Notification.requestPermission();
            setNotificationStatus(perm);
            if (perm === 'granted') {
                new Notification('Уведомления включены', {
                    body: 'Теперь вы будете получать напоминания о замерах сахара и визитах к врачу.',
                    icon: '/icon.svg',
                });
            }
        }
    };

    const formatTimerTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        if (hours > 0) {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const handleSaveReminder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReminderTitle.trim() || !newReminderTime) return;
        onAddReminder({
            title: newReminderTitle.trim(),
            time: newReminderTime,
            type: newReminderType,
            enabled: true,
            repeatDaily: true,
            note: newReminderNote.trim() || undefined,
        });
        setShowAddReminderModal(false);
        setNewReminderTitle('');
        setNewReminderNote('');
    };

    const handleSaveAppointment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAptType.trim() || !newAptDate) return;
        onAddAppointment({
            doctorType: newAptType.trim(),
            doctorName: newAptDoctor.trim() || undefined,
            clinicAddress: newAptClinic.trim() || undefined,
            date: newAptDate,
            time: newAptTime || '10:00',
            notes: newAptNotes.trim() || undefined,
            completed: false,
        });
        setShowAddAptModal(false);
        setNewAptDoctor('');
        setNewAptClinic('');
        setNewAptNotes('');
    };

    return (
        <div className="space-y-6 w-full">
            {/* Top Banner: Quick 20-min & 2-hour Timers & Notification Permission */}
            <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 dark:from-sky-700 dark:via-sky-800 dark:to-indigo-950 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/20 text-white">
                Быстрые таймеры контроля
              </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-400/25 text-amber-200 border border-amber-300/30">
                20 минут / 2 часа
              </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold mt-2">
                            {isTimerRunning
                                ? timerMode === 'twenty_min'
                                    ? 'Идет отсчет: 20 минут (Контроль гипо / еды)'
                                    : 'Идет отсчет: 2 часа (Постпрандиальный замер)'
                                : 'Таймеры: 20 минут и 2 часа'}
                        </h3>
                        <p className="text-xs text-sky-100 mt-1 leading-relaxed">
                            <strong>20 минут</strong> — проверка гликемии после купирования гипогликемии (правило 15–20 минут) или пауза перед приемом пищи.
                            <br className="hidden sm:inline" />
                            <strong> 2 часа</strong> — контроль пика сахара после еды для оценки дозы болюса.
                        </p>

                        {notificationStatus !== 'granted' && (
                            <button
                                onClick={requestNotificationPermission}
                                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                            >
                                <Bell className="w-3.5 h-3.5" />
                                <span>Включить браузерные уведомления</span>
                            </button>
                        )}
                    </div>

                    {/* Timer Display & Dual Mode Controls */}
                    <div className="bg-white/10 dark:bg-black/25 backdrop-blur-md p-4 rounded-xl border border-white/20 flex flex-col items-center min-w-[240px] w-full lg:w-auto">
            <span className="text-xs text-sky-200 font-medium text-center">
              {isTimerRunning
                  ? timerMode === 'twenty_min'
                      ? 'Отсчет 20 минут до контрольного замера'
                      : 'Отсчет 2 часов после приема пищи'
                  : 'Выберите и запустите таймер:'}
            </span>
                        <div className="text-3xl font-mono font-bold tracking-wider my-1.5">
                            {timerSecondsLeft > 0
                                ? formatTimerTime(timerSecondsLeft)
                                : timerMode === 'twenty_min'
                                    ? '20:00'
                                    : '02:00:00'}
                        </div>

                        {/* Controls */}
                        {isTimerRunning ? (
                            <div className="flex items-center gap-2 mt-2 w-full">
                                <button
                                    onClick={cancelTimer}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-500/90 text-white text-xs font-bold hover:bg-rose-600 shadow-xs transition-all cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Отменить таймер</span>
                                </button>
                                <button
                                    onClick={() => soundManager.playChime()}
                                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                                    title="Проверить звуковой сигнал"
                                >
                                    <Volume2 className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 mt-1.5 w-full">
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => startTimer('twenty_min')}
                                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-white text-sky-900 text-xs font-bold hover:bg-sky-50 shadow-xs transition-all cursor-pointer"
                                        title="Запустить таймер на 20 минут для контроля купирования гипогликемии"
                                    >
                                        <Play className="w-3.5 h-3.5 fill-current text-amber-600" />
                                        <span>20 минут</span>
                                    </button>
                                    <button
                                        onClick={() => startTimer('two_hour')}
                                        className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-white/95 text-sky-900 text-xs font-bold hover:bg-white shadow-xs transition-all cursor-pointer"
                                        title="Запустить таймер на 2 часа после приема пищи"
                                    >
                                        <Play className="w-3.5 h-3.5 fill-current text-sky-600" />
                                        <span>2 часа</span>
                                    </button>
                                </div>
                                <div className="flex items-center justify-center">
                                    <button
                                        onClick={() => soundManager.playChime()}
                                        className="text-[11px] text-sky-200 hover:text-white flex items-center gap-1 cursor-pointer transition-colors pt-0.5"
                                    >
                                        <Volume2 className="w-3 h-3" />
                                        <span>Проверить звуковой сигнал</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid: Left = Daily Reminders, Right = Doctor Appointments & Tests */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section 1: Measurement & Insulin Reminders */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col transition-colors">
                    <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Напоминания о замерах и инсулине</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Регулярные сигналы в течение суток</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddReminderModal(true)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Добавить</span>
                        </button>
                    </div>

                    <div className="p-4 sm:p-5 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
                        {reminders.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                                Нет активных напоминаний. Добавьте сигналы для контроля СД1.
                            </div>
                        ) : (
                            reminders.map((rem) => (
                                <div key={rem.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <button
                                            onClick={() => onToggleReminder(rem.id)}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm transition-all cursor-pointer ${
                                                rem.enabled
                                                    ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                                            }`}
                                        >
                                            {rem.time}
                                        </button>
                                        <div>
                                            <div className="flex items-center gap-2">
                        <span
                            className={`text-sm font-semibold ${
                                rem.enabled ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 line-through'
                            }`}
                        >
                          {rem.title}
                        </span>
                                                {rem.type === 'insulin_long' && (
                                                    <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-semibold px-1.5 py-0.5 rounded">
                            Базал
                          </span>
                                                )}
                                            </div>
                                            {rem.note && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{rem.note}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Toggle switch */}
                                        <button
                                            onClick={() => onToggleReminder(rem.id)}
                                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                rem.enabled ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
                                            }`}
                                        >
                                            <div
                                                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                                                    rem.enabled ? 'left-5.5' : 'left-0.5'
                                                }`}
                                            />
                                        </button>
                                        <button
                                            onClick={() => onDeleteReminder(rem.id)}
                                            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                            title="Удалить"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Section 2: Doctor Appointments & Lab Tests */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col transition-colors">
                    <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/50">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                                <Stethoscope className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Записи к врачам и анализы</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Диспансерный учет СД1 (эндокринолог, HbA1c)</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddAptModal(true)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Запись</span>
                        </button>
                    </div>

                    <div className="p-4 sm:p-5 flex-1 divide-y divide-slate-100 dark:divide-slate-800">
                        {appointments.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                                Нет запланированных визитов. Добавьте запись к эндокринологу или сдачу крови на HbA1c.
                            </div>
                        ) : (
                            appointments.map((apt) => {
                                const aptDate = new Date(apt.date);
                                const isPast = aptDate.getTime() < new Date().setHours(0, 0, 0, 0);

                                return (
                                    <div
                                        key={apt.id}
                                        className={`py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 ${
                                            apt.completed ? 'opacity-60' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <button
                                                onClick={() => onToggleAppointment(apt.id)}
                                                className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                                                    apt.completed
                                                        ? 'bg-teal-600 border-teal-600 text-white'
                                                        : 'border-slate-300 dark:border-slate-600 hover:border-teal-500 dark:hover:border-teal-400'
                                                }`}
                                                title={apt.completed ? 'Отметить как предстоит' : 'Отметить как пройдено'}
                                            >
                                                {apt.completed && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                                            </button>

                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                          <span
                              className={`text-sm font-bold ${
                                  apt.completed ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'
                              }`}
                          >
                            {apt.doctorType}
                          </span>
                                                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {aptDate.toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                            })}{' '}
                                                        в {apt.time}
                          </span>
                                                    {isPast && !apt.completed && (
                                                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                              Просрочено
                            </span>
                                                    )}
                                                </div>

                                                {apt.doctorName && (
                                                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                                                        Врач: {apt.doctorName}
                                                    </p>
                                                )}
                                                {apt.clinicAddress && (
                                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                                        <span>{apt.clinicAddress}</span>
                                                    </div>
                                                )}
                                                {apt.notes && (
                                                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                                        Подготовка: {apt.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => onDeleteAppointment(apt.id)}
                                            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                            title="Удалить запись"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Add Reminder Modal */}
            {showAddReminderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Новое напоминание</h3>
                        <form onSubmit={handleSaveReminder} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Название
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newReminderTitle}
                                    onChange={(e) => setNewReminderTitle(e.target.value)}
                                    placeholder="Например: Замер через 2 часа после ужина"
                                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-sky-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                        Время
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={newReminderTime}
                                        onChange={(e) => setNewReminderTime(e.target.value)}
                                        className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-sky-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                        Категория
                                    </label>
                                    <select
                                        value={newReminderType}
                                        onChange={(e) => setNewReminderType(e.target.value as Reminder['type'])}
                                        className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-sky-500 bg-white"
                                    >
                                        <option value="glucose">Замер сахара</option>
                                        <option value="insulin_short">Короткий инсулин</option>
                                        <option value="insulin_long">Продленный базал</option>
                                        <option value="custom">Другое</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Примечание / дозировка
                                </label>
                                <input
                                    type="text"
                                    value={newReminderNote}
                                    onChange={(e) => setNewReminderNote(e.target.value)}
                                    placeholder="Например: 14 единиц в бедро"
                                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-sky-500"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddReminderModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-sm font-semibold text-white shadow-sm cursor-pointer"
                                >
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Appointment Modal */}
            {showAddAptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Запись к врачу / на анализы</h3>
                        <form onSubmit={handleSaveAppointment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Специализация / процедура
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newAptType}
                                    onChange={(e) => setNewAptType(e.target.value)}
                                    placeholder="Эндокринолог, Анализ HbA1c, Офтальмолог"
                                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    ФИО врача / Кабинет (необязательно)
                                </label>
                                <input
                                    type="text"
                                    value={newAptDoctor}
                                    onChange={(e) => setNewAptDoctor(e.target.value)}
                                    placeholder="напр. Др. Смирнова Е. В., каб. 312"
                                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Медицинское учреждение / адрес
                                </label>
                                <input
                                    type="text"
                                    value={newAptClinic}
                                    onChange={(e) => setNewAptClinic(e.target.value)}
                                    placeholder="Поликлиника №7, ул. Ленина 45"
                                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-teal-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                        Дата
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={newAptDate}
                                        onChange={(e) => setNewAptDate(e.target.value)}
                                        className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                        Время
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={newAptTime}
                                        onChange={(e) => setNewAptTime(e.target.value)}
                                        className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-teal-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Памятка / подготовка
                                </label>
                                <input
                                    type="text"
                                    value={newAptNotes}
                                    onChange={(e) => setNewAptNotes(e.target.value)}
                                    placeholder="Строго натощак, взять дневник самоконтроля"
                                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-teal-500"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddAptModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white shadow-sm cursor-pointer"
                                >
                                    Сохранить запись
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
