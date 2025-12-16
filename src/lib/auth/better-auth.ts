import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { Resend } from 'resend';
import { render } from '@react-email/components';
import PasswordResetEmail from '@/../emails/PasswordResetEmail';
import EmailVerification from '@/../emails/EmailVerification';
import { prisma } from '../prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 600,
    sendResetPassword: async ({ user, url }) => {
      const isDev = process.env.NODE_ENV === 'development';
      const authorizedEmail = process.env.RESEND_DEV_EMAIL;

      // En dev, vérifier si l'email est autorisé AVANT d'essayer d'envoyer
      if (isDev && authorizedEmail && user.email !== authorizedEmail) {
        console.warn(
          '\n⚠️  EMAIL NON AUTORISÉ (Mode développement) ⚠️\n' +
            '─────────────────────────────────────────────────────────────\n' +
            `📧 Email demandé      : ${user.email}\n` +
            `✅ Email autorisé     : ${authorizedEmail}\n` +
            '💡 Raison             : Plan gratuit Resend \n\n' +
            "➡️  Pour tester l'envoi, utilisez l'email autorisé\n" +
            '    ou passez en production avec un domaine vérifié.\n' +
            '─────────────────────────────────────────────────────────────\n'
        );
        return; // Ne pas envoyer, ne pas throw
      }

      // En prod, envoyer l'email normalement
      try {
        const emailHtml = await render(
          PasswordResetEmail({
            resetUrl: url,
            userName: user.name || undefined,
          })
        );

        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
          to: user.email,
          subject: 'Réinitialisation de votre mot de passe - Forum-NextJs',
          html: emailHtml,
        });
      } catch (error) {
        console.error(
          '❌ [Resend Error] Échec envoi email de réinitialisation:',
          error
        );

        if (
          error instanceof Error &&
          error.message.includes('not authorized')
        ) {
          console.error(
            '\n⚠️  ERREUR RESEND (403 Forbidden) ⚠️\n' +
              '─────────────────────────────────────────────────────────────\n' +
              `Email destinataire : ${user.email}\n` +
              "Cause : Cet email n'est pas autorisé par Resend\n\n" +
              'Solution : Vérifiez RESEND_DEV_EMAIL dans .env.local\n' +
              '─────────────────────────────────────────────────────────────\n'
          );
        }

        // En prod, throw l'erreur (comportement normal)
        if (!isDev) {
          throw error;
        }

        // En dev, ne pas throw pour éviter 500 (retourne 200 OK)
        return;
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 30,
    },
  },
  socialProviders: {
    // Pas de providers OAuth pour l'instant
  },
  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true,
      sendVerificationOnSignUp: true,
      otpLength: 6,
      expiresIn: 60 * 60 * 24,
      storeOTP: 'hashed',
      sendVerificationOTP: async ({ email, otp }) => {
        const isDev = process.env.NODE_ENV === 'development';
        const authorizedEmail = process.env.RESEND_DEV_EMAIL;

        // En dev, vérifier si l'email est autorisé
        if (isDev && authorizedEmail && email !== authorizedEmail) {
          console.warn(
            '\n⚠️  EMAIL NON AUTORISÉ (Mode développement) ⚠️\n' +
              '─────────────────────────────────────────────────────────────\n' +
              `📧 Email demandé      : ${email}\n` +
              `✅ Email autorisé     : ${authorizedEmail}\n` +
              '💡 Raison             : Plan gratuit Resend \n\n' +
              "➡️  Pour tester l'envoi, utilisez l'email autorisé\n" +
              '    ou passez en production avec un domaine vérifié.\n' +
              '─────────────────────────────────────────────────────────────\n'
          );
          return;
        }

        try {
          const emailHtml = await render(
            EmailVerification({
              otpCode: otp,
              userName: undefined,
            })
          );

          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: email,
            subject: 'Vérifiez votre adresse email - Forum-NextJs',
            html: emailHtml,
          });
        } catch (error) {
          console.error(
            '❌ [Resend Error] Échec envoi email de vérification OTP:',
            error
          );

          if (
            error instanceof Error &&
            error.message.includes('not authorized')
          ) {
            console.error(
              '\n⚠️  ERREUR RESEND (403 Forbidden) ⚠️\n' +
                '─────────────────────────────────────────────────────────────\n' +
                `Email destinataire : ${email}\n` +
                "Cause : Cet email n'est pas autorisé par Resend\n\n" +
                'Solution : Vérifiez RESEND_DEV_EMAIL dans .env.local\n' +
                '─────────────────────────────────────────────────────────────\n'
            );
          }

          if (!isDev) {
            throw error;
          }

          return;
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET!,
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
});
