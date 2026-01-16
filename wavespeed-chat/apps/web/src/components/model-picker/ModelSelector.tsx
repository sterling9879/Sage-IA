'use client';

import { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useModels } from '@/hooks/useModels';
import { useChat } from '@/hooks/useChat';
import { ModelOption } from './ModelOption';
import { ProviderLogo } from './ProviderLogo';
import { cn } from '@/lib/utils';

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { models, modelsByProvider, getModel, isModelFree } = useModels();
  const { model, setModel } = useChat();

  const selectedModel = getModel(model);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-lg border border-dark-200 bg-white px-3 py-2',
          'hover:border-dark-300 transition-colors',
          'dark:border-dark-700 dark:bg-dark-800 dark:hover:border-dark-600',
          isOpen && 'border-primary-500 ring-2 ring-primary-500/20'
        )}
      >
        {selectedModel && (
          <ProviderLogo provider={selectedModel.provider.id} size="sm" />
        )}
        <span className="text-sm font-medium text-dark-900 dark:text-dark-100">
          {selectedModel?.name || 'Selecionar modelo'}
        </span>
        {selectedModel && isModelFree(selectedModel.id) && (
          <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Free
          </span>
        )}
        <ChevronDown
          className={cn(
            'h-4 w-4 text-dark-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full z-20 mt-2 w-80 rounded-xl border border-dark-200 bg-white shadow-xl dark:border-dark-700 dark:bg-dark-800 animate-fade-in">
            {/* Header */}
            <div className="border-b border-dark-200 px-4 py-3 dark:border-dark-700">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-500" />
                <h3 className="font-semibold text-dark-900 dark:text-dark-100">
                  Escolha um modelo
                </h3>
              </div>
              <p className="mt-1 text-xs text-dark-500 dark:text-dark-400">
                Diferentes modelos para diferentes necessidades
              </p>
            </div>

            {/* Model list */}
            <div className="max-h-96 overflow-y-auto p-2">
              {Object.entries(modelsByProvider).map(([providerId, { provider, models: providerModels }]) => (
                <div key={providerId} className="mb-3 last:mb-0">
                  <div className="mb-1 flex items-center gap-2 px-2 py-1">
                    <ProviderLogo provider={providerId} size="sm" />
                    <span className="text-xs font-semibold uppercase text-dark-500 dark:text-dark-400">
                      {provider.name}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {providerModels.map((m) => (
                      <ModelOption
                        key={m.id}
                        model={m}
                        isSelected={model === m.id}
                        isFree={isModelFree(m.id)}
                        onSelect={() => {
                          setModel(m.id);
                          setIsOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
