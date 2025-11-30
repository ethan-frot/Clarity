'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function AuthRedirectToast() {
  const searchParams = useSearchParams();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (hasShownToast.current) return;

    const reason = searchParams.get('reason');

    if (reason === 'create-conversation') {
      toast.info('Vous devez être connecté pour créer une conversation');
      hasShownToast.current = true;
    }
  }, [searchParams]);

  return null;
}
