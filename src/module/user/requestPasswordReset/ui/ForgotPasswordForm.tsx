'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth/auth-client';
import { translateAuthError } from '@/lib/auth/translateAuthError';
import { EmailInput } from '@/components/app/common/form';
import { GradientButton } from '@/components/app/common/GradientButton';

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [lastEmailSent, setLastEmailSent] = useState('');
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendResetEmail = async (email: string) => {
    setIsLoading(true);

    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: '/reset-password',
      });

      if (result.error) {
        toast.error(translateAuthError(result.error.message));
        return;
      }

      setEmailSent(true);
      setLastEmailSent(email);
      setCountdown(60);
      toast.success(
        'Email envoyé ! Vérifiez votre boîte de réception (et vos spams).'
      );
    } catch {
      toast.error("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    reset();
    await sendResetEmail(data.email);
  };

  const handleResend = async () => {
    if (countdown > 0 || !lastEmailSent) return;
    await sendResetEmail(lastEmailSent);
  };

  if (emailSent) {
    return (
      <div className="space-y-4 text-center py-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-8 h-8 text-green-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <p className="text-white/90 font-medium">
            Email envoyé avec succès !
          </p>
          <p className="text-white/60 text-sm">
            Si un compte existe avec cette adresse, vous recevrez un email avec
            un lien de réinitialisation valable 10 minutes.
          </p>
          {lastEmailSent && (
            <p className="text-white/40 text-xs">
              Email envoyé à :{' '}
              <span className="text-white/60">{lastEmailSent}</span>
            </p>
          )}
        </div>

        {countdown > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-white/60">
              Vous pourrez renvoyer un email dans{' '}
              <span className="font-semibold text-blue-300">{countdown}s</span>
            </p>
            <button
              disabled
              className="text-sm text-white/30 font-medium cursor-not-allowed"
            >
              Renvoyer un email
            </button>
          </div>
        ) : (
          <button
            onClick={handleResend}
            disabled={isLoading}
            className="text-sm text-blue-300/80 hover:text-blue-200 transition-colors font-medium hover:underline underline-offset-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Envoi en cours...' : 'Renvoyer un email'}
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <EmailInput
        error={errors.email?.message}
        disabled={isLoading}
        {...register('email', {
          required: 'Adresse email requise',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Format email invalide',
          },
        })}
      />

      <GradientButton
        type="submit"
        className="w-full"
        isLoading={isLoading}
        loadingText="Envoi en cours..."
      >
        Envoyer le lien de réinitialisation
      </GradientButton>

      <p className="text-xs text-white/40 text-center">
        Vous recevrez un email avec un lien valable 10 minutes pour
        réinitialiser votre mot de passe.
      </p>
    </form>
  );
}
