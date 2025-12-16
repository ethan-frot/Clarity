import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface PasswordResetEmailProps {
  resetUrl?: string; // Optionnel mais sert pour le mode preview
  userName?: string;
}

export default function PasswordResetEmail({
  resetUrl = 'https://clarity.ethanfrot.com/reset-password?token=preview-token-123',
  userName,
}: PasswordResetEmailProps) {
  // Extraire l'URL de base pour le lien du titre (avec fallback pour preview)
  const baseUrl = resetUrl
    ? new URL(resetUrl).origin
    : 'https://clarity.ethanfrot.com';

  return (
    <Html>
      <Head />
      <Preview>Réinitialisez votre mot de passe - Clarity</Preview>
      <Body style={main}>
        <Container style={container}>
          <Link href={baseUrl} style={headingLink}>
            Clarity
          </Link>

          <div
            dangerouslySetInnerHTML={{
              __html: `<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="width:600px;" arcsize="2%" fillcolor="#0f0f0f" stroke="t" strokecolor="#1a1a1a" strokeweight="1px">
<v:textbox inset="32px,32px,32px,32px">
<![endif]-->`,
            }}
          />

          <Section style={content}>
            <Text style={paragraph}>
              {userName ? `Bonjour ${userName},` : 'Bonjour,'}
            </Text>

            <Text style={paragraph}>
              Vous avez demandé la réinitialisation de votre mot de passe sur
              Clarity. Cliquez sur le bouton ci-dessous pour créer un nouveau
              mot de passe.
            </Text>

            <div>
              <div
                dangerouslySetInnerHTML={{
                  __html: `<!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetUrl}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="17%" stroke="f" fillcolor="#7C3AED">
    <w:anchorlock/>
    <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:600;">
      Réinitialiser mon mot de passe
    </center>
  </v:roundrect>
<![endif]-->`,
                }}
              />
              <div
                dangerouslySetInnerHTML={{
                  __html: `<!--[if !mso]><!-->`,
                }}
              />
              <Button style={button} href={resetUrl}>
                Réinitialiser mon mot de passe
              </Button>
              <div
                dangerouslySetInnerHTML={{
                  __html: `<!--<![endif]-->`,
                }}
              />
            </div>

            <Text style={paragraph}>
              Ce lien est valable pendant <strong>10 minutes</strong> et ne peut
              être utilisé qu&apos;une seule fois.
            </Text>

            <Text style={note}>
              Si vous n&apos;avez pas demandé cette réinitialisation, vous
              pouvez ignorer cet email en toute sécurité.
            </Text>
          </Section>

          <div
            dangerouslySetInnerHTML={{
              __html: `<!--[if mso]>
</v:textbox>
</v:roundrect>
<![endif]-->`,
            }}
          />

          <Text style={footer}>Clarity - Plateforme de discussions</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const headingLink = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#7C3AED',
  textAlign: 'center' as const,
  marginBottom: '40px',
  textDecoration: 'none',
  display: 'block',
};

const content = {
  backgroundColor: '#0f0f0f',
  border: '1px solid #1a1a1a',
  borderRadius: '12px',
  padding: '32px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#e5e5e5',
  marginBottom: '16px',
};

const button = {
  backgroundColor: '#7C3AED',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 28px',
  margin: '24px 0',
};

const note = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#a3a3a3',
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid #1a1a1a',
};

const footer = {
  fontSize: '12px',
  color: '#737373',
  textAlign: 'center' as const,
  marginTop: '32px',
};
