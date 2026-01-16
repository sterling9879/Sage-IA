'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import { ToastContainer } from '@/components/ui/Toast';
import { useUIStore } from '@/stores/ui-store';

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme } = useUIStore();

  useEffect(() => {
    // Apply theme on initial load
    const applyTheme = () => {
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <SessionProvider>
      {children}
      <ToastContainer />
    </SessionProvider>
  );
}
