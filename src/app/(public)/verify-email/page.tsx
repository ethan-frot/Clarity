'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient, sendVerificationEmail } from '@/lib/auth/auth-client';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { GradientButton } from '@/components/app/common/GradientButton';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    const newOtp = [...otp];

    for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex((val) => !val);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      toast.error('Veuillez entrer un code à 6 chiffres');
      return;
    }

    if (!email) {
      toast.error('Email manquant');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await authClient.emailOtp.verifyEmail({
        email,
        otp: otpCode,
      });

      if (result.error) {
        toast.error(result.error.message || 'Code incorrect ou expiré');
        return;
      }

      setIsSuccess(true);
      toast.success('Email vérifié ! Connexion automatique...');

      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || !canResend) return;

    setIsResending(true);
    try {
      const result = await sendVerificationEmail({
        email,
        callbackURL: `/verify-email?email=${encodeURIComponent(email)}`,
      });

      if (result.error) {
        toast.error(
          result.error.message || "Erreur lors de l'envoi de l'email"
        );
        return;
      }

      toast.success('Code renvoyé avec succès');

      setCanResend(false);
      setCountdown(60);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error("Erreur lors de l'envoi de l'email");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="pt-6">
            <p className="text-white/70 text-center">Email manquant</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Email vérifié !</h2>
            <p className="text-white/70">Connexion automatique en cours...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <h1 className="text-2xl font-bold text-white text-center">
            Vérifiez votre email
          </h1>
          <p className="text-white/70 text-center text-sm mt-2">
            Entrez le code de vérification envoyé à
          </p>
          <p className="text-blue-400 text-center font-mono text-sm">{email}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isVerifying}
                className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ))}
          </div>

          <GradientButton
            onClick={handleVerify}
            isLoading={isVerifying}
            loadingText="Vérification..."
            disabled={otp.some((digit) => !digit)}
          >
            Vérifier
          </GradientButton>

          <div className="pt-4 border-t border-white/10">
            <p className="text-white/70 text-center text-sm mb-3">
              Vous n&apos;avez pas reçu le code ?
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={!canResend || isResending}
              className="w-full bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 text-blue-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isResending
                ? 'Envoi en cours...'
                : !canResend
                  ? `Renvoyer dans ${countdown}s`
                  : 'Renvoyer le code'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
