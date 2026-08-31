import { Preview, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { EmailButton, EmailDivider } from "./components/EmailButton";
import { s, colors } from "./lib/styles";

type Props = {
  teacherName: string;
  schoolName: string;
  subjects?: string[];
  username: string;
  password: string;
  appName?: string;
  loginUrl?: string;
};

export default function TeacherInvitationEmail({
  teacherName,
  schoolName,
  subjects = [],
  username,
  password,
  appName = "Wagadu",
  loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
}: Props) {
  return (
    <EmailLayout appName={appName} preview={`Invitation enseignant — ${schoolName}`}>
      <Preview>Vous avez été ajouté·e comme enseignant·e à {schoolName}</Preview>

      <Section style={s.content}>
        {/* Header illustration */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.bgLight}, #E0E7FF)`,
          borderRadius: "14px",
          padding: "24px",
          textAlign: "center",
          marginBottom: "28px",
        }}>
          <Text style={{ fontSize: "40px", margin: "0 0 8px" }}>👨‍🏫</Text>
          <Text style={{ color: colors.blue, fontSize: "13px", fontWeight: 600, margin: 0 }}>
            Invitation enseignant·e
          </Text>
        </div>

        <Text style={s.h1}>Bonjour, {teacherName} !</Text>
        <Text style={s.lead}>
          Vous avez été ajouté·e en tant qu'enseignant·e à{" "}
          <strong style={{ color: colors.navy }}>{schoolName}</strong> sur la plateforme {appName}.
        </Text>

        {subjects.length > 0 && (
          <div style={{
            backgroundColor: colors.bgLight,
            borderRadius: "12px",
            padding: "16px 20px",
            margin: "0 0 24px",
          }}>
            <Text style={{ ...s.small, color: colors.textGray, marginBottom: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Matières assignées
            </Text>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {subjects.map((sub) => (
                <span key={sub} style={{
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "999px",
                  padding: "4px 12px",
                  fontSize: "13px",
                  color: colors.textDark,
                  fontWeight: 600,
                  display: "inline-block",
                  marginRight: "6px",
                  marginBottom: "6px",
                }}>
                  {sub}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Credentials */}
        <div style={{
          backgroundColor: colors.navy,
          borderRadius: "14px",
          padding: "24px 28px",
          margin: "0 0 24px",
        }}>
          <Text style={{ color: "rgba(255,255,255,.45)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 18px" }}>
            🔐 Vos identifiants
          </Text>
          {[
            { label: "Identifiant", value: username },
            { label: "Mot de passe temporaire", value: password, mono: true },
          ].map(({ label, value, mono }) => (
            <div key={label} style={{ marginBottom: "14px" }}>
              <Text style={{ color: "rgba(255,255,255,.4)", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 3px" }}>
                {label}
              </Text>
              <Text style={{
                color: colors.white,
                fontSize: mono ? "16px" : "15px",
                fontWeight: 700,
                fontFamily: mono ? "'Courier New', monospace" : "inherit",
                margin: 0,
                background: mono ? "rgba(255,255,255,.08)" : "transparent",
                padding: mono ? "5px 10px" : 0,
                borderRadius: mono ? "7px" : 0,
                display: "inline-block",
              }}>
                {value}
              </Text>
            </div>
          ))}
        </div>

        <EmailButton href={loginUrl ?? "#"} fullWidth>
          Rejoindre mon espace enseignant →
        </EmailButton>

        <EmailDivider />

        <Text style={s.small}>
          Pensez à changer votre mot de passe après la première connexion. Des questions ?
          Contactez l'administration de {schoolName}.
        </Text>
      </Section>
    </EmailLayout>
  );
}