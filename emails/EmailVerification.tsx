import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface EmailVerificationProps {
  otpCode?: string;
  userName?: string;
}

export default function EmailVerification({
  otpCode = '123456',
  userName,
}: EmailVerificationProps) {
  const baseUrl = 'https://clarity.ethanfrot.com';

  return (
    <Html>
      <Head />
      <Preview>Vérifiez votre adresse email - Clarity</Preview>
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
              Bienvenue sur Clarity ! Pour activer votre compte et commencer à
              participer aux discussions, veuillez vérifier votre adresse email
              en utilisant le code de vérification ci-dessous.
            </Text>

            <div style={otpContainer}>
              <Text style={otpLabel}>Votre code de vérification :</Text>
              <Text style={otpCodeStyle}>{otpCode}</Text>
            </div>

            <Text style={paragraph}>
              Ce code est valable pendant <strong>24 heures</strong>. Après
              cette période, vous devrez demander un nouveau code de
              vérification.
            </Text>

            <Text style={note}>
              Si vous n&apos;avez pas créé de compte sur Clarity, vous pouvez
              ignorer cet email en toute sécurité.
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

const note = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#a3a3a3',
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid #1a1a1a',
};

const otpContainer = {
  backgroundColor: '#1a1a1a',
  border: '2px solid #7C3AED',
  borderRadius: '12px',
  padding: '24px',
  margin: '32px 0',
  textAlign: 'center' as const,
};

const otpLabel = {
  fontSize: '14px',
  color: '#a3a3a3',
  marginBottom: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const otpCodeStyle = {
  fontSize: '36px',
  fontWeight: '700',
  color: '#7C3AED',
  letterSpacing: '8px',
  margin: '0',
  fontFamily: 'monospace',
};

const footer = {
  fontSize: '12px',
  color: '#737373',
  textAlign: 'center' as const,
  marginTop: '32px',
};
