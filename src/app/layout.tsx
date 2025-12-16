import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { BackgroundLayout } from '@/components/app/common/BackgroundLayout';
import { QueryClientProvider } from '@/components/providers/QueryClientProvider';
import { UserDropdown } from '@/components/app/common/UserDropdown';

const satoshi = localFont({
  src: [
    {
      path: '../../public/fonts/satoshi/Satoshi-Variable.woff2',
      style: 'normal',
    },
    {
      path: '../../public/fonts/satoshi/Satoshi-VariableItalic.woff2',
      style: 'italic',
    },
  ],
  variable: '--font-satoshi',
  weight: '300 900',
});

export const metadata: Metadata = {
  title: 'Forum | Architecture Clean & DDD',
  description:
    'Forum développé avec Clean Architecture et Domain-Driven Design',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${satoshi.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <QueryClientProvider>
          <BackgroundLayout>
            <div className="fixed top-6 right-6 z-50">
              <UserDropdown />
            </div>
            {children}
          </BackgroundLayout>
          <Toaster position="top-right" offset="30px" />
        </QueryClientProvider>
      </body>
    </html>
  );
}
