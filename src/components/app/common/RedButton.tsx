'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const RedButton = forwardRef<HTMLButtonElement, RedButtonProps>(
  (
    {
      children,
      isLoading,
      loadingText = 'Chargement...',
      size = 'lg',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        disabled={isLoading}
        className={`cursor-pointer bg-linear-to-r from-red-500/90 to-red-600/90 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-md shadow-red-500/10 transition-all duration-300 hover:shadow-red-500/20 hover:scale-[1.01] ${className || ''}`}
        size={size}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

RedButton.displayName = 'RedButton';
