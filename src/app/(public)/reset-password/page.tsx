import Link from 'next/link';
import { ResetPasswordForm } from '@/module/user/resetPassword/ui/ResetPasswordForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, KeyRound, TriangleAlert } from 'lucide-react';

export const metadata = {
  title: 'Réinitialiser le mot de passe | Clarity',
  description: 'Définissez votre nouveau mot de passe',
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
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
            <KeyRound className="w-8 h-8 text-white/90" />
          </div>
          <CardTitle className="text-3xl font-bold bg-linear-to-r from-white/90 to-blue-200/70 bg-clip-text text-transparent">
            Nouveau mot de passe
          </CardTitle>
          <CardDescription className="text-white/50 text-base">
            Définissez votre nouveau mot de passe sécurisé
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <div className="space-y-4 text-center py-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <TriangleAlert className="w-8 h-8 text-red-400" />
              </div>
              <div className="space-y-2">
                <p className="text-white/90 font-medium">Lien invalide</p>
                <p className="text-white/60 text-sm">
                  Le lien de réinitialisation est manquant ou invalide.
                </p>
              </div>
              <Link
                href="/forgot-password"
                className="inline-block text-sm text-blue-300/80 hover:text-blue-200 transition-colors font-medium hover:underline underline-offset-4"
              >
                Demander un nouveau lien →
              </Link>
            </div>
          ) : (
            <ResetPasswordForm token={token} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
