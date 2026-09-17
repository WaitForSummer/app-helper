import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
    const isOnline = useOnlineStatus();

    if (isOnline) return null;

    return (
        <div
            id="offline-indicator-banner"
            className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-slate-900/90 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-white shadow-lg border border-slate-700/50"
        >
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span>Офлайн-режим — данные сохраняются локально на вашем устройстве</span>
        </div>
    );
};
