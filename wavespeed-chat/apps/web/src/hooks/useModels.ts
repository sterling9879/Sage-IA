'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MODELS, PROVIDERS, getModelById, getModelsByProvider } from '@/constants/models';
import type { Model, Provider } from '@/types';

interface EnabledModel {
  modelId: string;
  isEnabled: boolean;
  isFree: boolean;
}

export function useModels() {
  const [enabledModels, setEnabledModels] = useState<EnabledModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEnabledModels = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/models');

      if (response.ok) {
        const data = await response.json();
        setEnabledModels(data.models || []);
      }
    } catch (error) {
      console.error('Failed to fetch enabled models:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnabledModels();
  }, [fetchEnabledModels]);

  // Filter models to only include enabled ones
  const availableModels = useMemo(() => {
    if (enabledModels.length === 0) {
      // If no models are configured, show all models
      return MODELS;
    }

    const enabledSet = new Set(
      enabledModels.filter((m) => m.isEnabled).map((m) => m.modelId)
    );

    return MODELS.filter((model) => enabledSet.has(model.id));
  }, [enabledModels]);

  const freeModels = useMemo(() => {
    return availableModels.filter((model) => {
      const config = enabledModels.find((m) => m.modelId === model.id);
      return config ? config.isFree : model.isFree;
    });
  }, [availableModels, enabledModels]);

  const modelsByProvider = useMemo(() => {
    return availableModels.reduce(
      (acc, model) => {
        const providerId = model.provider.id;
        if (!acc[providerId]) {
          acc[providerId] = {
            provider: model.provider,
            models: [],
          };
        }
        acc[providerId].models.push(model);
        return acc;
      },
      {} as Record<string, { provider: Provider; models: Model[] }>
    );
  }, [availableModels]);

  const getModel = useCallback(
    (modelId: string) => {
      return availableModels.find((m) => m.id === modelId);
    },
    [availableModels]
  );

  const isModelFree = useCallback(
    (modelId: string) => {
      const config = enabledModels.find((m) => m.modelId === modelId);
      if (config) return config.isFree;

      const model = getModelById(modelId);
      return model?.isFree || false;
    },
    [enabledModels]
  );

  return {
    models: availableModels,
    freeModels,
    modelsByProvider,
    providers: PROVIDERS,
    isLoading,
    getModel,
    isModelFree,
    refresh: fetchEnabledModels,
  };
}
