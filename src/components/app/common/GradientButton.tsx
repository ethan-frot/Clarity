'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const GradientButton = forwardRef<
  HTMLButtonElement,
  GradientButtonProps
>(
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
        className={`w-full cursor-pointer bg-linear-to-r from-blue-500/90 to-violet-600/90 hover:from-blue-500 hover:to-violet-600 text-white font-semibold shadow-md shadow-blue-500/10 transition-all duration-300 hover:shadow-blue-500/20 hover:scale-[1.01] ${className || ''}`}
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

GradientButton.displayName = 'GradientButton';
