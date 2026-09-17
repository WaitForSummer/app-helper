/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
    GlucoseEntry,
    Reminder,
    DoctorAppointment,
    ShoppingItem,
    UtilityBill,
    AppSettings,
    GlucoseUnit,
    AppTheme,
    MealEntry,
    FavoriteMeal,
} from './types';
import {
    defaultSettings,
    initialGlucoseEntries,
    initialReminders,
    initialAppointments,
    initialShoppingItems,
    initialUtilityBills,
} from './data/initialData';
import { initialMealEntries, initialFavoriteMeals } from './data/initialFoodData';
import { Navbar, NavigationTab } from './components/Navbar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { GlucoseTracker } from './components/GlucoseTracker';
import { FoodDiary } from './components/FoodDiary';
import { RemindersAppointments } from './components/RemindersAppointments';
import { ShoppingList } from './components/ShoppingList';
import { UtilityBills } from './components/UtilityBills';
import { DataManagementModal } from './components/DataManagementModal';
import { AddGlucoseModal } from './components/AddGlucoseModal';

export default function App() {
    const [currentTab, setCurrentTab] = useState<NavigationTab>('tracker');
    const [isAddGlucoseOpen, setIsAddGlucoseOpen] = useState(false);

    // Persistent States
    const [glucoseEntries, setGlucoseEntries] = useLocalStorage<GlucoseEntry[]>(
        't1d_glucose_entries',
        initialGlucoseEntries
    );
    const [meals, setMeals] = useLocalStorage<MealEntry[]>(
        't1d_meals',
        initialMealEntries
    );
    const [favoriteMeals, setFavoriteMeals] = useLocalStorage<FavoriteMeal[]>(
        't1d_favorite_meals',
        initialFavoriteMeals
    );
    const [reminders, setReminders] = useLocalStorage<Reminder[]>(
        't1d_reminders',
        initialReminders
    );
    const [appointments, setAppointments] = useLocalStorage<DoctorAppointment[]>(
        't1d_appointments',
        initialAppointments
    );
    const [shoppingItems, setShoppingItems] = useLocalStorage<ShoppingItem[]>(
        't1d_shopping_items',
        initialShoppingItems
    );
    const [bills, setBills] = useLocalStorage<UtilityBill[]>(
        't1d_utility_bills',
        initialUtilityBills
    );
    const [settings, setSettings] = useLocalStorage<AppSettings>(
        't1d_settings',
        defaultSettings
    );

    // Badge calculations
    const pendingShoppingCount = useMemo(
        () => shoppingItems.filter((i) => !i.isPurchased).length,
        [shoppingItems]
    );
    const unpaidBillsCount = useMemo(
        () => bills.filter((b) => !b.isPaid).length,
        [bills]
    );
    const activeRemindersCount = useMemo(
        () => reminders.filter((r) => r.enabled).length,
        [reminders]
    );

    // Theme Synchronization Effect
    useEffect(() => {
        const root = document.documentElement;
        if (settings.theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [settings.theme]);

    // Sanitize any mock entries that might have future timestamps from previous runs / timezones
    useEffect(() => {
        const now = Date.now();
        let hasFutureMock = false;
        const sanitized = glucoseEntries.map((e) => {
            const entryTime = new Date(e.timestamp).getTime();
            // If mock entries g-1..g-4 have future timestamps relative to user's current clock, shift to past
            if (entryTime > now && e.id.startsWith('g-') && parseInt(e.id.replace('g-', ''), 10) <= 4) {
                hasFutureMock = true;
                const mockIdx = parseInt(e.id.replace('g-', ''), 10);
                const hoursAgo = (5 - mockIdx) * 1.5; // e.g. g-4: 1.5h ago, g-3: 3h ago, g-2: 4.5h ago, g-1: 6h ago
                return {
                    ...e,
                    timestamp: new Date(now - hoursAgo * 3600 * 1000).toISOString(),
                };
            }
            return e;
        });

        if (hasFutureMock) {
            setGlucoseEntries(sanitized);
        }
    }, []);

    // Theme Toggle (Light <-> Dark / Night)
    const handleToggleTheme = () => {
        const nextTheme: AppTheme = settings.theme === 'dark' ? 'light' : 'dark';
        setSettings((prev) => ({ ...prev, theme: nextTheme }));
    };

    // Unit Toggle (mmol/L <-> mg/dL)
    const handleToggleUnit = () => {
        const nextUnit: GlucoseUnit = settings.glucoseUnit === 'mmol' ? 'mgdl' : 'mmol';
        setSettings((prev) => ({ ...prev, glucoseUnit: nextUnit }));
    };

    // Glucose Handlers
    const handleAddGlucose = (newEntryData: Omit<GlucoseEntry, 'id'>) => {
        const now = Date.now();
        const entryTime = new Date(newEntryData.timestamp).getTime();
        // If entered time is approximately current time or missing, guarantee exact now timestamp
        const isNow = !newEntryData.timestamp || Math.abs(now - entryTime) < 60000;
        const finalTimestamp = isNow ? new Date(now).toISOString() : newEntryData.timestamp;

        const entryWithId: GlucoseEntry = {
            ...newEntryData,
            id: 'g-' + now,
            timestamp: finalTimestamp,
        };
        setGlucoseEntries((prev) => [entryWithId, ...prev]);
    };

    const handleDeleteGlucose = (id: string) => {
        setGlucoseEntries((prev) => prev.filter((e) => e.id !== id));
    };

    // Reminders Handlers
    const handleToggleReminder = (id: string) => {
        setReminders((prev) =>
            prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
        );
    };

    const handleAddReminder = (newRem: Omit<Reminder, 'id'>) => {
        setReminders((prev) => [{ ...newRem, id: 'rem-' + Date.now() }, ...prev]);
    };

    const handleDeleteReminder = (id: string) => {
        setReminders((prev) => prev.filter((r) => r.id !== id));
    };

    // Doctor Appointments Handlers
    const handleToggleAppointment = (id: string) => {
        setAppointments((prev) =>
            prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
        );
    };

    const handleAddAppointment = (newApt: Omit<DoctorAppointment, 'id'>) => {
        setAppointments((prev) => [{ ...newApt, id: 'apt-' + Date.now() }, ...prev]);
    };

    const handleDeleteAppointment = (id: string) => {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
    };

    // Shopping Handlers
    const handleToggleShopping = (id: string) => {
        setShoppingItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, isPurchased: !item.isPurchased } : item
            )
        );
    };

    const handleAddShopping = (newItem: Omit<ShoppingItem, 'id' | 'createdAt'>) => {
        setShoppingItems((prev) => [
            {
                ...newItem,
                id: 'sh-' + Date.now(),
                createdAt: new Date().toISOString(),
            },
            ...prev,
        ]);
    };

    const handleDeleteShopping = (id: string) => {
        setShoppingItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleClearPurchasedShopping = () => {
        setShoppingItems((prev) => prev.filter((item) => !item.isPurchased));
    };

    // Utility Bills Handlers
    const handleToggleBillPaid = (id: string) => {
        setBills((prev) =>
            prev.map((b) => {
                if (b.id !== id) return b;
                const willBePaid = !b.isPaid;
                return {
                    ...b,
                    isPaid: willBePaid,
                    paidDate: willBePaid ? new Date().toISOString().split('T')[0] : undefined,
                };
            })
        );
    };

    const handleAddBill = (newBill: Omit<UtilityBill, 'id'>) => {
        setBills((prev) => [{ ...newBill, id: 'bill-' + Date.now() }, ...prev]);
    };

    const handleDeleteBill = (id: string) => {
        setBills((prev) => prev.filter((b) => b.id !== id));
    };

    // Meal Diary Handlers
    const handleAddMeal = (newMeal: Omit<MealEntry, 'id'>) => {
        const mealWithId: MealEntry = {
            ...newMeal,
            id: 'meal-' + Date.now(),
        };
        setMeals((prev) => [mealWithId, ...prev]);
    };

    const handleDeleteMeal = (id: string) => {
        setMeals((prev) => prev.filter((m) => m.id !== id));
    };

    const handleAddFavoriteMeal = (fav: Omit<FavoriteMeal, 'id'>) => {
        const favWithId: FavoriteMeal = {
            ...fav,
            id: 'fav-' + Date.now(),
        };
        setFavoriteMeals((prev) => [favWithId, ...prev]);
    };

    const handleDeleteFavoriteMeal = (id: string) => {
        setFavoriteMeals((prev) => prev.filter((f) => f.id !== id));
    };

    // Backup & Reset Handlers
    const handleImportData = (imported: {
        glucoseEntries?: GlucoseEntry[];
        shoppingItems?: ShoppingItem[];
        bills?: UtilityBill[];
        appointments?: DoctorAppointment[];
        reminders?: Reminder[];
        meals?: MealEntry[];
        favoriteMeals?: FavoriteMeal[];
    }) => {
        if (imported.glucoseEntries) setGlucoseEntries(imported.glucoseEntries);
        if (imported.shoppingItems) setShoppingItems(imported.shoppingItems);
        if (imported.bills) setBills(imported.bills);
        if (imported.appointments) setAppointments(imported.appointments);
        if (imported.reminders) setReminders(imported.reminders);
        if (imported.meals) setMeals(imported.meals);
        if (imported.favoriteMeals) setFavoriteMeals(imported.favoriteMeals);
    };

    const handleResetData = () => {
        setGlucoseEntries(initialGlucoseEntries);
        setMeals(initialMealEntries);
        setFavoriteMeals(initialFavoriteMeals);
        setReminders(initialReminders);
        setAppointments(initialAppointments);
        setShoppingItems(initialShoppingItems);
        setBills(initialUtilityBills);
        setSettings(defaultSettings);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
            {/* Offline Alert */}
            <OfflineIndicator />

            {/* Navigation Header */}
            <Navbar
                currentTab={currentTab}
                onSelectTab={setCurrentTab}
                onOpenAddGlucose={() => setIsAddGlucoseOpen(true)}
                glucoseUnit={settings.glucoseUnit}
                onToggleUnit={handleToggleUnit}
                theme={settings.theme}
                onToggleTheme={handleToggleTheme}
                unreadRemindersCount={activeRemindersCount}
                unpaidBillsCount={unpaidBillsCount}
                pendingShoppingCount={pendingShoppingCount}
            />

            {/* Main Container with fluid percentage width */}
            <main className="flex-1 w-[94%] sm:w-[92%] lg:w-[90%] max-w-[1400px] mx-auto py-6 pb-24 md:pb-12">
                {currentTab === 'tracker' && (
                    <GlucoseTracker
                        entries={glucoseEntries}
                        settings={settings}
                        onAddEntry={() => setIsAddGlucoseOpen(true)}
                        onDeleteEntry={handleDeleteGlucose}
                        onToggleUnit={handleToggleUnit}
                    />
                )}

                {currentTab === 'food' && (
                    <FoodDiary
                        meals={meals}
                        onAddMeal={handleAddMeal}
                        onDeleteMeal={handleDeleteMeal}
                        favoriteMeals={favoriteMeals}
                        onAddFavoriteMeal={handleAddFavoriteMeal}
                        onDeleteFavoriteMeal={handleDeleteFavoriteMeal}
                        settings={settings}
                    />
                )}

                {currentTab === 'reminders' && (
                    <RemindersAppointments
                        reminders={reminders}
                        onToggleReminder={handleToggleReminder}
                        onAddReminder={handleAddReminder}
                        onDeleteReminder={handleDeleteReminder}
                        appointments={appointments}
                        onToggleAppointment={handleToggleAppointment}
                        onAddAppointment={handleAddAppointment}
                        onDeleteAppointment={handleDeleteAppointment}
                    />
                )}

                {currentTab === 'shopping' && (
                    <ShoppingList
                        items={shoppingItems}
                        onToggleItem={handleToggleShopping}
                        onAddItem={handleAddShopping}
                        onDeleteItem={handleDeleteShopping}
                        onClearPurchased={handleClearPurchasedShopping}
                    />
                )}

                {currentTab === 'bills' && (
                    <UtilityBills
                        bills={bills}
                        onTogglePaid={handleToggleBillPaid}
                        onAddBill={handleAddBill}
                        onDeleteBill={handleDeleteBill}
                    />
                )}

                {currentTab === 'settings' && (
                    <DataManagementModal
                        settings={settings}
                        onUpdateSettings={setSettings}
                        glucoseEntries={glucoseEntries}
                        shoppingItems={shoppingItems}
                        bills={bills}
                        appointments={appointments}
                        reminders={reminders}
                        meals={meals}
                        favoriteMeals={favoriteMeals}
                        onImportData={handleImportData}
                        onResetData={handleResetData}
                        onToggleTheme={handleToggleTheme}
                        onToggleUnit={handleToggleUnit}
                    />
                )}
            </main>

            {/* Quick Add Glucose Modal */}
            <AddGlucoseModal
                isOpen={isAddGlucoseOpen}
                onClose={() => setIsAddGlucoseOpen(false)}
                onSave={handleAddGlucose}
                settings={settings}
            />
        </div>
    );
}
