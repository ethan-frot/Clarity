'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="top-right"
      expand={true}
      gap={12}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            'backdrop-blur-xl border shadow-lg rounded-xl p-4 flex items-center gap-3 !w-auto !max-w-md toast-animated',
          title: 'font-medium text-sm whitespace-nowrap',
          description: 'text-xs opacity-90',
          actionButton:
            'bg-blue-500/20 text-blue-200 border border-blue-400/30 px-3 py-1.5 rounded-lg text-sm font-medium',
          cancelButton:
            'bg-white/10 text-white/70 border border-white/10 px-3 py-1.5 rounded-lg text-sm',
          closeButton:
            'bg-white/10 border border-white/10 text-white/70 hover:bg-white/20 rounded-md',
          success: '!bg-green-500/15 !border-green-400/30 !text-green-100',
          error: '!bg-red-500/15 !border-red-400/30 !text-red-100',
          warning: '!bg-yellow-500/15 !border-yellow-400/30 !text-yellow-100',
          info: '!bg-blue-500/15 !border-blue-400/30 !text-blue-100',
          loading: '!bg-white/10 !border-white/20 !text-white/90',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
