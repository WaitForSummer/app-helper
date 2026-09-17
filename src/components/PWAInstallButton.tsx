import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
    const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
    const [showIOSGuide, setShowIOSGuide] = useState(false);

    if (isInstalled) {
        return null;
    }

    if (isInstallable) {
        return (
            <button
                id="pwa-install-btn"
                onClick={install}
                className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold h-10 px-2.5 sm:px-3 shadow-xs transition-colors cursor-pointer flex-shrink-0"
                title="Установить приложение на устройство"
                aria-label="Установить приложение"
            >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Установить</span>
            </button>
        );
    }

    if (isIOS) {
        return (
            <>
                <button
                    id="pwa-ios-guide-btn"
                    onClick={() => setShowIOSGuide(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 text-xs font-semibold h-10 px-2.5 sm:px-3 transition-colors cursor-pointer flex-shrink-0"
                    title="Инструкция по установке на iPhone/iPad"
                    aria-label="Инструкция по установке на домашний экран iOS"
                >
                    <Smartphone className="w-4 h-4" />
                    <span className="hidden sm:inline">На экран Домой</span>
                </button>

                {showIOSGuide && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                        <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 text-slate-800">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="font-semibold text-slate-900 text-base">Установка на iPhone / iPad</h3>
                                <button
                                    onClick={() => setShowIOSGuide(false)}
                                    className="text-slate-400 hover:text-slate-600 p-1"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="mt-4 space-y-3 text-sm text-slate-600">
                                <div className="flex items-start gap-2.5">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">1</span>
                                    <p>В браузере Safari нажмите кнопку <strong>«Поделиться»</strong> (квадрат со стрелкой вверх) в нижней панели.</p>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">2</span>
                                    <p>Прокрутите меню вниз и выберите <strong>«На экран Домой»</strong> (Add to Home Screen).</p>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">3</span>
                                    <p>Нажмите <strong>«Добавить»</strong> в правом верхнем углу. Приложение появится на главном экране!</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowIOSGuide(false)}
                                className="mt-5 w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-sm font-medium text-slate-800 transition-colors"
                            >
                                Понятно
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return null;
};
