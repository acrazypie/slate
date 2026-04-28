'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { X, Sun, Moon, Monitor } from 'lucide-react';
import { ViewMode } from '@/hooks/useWeek';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [defaultView, setDefaultView] = useState<ViewMode>(
    () => (localStorage.getItem('slate-default-view') as ViewMode) ?? 'week'
  );

  const handleViewChange = (view: ViewMode) => {
    setDefaultView(view);
    localStorage.setItem('slate-default-view', view);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-[#1a1a1a] dark:bg-[#1a1a1a] light:bg-white rounded-lg w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-[#f5f5f5] dark:text-[#f5f5f5] light:text-[#1a1a1a]">
            Impostazioni
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-[#2a2a2a] dark:hover:bg-[#2a2a2a] light:hover:bg-[#f0eeea] rounded">
            <X className="w-5 h-5 text-[#888888]" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-[#888888] dark:text-[#888888] light:text-[#666666] mb-3">Tema</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-md text-sm transition-colors ${
                  theme === 'light'
                    ? 'bg-[#e8e0d0] text-[#0f0f0f]'
                    : 'bg-[#222222] dark:bg-[#222222] light:bg-[#f0eeea] text-[#f5f5f5] dark:text-[#f5f5f5] light:text-[#1a1a1a] hover:bg-[#2a2a2a]'
                }`}
              >
                <Sun className="w-4 h-4" />
                Chiaro
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-md text-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-[#e8e0d0] text-[#0f0f0f]'
                    : 'bg-[#222222] dark:bg-[#222222] light:bg-[#f0eeea] text-[#f5f5f5] dark:text-[#f5f5f5] light:text-[#1a1a1a] hover:bg-[#2a2a2a]'
                }`}
              >
                <Moon className="w-4 h-4" />
                Scuro
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-md text-sm transition-colors ${
                  theme === 'system'
                    ? 'bg-[#e8e0d0] text-[#0f0f0f]'
                    : 'bg-[#222222] dark:bg-[#222222] light:bg-[#f0eeea] text-[#f5f5f5] dark:text-[#f5f5f5] light:text-[#1a1a1a] hover:bg-[#2a2a2a]'
                }`}
              >
                <Monitor className="w-4 h-4" />
                Sistema
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#888888] dark:text-[#888888] light:text-[#666666] mb-3">Vista predefinita</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleViewChange('day')}
                className={`px-3 py-3 rounded-md text-sm transition-colors ${
                  defaultView === 'day'
                    ? 'bg-[#e8e0d0] text-[#0f0f0f]'
                    : 'bg-[#222222] dark:bg-[#222222] light:bg-[#f0eeea] text-[#f5f5f5] dark:text-[#f5f5f5] light:text-[#1a1a1a] hover:bg-[#2a2a2a]'
                }`}
              >
                Giorno
              </button>
              <button
                onClick={() => handleViewChange('week')}
                className={`px-3 py-3 rounded-md text-sm transition-colors ${
                  defaultView === 'week'
                    ? 'bg-[#e8e0d0] text-[#0f0f0f]'
                    : 'bg-[#222222] dark:bg-[#222222] light:bg-[#f0eeea] text-[#f5f5f5] dark:text-[#f5f5f5] light:text-[#1a1a1a] hover:bg-[#2a2a2a]'
                }`}
              >
                Settimana
              </button>
              <button
                onClick={() => handleViewChange('month')}
                disabled
                className="px-3 py-3 rounded-md text-sm transition-colors bg-[#222222] dark:bg-[#222222] light:bg-[#f0eeea] text-[#888888] dark:text-[#888888] light:text-[#666666] hover:bg-[#2a2a2a] opacity-50 cursor-not-allowed"
              >
                Mese
                <span className="block text-xs">(in arrivo)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}