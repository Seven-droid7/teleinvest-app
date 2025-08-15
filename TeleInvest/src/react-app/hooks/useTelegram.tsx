import React, { createContext, useContext, useEffect, useState } from 'react';
import { TelegramWebApp } from '@/shared/types';

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: any;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  isReady: false,
});

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initTelegram = () => {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        setWebApp(tg);
        setUser(tg.initDataUnsafe.user);
        
        // Configure theme
        tg.expand();
        tg.ready();
        
        // Set header color to match design
        tg.headerColor = '#1f2937';
        tg.backgroundColor = '#111827';
        
        setIsReady(true);
      } else {
        // Fallback for development
        console.warn('Telegram WebApp not available');
        setIsReady(true);
      }
    };

    // Try immediately
    initTelegram();

    // Also try after a delay in case the script loads later
    const timeout = setTimeout(initTelegram, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <TelegramContext.Provider value={{ webApp, user, isReady }}>
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
};
