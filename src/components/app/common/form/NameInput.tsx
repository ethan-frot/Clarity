'use client';

import { forwardRef } from 'react';
import { User } from 'lucide-react';
import { IconInput } from '../IconInput';

interface NameInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'icon'
> {
  id?: string;
  label?: string;
  error?: string;
  optional?: boolean;
}

export const NameInput = forwardRef<HTMLInputElement, NameInputProps>(
  (
    {
      id = 'name',
      label = 'Nom',
      error,
      placeholder = 'Alice Dupont',
      optional = false,
      ...props
    },
    ref
  ) => {
    return (
      <IconInput
        ref={ref}
        id={id}
        label={label}
        type="text"
        icon={User}
        placeholder={placeholder}
        error={error}
        optional={optional}
        {...props}
      />
    );
  }
);

NameInput.displayName = 'NameInput';
