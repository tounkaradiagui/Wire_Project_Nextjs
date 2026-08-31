import { Preview, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { EmailButton, EmailDivider } from "./components/EmailButton";
import { s, colors } from "./lib/styles";

type Props = {
  adminName: string;
  schoolName: string;
  expiresAt: string;
  daysLeft: number;
  renewUrl?: string;
  appName?: string;
};

export default function SubscriptionReminderEmail({
  adminName,
  schoolName,
  expiresAt,
  daysLeft,
  renewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/abonnements`,
  appName = "Wagadu",
}: Props) {
  const urgency = daysLeft <= 3;

  return (
    <EmailLayout appName={appName} preview={`Rappel — votre abonnement expire dans ${daysLeft} jour(s)`}>
      <Preview>Renouvelez votre abonnement {appName} avant le {expiresAt}</Preview>

      <Section style={s.content}>
        {/* Countdown banner */}
        <div style={{
          background: urgency
            ? "linear-gradient(135deg, #FEE2E2, #FECACA)"
            : `linear-gradient(135deg, ${colors.bgLight}, #E0E7FF)`,
          borderRadius: "14px",
          padding: "24px",
          textAlign: "center",
          marginBottom: "28px",
          border: `1px solid ${urgency ? "#FCA5A5" : colors.border}`,
        }}>
          <Text style={{ fontSize: "40px", margin: "0 0 8px" }}>{urgency ? "🚨" : "🔔"}</Text>
          <Text style={{
            color: urgency ? "#991B1B" : colors.navy,
            fontSize: "28px",
            fontWeight: 800,
            margin: "0 0 4px",
            letterSpacing: "-1px",
          }}>
            {daysLeft} jour{daysLeft > 1 ? "s" : ""}
          </Text>
          <Text style={{ color: urgency ? "#B91C1C" : colors.textGray, fontSize: "13px", margin: 0, fontWeight: 600 }}>
            avant expiration
          </Text>
        </div>

        <Text style={s.h1}>Rappel de renouvellement</Text>
        <Text style={s.lead}>
          Bonjour <strong style={{ color: colors.navy }}>{adminName}</strong>, l'abonnement de{" "}
          <strong style={{ color: colors.navy }}>{schoolName}</strong> expire le{" "}
          <strong>{expiresAt}</strong>. Renouvelez pour garantir la continuité du service.
        </Text>

        {/* Plan info */}
        <div style={{ ...s.highlight, margin: "0 0 24px" }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              {[
                { label: "École",     value: schoolName },
                { label: "Expire le", value: expiresAt },
                { label: "Jours restants", value: `${daysLeft} jour${daysLeft > 1 ? "s" : ""}` },
              ].map(({ label, value }) => (
                <tr key={label}>
                  <td style={{ paddingBottom: "10px", width: "45%" }}>
                    <Text style={{ ...s.small, margin: 0, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.06em" }}>
                      {label}
                    </Text>
                  </td>
                  <td style={{ paddingBottom: "10px" }}>
                    <Text style={{ ...s.text, margin: 0, fontWeight: 700, color: colors.textDark }}>
                      {value}
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <EmailButton href={renewUrl ?? "#"} fullWidth variant={urgency ? "danger" : "primary"}>
          Renouveler maintenant →
        </EmailButton>

        <EmailDivider />

        <Text style={s.small}>
          Après expiration, l'accès à la plateforme sera suspendu. Vos données restent conservées
          pendant 30 jours. Pour toute assistance : <strong>support@wagadu.app</strong>
        </Text>
      </Section>
    </EmailLayout>
  );
}