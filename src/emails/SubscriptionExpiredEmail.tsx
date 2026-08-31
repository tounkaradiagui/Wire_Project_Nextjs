import { Preview, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { EmailButton, EmailDivider } from "./components/EmailButton";
import { s, colors } from "./lib/styles";

type Props = {
  adminName: string;
  schoolName: string;
  expiredAt: string;
  renewUrl?: string;
  appName?: string;
};

export default function SubscriptionExpiredEmail({
  adminName,
  schoolName,
  expiredAt,
  renewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/abonnements`,
  appName = "Wagadu",
}: Props) {
  return (
    <EmailLayout appName={appName} preview={`Abonnement expiré — ${schoolName}`}>
      <Preview>Votre abonnement {appName} a expiré — renouvelez pour continuer</Preview>

      <Section style={s.content}>
        {/* Warning banner */}
        <div style={{
          background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
          borderRadius: "14px",
          padding: "24px",
          textAlign: "center",
          marginBottom: "28px",
          border: "1px solid #FCD34D",
        }}>
          <Text style={{ fontSize: "40px", margin: "0 0 8px" }}>⚠️</Text>
          <Text style={{ color: "#92400E", fontSize: "14px", fontWeight: 700, margin: 0 }}>
            Abonnement expiré
          </Text>
        </div>

        <Text style={s.h1}>Votre abonnement est arrivé à expiration</Text>
        <Text style={s.lead}>
          Bonjour <strong style={{ color: colors.navy }}>{adminName}</strong>, l'abonnement de{" "}
          <strong style={{ color: colors.navy }}>{schoolName}</strong> a expiré le{" "}
          <strong>{expiredAt}</strong>. L'accès à la plateforme est maintenant limité.
        </Text>

        {/* Impact */}
        <div style={{ ...s.highlight, backgroundColor: "#FEF3C7", borderLeft: "4px solid #F59E0B", margin: "0 0 24px" }}>
          <Text style={{ ...s.h2, color: "#92400E", margin: "0 0 10px" }}>Fonctionnalités suspendues :</Text>
          {[
            "Ajout de nouveaux élèves et enseignants",
            "Génération de bulletins",
            "Envoi de notifications aux parents",
          ].map((item, i) => (
            <Text key={i} style={{ ...s.text, color: "#78350F", margin: "0 0 6px" }}>
              ✗ {item}
            </Text>
          ))}
        </div>

        <EmailButton href={renewUrl ?? "#"} fullWidth>
          Renouveler mon abonnement →
        </EmailButton>

        <EmailDivider />

        <Text style={s.small}>
          Pour toute question ou pour bénéficier d'une extension, contactez notre équipe à{" "}
          <strong>support@wagadu.app</strong>. Vos données sont conservées pendant 30 jours.
        </Text>
      </Section>
    </EmailLayout>
  );
}