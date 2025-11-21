'use client';

import { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface IconInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
  helperText?: string;
  optional?: boolean;
}

export const IconInput = forwardRef<HTMLInputElement, IconInputProps>(
  ({ id, label, icon: Icon, error, helperText, optional, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-white/90">
          {label} {optional && <span className="text-white/50 text-xs">(optionnel)</span>}
        </Label>
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            id={id}
            ref={ref}
            className={`pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-400/50 focus:ring-blue-400/20 ${className || ''}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {helperText && !error && <p className="text-xs text-white/50">{helperText}</p>}
      </div>
    );
  }
);

IconInput.displayName = 'IconInput';
