import { Preview, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { EmailButton, EmailDivider } from "./components/EmailButton";
import { s, colors } from "./lib/styles";

type Props = {
  parentName: string;
  childName: string;
  childClass: string;
  schoolName: string;
  username: string;
  password: string;
  appName?: string;
  loginUrl?: string;
};

export default function ParentInvitationEmail({
  parentName,
  childName,
  childClass,
  schoolName,
  username,
  password,
  appName = "Wagadu",
  loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
}: Props) {
  return (
    <EmailLayout appName={appName} preview={`Accédez au suivi scolaire de ${childName}`}>
      <Preview>Votre espace parent pour {childName} est prêt</Preview>

      <Section style={s.content}>
        <div style={{
          background: `linear-gradient(135deg, #F0FDF4, #DCFCE7)`,
          borderRadius: "14px",
          padding: "24px",
          textAlign: "center",
          marginBottom: "28px",
        }}>
          <Text style={{ fontSize: "40px", margin: "0 0 8px" }}>👨‍👩‍👧</Text>
          <Text style={{ color: "#16A34A", fontSize: "13px", fontWeight: 600, margin: 0 }}>
            Espace parent activé
          </Text>
        </div>

        <Text style={s.h1}>Bonjour, {parentName} !</Text>
        <Text style={s.lead}>
          Votre espace parent est désormais actif sur {appName} pour suivre la scolarité
          de <strong style={{ color: colors.navy }}>{childName}</strong>.
        </Text>

        {/* Child info */}
        <div style={{ ...s.highlight, margin: "0 0 24px" }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              {[
                { label: "Élève",      value: childName },
                { label: "Classe",     value: childClass },
                { label: "École",      value: schoolName },
              ].map(({ label, value }) => (
                <tr key={label}>
                  <td style={{ paddingBottom: "10px", width: "40%" }}>
                    <Text style={{ ...s.small, color: colors.textMuted, margin: 0, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "11px" }}>
                      {label}
                    </Text>
                  </td>
                  <td style={{ paddingBottom: "10px" }}>
                    <Text style={{ ...s.text, margin: 0, fontWeight: 600, color: colors.textDark }}>
                      {value}
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Credentials */}
        <div style={{ backgroundColor: colors.navy, borderRadius: "14px", padding: "24px 28px", margin: "0 0 24px" }}>
          <Text style={{ color: "rgba(255,255,255,.45)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 18px" }}>
            🔐 Vos identifiants
          </Text>
          {[
            { label: "Identifiant", value: username },
            { label: "Mot de passe", value: password, mono: true },
          ].map(({ label, value, mono }) => (
            <div key={label} style={{ marginBottom: "14px" }}>
              <Text style={{ color: "rgba(255,255,255,.4)", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 3px" }}>
                {label}
              </Text>
              <Text style={{
                color: colors.white, fontSize: mono ? "16px" : "15px", fontWeight: 700,
                fontFamily: mono ? "'Courier New', monospace" : "inherit", margin: 0,
                background: mono ? "rgba(255,255,255,.08)" : "transparent",
                padding: mono ? "5px 10px" : 0, borderRadius: mono ? "7px" : 0,
                display: "inline-block",
              }}>
                {value}
              </Text>
            </div>
          ))}
        </div>

        <EmailButton href={loginUrl ?? "#"} fullWidth>
          Accéder à l'espace parent →
        </EmailButton>

        <EmailDivider />

        <Text style={s.small}>
          Sur la plateforme, vous pouvez consulter les notes, absences, emplois du temps
          et bulletins de {childName} en temps réel.
        </Text>
      </Section>
    </EmailLayout>
  );
}