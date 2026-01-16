'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import type { User } from '@/types';
import { useUIStore } from '@/stores/ui-store';

interface UserWithPlan extends Partial<User> {
  plan: 'FREE' | 'PRO' | 'UNLIMITED';
  messagesUsed: number;
  messagesLimit: number;
}

export function useUser() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserWithPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { addToast } = useUIStore();

  const fetchUserData = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/user');

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const updateUserPreferences = useCallback(
    async (preferences: { defaultModel?: string; theme?: string }) => {
      try {
        const response = await fetch('/api/user', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preferences),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erro ao atualizar preferências');
        }

        const data = await response.json();
        setUserData((prev) => (prev ? { ...prev, ...data.user } : null));

        addToast({
          type: 'success',
          message: 'Preferências atualizadas',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        addToast({
          type: 'error',
          message: errorMessage,
        });
      }
    },
    [addToast]
  );

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserData();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
      setUserData(null);
    }
  }, [status, fetchUserData]);

  const isAuthenticated = status === 'authenticated';
  const isSessionLoading = status === 'loading';

  const remainingMessages = userData
    ? Math.max(0, userData.messagesLimit - userData.messagesUsed)
    : 0;

  const usagePercentage = userData
    ? Math.min(100, (userData.messagesUsed / userData.messagesLimit) * 100)
    : 0;

  const canSendMessage = !userData || userData.plan !== 'FREE' || remainingMessages > 0;

  return {
    user: session?.user,
    userData,
    isAuthenticated,
    isLoading: isLoading || isSessionLoading,
    remainingMessages,
    usagePercentage,
    canSendMessage,
    updateUserPreferences,
    refresh: fetchUserData,
  };
}
