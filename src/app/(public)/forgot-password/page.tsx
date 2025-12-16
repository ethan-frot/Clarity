import Link from 'next/link';
import { ForgotPasswordForm } from '@/module/user/requestPasswordReset/ui/ForgotPasswordForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Mot de passe oublié | Clarity',
  description: 'Réinitialisez votre mot de passe',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Link
        href="/signin"
        className="absolute top-8 left-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Retour à la connexion</span>
      </Link>

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
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold bg-linear-to-r from-white/90 to-blue-200/70 bg-clip-text text-transparent">
            Mot de passe oublié ?
          </CardTitle>
          <CardDescription className="text-white/50 text-base">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />

          <div className="relative mt-4 mb-2">
            <div className="flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
          </div>

          <div className="text-center">
            <span className="bg-transparent px-2 text-white/40">
              Vous vous souvenez de votre mot de passe ?
            </span>
            <br />
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
