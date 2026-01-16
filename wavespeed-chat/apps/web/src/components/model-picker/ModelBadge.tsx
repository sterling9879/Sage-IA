'use client';

import { ProviderLogo } from './ProviderLogo';
import { getModelById } from '@/constants/models';
import { cn } from '@/lib/utils';

interface ModelBadgeProps {
  modelId: string;
  showProvider?: boolean;
  className?: string;
}

export function ModelBadge({ modelId, showProvider = true, className }: ModelBadgeProps) {
  const model = getModelById(modelId);

  if (!model) {
    return (
      <span className={cn('text-xs text-dark-500', className)}>
        {modelId.split('/').pop()}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-dark-100 px-2 py-0.5',
        'text-xs font-medium text-dark-700',
        'dark:bg-dark-700 dark:text-dark-300',
        className
      )}
    >
      {showProvider && <ProviderLogo provider={model.provider.id} size="sm" />}
      {model.name}
    </span>
  );
}
