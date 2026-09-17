import React from 'react';
import {
    Activity,
    Utensils,
    Clock,
    ShoppingCart,
    Receipt,
    Settings,
    Plus,
    Droplets,
    Sun,
    Moon,
} from 'lucide-react';
import { GlucoseUnit, AppTheme } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

export type NavigationTab = 'tracker' | 'food' | 'reminders' | 'shopping' | 'bills' | 'settings';

interface NavbarProps {
    currentTab: NavigationTab;
    onSelectTab: (tab: NavigationTab) => void;
    onOpenAddGlucose: () => void;
    glucoseUnit?: GlucoseUnit;
    onToggleUnit?: () => void;
    theme: AppTheme;
    onToggleTheme: () => void;
    unreadRemindersCount?: number;
    unpaidBillsCount?: number;
    pendingShoppingCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
                                                  currentTab,
                                                  onSelectTab,
                                                  onOpenAddGlucose,
                                                  theme,
                                                  onToggleTheme,
                                                  unreadRemindersCount = 0,
                                                  unpaidBillsCount = 0,
                                                  pendingShoppingCount = 0,
                                              }) => {
    const navItems = [
        {
            id: 'tracker' as NavigationTab,
            label: 'Сахар и графики',
            icon: Activity,
        },
        {
            id: 'food' as NavigationTab,
            label: 'Журнал питания',
            icon: Utensils,
        },
        {
            id: 'reminders' as NavigationTab,
            label: 'Напоминания и врачи',
            icon: Clock,
            badge: unreadRemindersCount > 0 ? unreadRemindersCount : undefined,
        },
        {
            id: 'shopping' as NavigationTab,
            label: 'Список покупок',
            icon: ShoppingCart,
            badge: pendingShoppingCount > 0 ? pendingShoppingCount : undefined,
        },
        {
            id: 'bills' as NavigationTab,
            label: 'Счета: Свет и Связь',
            icon: Receipt,
            badge: unpaidBillsCount > 0 ? unpaidBillsCount : undefined,
            badgeColor: 'bg-amber-500',
        },
        {
            id: 'settings' as NavigationTab,
            label: 'Настройки и отчет',
            icon: Settings,
        },
    ];

    return (
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
            <div className="w-[94%] sm:w-[92%] lg:w-[90%] mx-auto">
                <div className="flex items-center justify-between h-16 gap-2">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 dark:from-sky-600 dark:to-sky-800 flex items-center justify-center text-white shadow-sm ring-2 ring-sky-100 dark:ring-sky-950 flex-shrink-0">
                            <Droplets className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 dark:text-slate-50 text-xl tracking-tight">WF-S</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                                Твой ежедневник
                            </p>
                        </div>
                    </div>

                    {/* Desktop Navigation links */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    id={`nav-tab-${item.id}`}
                                    onClick={() => onSelectTab(item.id)}
                                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 shadow-xs'
                                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                    <span>{item.label}</span>
                                    {item.badge !== undefined && (
                                        <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-sky-600'}`}>
                      {item.badge}
                    </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Action Tools */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        {/* Theme Toggle (Light / Dark) — Guaranteed visible & touch-friendly on all screen sizes */}
                        <button
                            id="theme-toggle-btn"
                            onClick={onToggleTheme}
                            className="w-10 h-10 min-w-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center justify-center shadow-2xs flex-shrink-0 active:scale-95"
                            title={theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
                            aria-label="Переключить тему оформления"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5 text-amber-400 animate-in fade-in duration-200" />
                            ) : (
                                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300 animate-in fade-in duration-200" />
                            )}
                        </button>

                        {/* PWA install */}
                        <PWAInstallButton />

                        {/* Quick Log Blood Sugar Button */}
                        <button
                            id="quick-add-glucose-btn"
                            onClick={onOpenAddGlucose}
                            className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white h-10 px-3 text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer flex-shrink-0 active:scale-95"
                        >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span className="hidden sm:inline">Замер</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-1 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg transition-colors duration-200">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                        <button
                            key={item.id}
                            id={`mobile-nav-${item.id}`}
                            onClick={() => onSelectTab(item.id)}
                            className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition-colors cursor-pointer min-w-[48px] ${
                                isActive
                                    ? 'text-sky-600 dark:text-sky-400 font-bold'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] mt-0.5 whitespace-nowrap">{item.label.split(' ')[0]}</span>
                            {item.badge !== undefined && (
                                <span className={`absolute top-0 right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center ${item.badgeColor || 'bg-sky-600'}`}>
                  {item.badge}
                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </header>
    );
};
