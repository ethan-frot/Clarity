import Link from 'next/link';
import { Suspense } from 'react';
import { SignInForm } from '@/module/user/signIn/ui/SignInForm';
import { AuthRedirectToast } from '@/components/app/auth/AuthRedirectToast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Connexion | Forum',
  description: 'Connectez-vous pour participer aux discussions',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={null}>
        <AuthRedirectToast />
      </Suspense>
      {/* Bouton retour */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Retour</span>
      </Link>

      {/* Carte de connexion avec Glassmorphism */}
      <Card className="w-full max-w-md border-white/5 bg-white/2 backdrop-blur-xl shadow-lg shadow-black/20">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-linear-to-br from-blue-500/80 to-violet-600/80 flex items-center justify-center shadow-md shadow-blue-500/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8 text-white/90"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold bg-linear-to-r from-white/90 to-blue-200/70 bg-clip-text text-transparent">
            Se connecter
          </CardTitle>
          <CardDescription className="text-white/50 text-base">
            Accédez à votre compte pour participer aux discussions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />

          {/* Séparateur */}
          <div className="relative mt-4 mb-2">
            <div className="flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
          </div>

          {/* Lien vers inscription */}
          <div className="text-center">
            <span className="bg-transparent px-2 text-white/40">
              Pas encore de compte ?
            </span>
            <Link
              href="/signup"
              className="text-sm text-blue-300/80 hover:text-blue-200 transition-colors font-medium hover:underline underline-offset-4"
            >
              S&apos;inscrire →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
