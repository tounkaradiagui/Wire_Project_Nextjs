import { Preview, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { EmailButton, EmailDivider } from "./components/EmailButton";
import { s, colors } from "./lib/styles";

type Props = {
  firstName: string;
  role: "admin" | "teacher" | "parent" | "student";
  schoolName: string;
  appName?: string;
  loginUrl?: string;
};

const ROLE_LABELS: Record<Props["role"], string> = {
  admin:   "Administrateur",
  teacher: "Enseignant·e",
  parent:  "Parent",
  student: "Élève",
};

const ROLE_EMOJIS: Record<Props["role"], string> = {
  admin:   "🛡️",
  teacher: "👨‍🏫",
  parent:  "👨‍👩‍👧",
  student: "🎓",
};

export default function WelcomeEmail({
  firstName,
  role,
  schoolName,
  appName = "Wagadu",
  loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
}: Props) {
  return (
    <EmailLayout appName={appName} preview={`Bienvenue sur ${appName}, ${firstName} !`}>
      <Preview>Bienvenue sur {appName} — {schoolName}</Preview>

      <Section style={s.content}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: "24px" }}>
          <tbody>
            <tr>
              <td align="center">
                <div style={{
                  fontSize: "48px", lineHeight: 1,
                  background: colors.bgLight,
                  borderRadius: "20px",
                  padding: "16px",
                  display: "inline-block",
                }}>
                  {ROLE_EMOJIS[role]}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <Text style={s.h1}>Bienvenue, {firstName} ! 👋</Text>
        <Text style={s.lead}>
          Votre compte <strong style={{ color: colors.navy }}>{ROLE_LABELS[role]}</strong> a été
          créé avec succès sur {appName} pour l'établissement{" "}
          <strong style={{ color: colors.navy }}>{schoolName}</strong>.
        </Text>

        {/* Features list */}
        <div style={{ ...s.highlight, margin: "0 0 24px" }}>
          <Text style={{ ...s.h2, margin: "0 0 14px" }}>Ce que vous pouvez faire :</Text>
          {role === "admin" && [
            "Gérer les élèves, enseignants et parents",
            "Suivre les présences et absences",
            "Générer les bulletins de notes",
            "Communiquer avec toute la communauté scolaire",
          ].map((item, i) => (
            <Text key={i} style={{ ...s.text, margin: "0 0 8px" }}>
              ✓ {item}
            </Text>
          ))}
          {role === "teacher" && [
            "Consulter vos classes et emplois du temps",
            "Saisir les notes et appréciations",
            "Marquer les présences",
            "Communiquer avec les parents",
          ].map((item, i) => (
            <Text key={i} style={{ ...s.text, margin: "0 0 8px" }}>
              ✓ {item}
            </Text>
          ))}
          {role === "parent" && [
            "Suivre la scolarité de votre enfant",
            "Consulter les bulletins de notes",
            "Voir le calendrier scolaire",
            "Recevoir les notifications d'absence",
          ].map((item, i) => (
            <Text key={i} style={{ ...s.text, margin: "0 0 8px" }}>
              ✓ {item}
            </Text>
          ))}
        </div>

        <EmailButton href={loginUrl ?? "#"} fullWidth>
          Accéder à mon espace →
        </EmailButton>

        <EmailDivider />

        <Text style={s.small}>
          Si vous n'êtes pas à l'origine de cette création de compte, ignorez cet email ou
          contactez-nous à <strong>support@wagadu.app</strong>.
        </Text>
      </Section>
    </EmailLayout>
  );
}