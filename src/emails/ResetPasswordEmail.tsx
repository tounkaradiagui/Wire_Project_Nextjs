import { Preview, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { EmailButton, EmailDivider } from "./components/EmailButton";
import { s, colors } from "./lib/styles";

type Props = {
  firstName: string;
  resetUrl: string;
  expiresInMinutes?: number;
  appName?: string;
};

export default function ResetPasswordEmail({
  firstName,
  resetUrl,
  expiresInMinutes = 15,
  appName = "Wagadu",
}: Props) {
  return (
    <EmailLayout appName={appName} preview={`Réinitialisation de votre mot de passe ${appName}`}>
      <Preview>Réinitialisez votre mot de passe — lien valable {expiresInMinutes} minutes</Preview>

      <Section style={s.content}>
        {/* Icon */}
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: "24px" }}>
          <tbody>
            <tr>
              <td align="center">
                <div style={{
                  width: "68px", height: "68px", borderRadius: "20px",
                  backgroundColor: "#FEF3C7",
                  border: "1px solid #FCD34D",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: "32px",
                }}>
                  🔑
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <Text style={s.h1}>Réinitialisation de votre mot de passe</Text>
        <Text style={s.lead}>
          Bonjour <strong style={{ color: colors.navy }}>{firstName}</strong>, nous avons reçu une
          demande de réinitialisation de mot de passe pour votre compte {appName}.
        </Text>

        {/* Timer badge */}
        <div style={{ textAlign: "center", margin: "0 0 20px" }}>
          <span style={{
            display: "inline-block",
            backgroundColor: "#FEF3C7",
            color: "#92400E",
            borderRadius: "999px",
            padding: "6px 16px",
            fontSize: "13px",
            fontWeight: 700,
            border: "1px solid #FCD34D",
          }}>
            ⏱ Valable {expiresInMinutes} minutes seulement
          </span>
        </div>

        <EmailButton href={resetUrl} fullWidth variant="primary">
          Réinitialiser mon mot de passe →
        </EmailButton>

        {/* Fallback URL */}
        <div style={{
          backgroundColor: colors.bgPage,
          borderRadius: "10px",
          padding: "14px 18px",
          margin: "20px 0",
        }}>
          <Text style={{ ...s.small, margin: "0 0 6px", color: colors.textGray }}>
            Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
          </Text>
          <Text style={{
            color: colors.blue,
            fontSize: "12px",
            fontFamily: "'Courier New', monospace",
            wordBreak: "break-all",
            margin: 0,
          }}>
            {resetUrl}
          </Text>
        </div>

        <EmailDivider />

        <div style={{
          backgroundColor: "#FEE2E2",
          borderRadius: "10px",
          padding: "14px 18px",
          border: "1px solid #FCA5A5",
        }}>
          <Text style={{ color: "#991B1B", fontSize: "13px", margin: 0, lineHeight: "1.6" }}>
            🚨 Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de
            passe restera inchangé. Vous pouvez aussi contacter <strong>support@wagadu.app</strong>.
          </Text>
        </div>
      </Section>
    </EmailLayout>
  );
}