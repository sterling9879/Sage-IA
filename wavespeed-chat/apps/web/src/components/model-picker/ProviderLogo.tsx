'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PROVIDERS } from '@/constants/models';

interface ProviderLogoProps {
  provider: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

// Fallback colors for providers
const providerColors: Record<string, string> = {
  anthropic: 'bg-[#CC785C]',
  google: 'bg-[#4285F4]',
  openai: 'bg-[#10A37F]',
  meta: 'bg-[#0668E1]',
  deepseek: 'bg-[#5B6EE1]',
};

export function ProviderLogo({ provider, size = 'md', className }: ProviderLogoProps) {
  const providerData = PROVIDERS[provider];

  // Use a colored circle with the first letter as fallback
  const fallbackContent = (
    <div
      className={cn(
        'flex items-center justify-center rounded-full text-white font-semibold',
        sizes[size],
        providerColors[provider] || 'bg-dark-400',
        className
      )}
    >
      {(providerData?.name || provider).charAt(0).toUpperCase()}
    </div>
  );

  if (!providerData?.logo) {
    return fallbackContent;
  }

  return (
    <div className={cn('relative', sizes[size], className)}>
      <Image
        src={providerData.logo}
        alt={providerData.name}
        fill
        className="object-contain"
        onError={(e) => {
          // Hide image and show fallback on error
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}
