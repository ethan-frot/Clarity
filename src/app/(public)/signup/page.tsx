import Link from 'next/link';
import { SignUpForm } from '@/module/user/registerUser/ui/SignUpForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Inscription | Clarity',
  description: 'Créez votre compte pour participer aux discussions',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Retour</span>
      </Link>

      {/* Signup Card with Glassmorphism */}
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
                d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold bg-linear-to-r from-white/90 to-blue-200/70 bg-clip-text text-transparent">
            Créer un compte
          </CardTitle>
          <CardDescription className="text-white/50 text-base">
            Inscrivez-vous pour participer aux discussions du forum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />

          {/* Divider */}
          <div className="relative mt-4 mb-2">
            <div className="flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
          </div>

          {/* Sign in link */}
          <div className="text-center">
            <span className="bg-transparent px-2 text-white/40">
              Déjà un compte ?
            </span>
            <Link
              href="/signin"
              className="text-sm text-blue-300/80 hover:text-blue-200 transition-colors font-medium hover:underline underline-offset-4"
            >
              Se connecter →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
