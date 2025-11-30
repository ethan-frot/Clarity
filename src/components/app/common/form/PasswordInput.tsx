'use client';

import { forwardRef } from 'react';
import { Lock } from 'lucide-react';
import { IconInput } from '../IconInput';

interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'icon'
> {
  id?: string;
  label?: string;
  error?: string;
  showHelperText?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      id = 'password',
      label = 'Mot de passe',
      error,
      placeholder = '••••••••',
      showHelperText = true,
      ...props
    },
    ref
  ) => {
    return (
      <IconInput
        ref={ref}
        id={id}
        label={label}
        type="password"
        icon={Lock}
        placeholder={placeholder}
        error={error}
        helperText={
          showHelperText
            ? 'Minimum 8 caractères avec majuscule, minuscule, chiffre et caractère spécial'
            : undefined
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
