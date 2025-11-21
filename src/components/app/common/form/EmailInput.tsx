'use client';

import { forwardRef } from 'react';
import { Mail } from 'lucide-react';
import { IconInput } from '../IconInput';

interface EmailInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'icon'> {
  id?: string;
  error?: string;
}

export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  ({ id = 'email', error, placeholder = 'alice@example.com', ...props }, ref) => {
    return (
      <IconInput
        ref={ref}
        id={id}
        label="Email"
        type="email"
        icon={Mail}
        placeholder={placeholder}
        error={error}
        {...props}
      />
    );
  }
);

EmailInput.displayName = 'EmailInput';
