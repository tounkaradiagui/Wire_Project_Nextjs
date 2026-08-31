import { Preview, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { EmailDivider } from "./components/EmailButton";
import { s, colors } from "./lib/styles";

type Props = {
  adminName: string;
  schoolName: string;
  plan: string;
  amount: number;
  currency?: string;
  paymentDate: string;
  nextRenewalDate: string;
  invoiceId: string;
  appName?: string;
};

export default function PaymentReceiptEmail({
  adminName,
  schoolName,
  plan,
  amount,
  currency = "XOF",
  paymentDate,
  nextRenewalDate,
  invoiceId,
  appName = "Wagadu",
}: Props) {
  const formattedAmount = new Intl.NumberFormat("fr-FR").format(amount);

  return (
    <EmailLayout appName={appName} preview={`Reçu de paiement — ${schoolName}`}>
      <Preview>Votre paiement de {formattedAmount} {currency} a bien été reçu</Preview>

      <Section style={s.content}>
        {/* Success banner */}
        <div style={{
          background: "linear-gradient(135deg, #F0FDF4, #DCFCE7)",
          borderRadius: "14px",
          padding: "24px",
          textAlign: "center",
          marginBottom: "28px",
          border: "1px solid #86EFAC",
        }}>
          <Text style={{ fontSize: "40px", margin: "0 0 8px" }}>✅</Text>
          <Text style={{ color: "#15803D", fontSize: "14px", fontWeight: 700, margin: 0 }}>
            Paiement confirmé
          </Text>
        </div>

        <Text style={s.h1}>Merci pour votre paiement !</Text>
        <Text style={s.lead}>
          Bonjour <strong style={{ color: colors.navy }}>{adminName}</strong>, nous confirmons
          la réception de votre paiement pour l'abonnement de{" "}
          <strong style={{ color: colors.navy }}>{schoolName}</strong>.
        </Text>

        {/* Amount highlight */}
        <div style={{
          backgroundColor: colors.navy,
          borderRadius: "14px",
          padding: "24px 28px",
          textAlign: "center",
          margin: "0 0 24px",
        }}>
          <Text style={{ color: "rgba(255,255,255,.5)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
            Montant payé
          </Text>
          <Text style={{ color: colors.white, fontSize: "36px", fontWeight: 800, letterSpacing: "-1.5px", margin: "0 0 4px" }}>
            {formattedAmount}
          </Text>
          <Text style={{ color: "rgba(255,255,255,.6)", fontSize: "14px", fontWeight: 600, margin: 0 }}>
            {currency}
          </Text>
        </div>

        {/* Invoice details */}
        <div style={{ ...s.highlight, margin: "0 0 24px", padding: "0" }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              {[
                { label: "Numéro de facture", value: `#${invoiceId}` },
                { label: "École",             value: schoolName },
                { label: "Plan",              value: plan },
                { label: "Date de paiement",  value: paymentDate },
                { label: "Prochain renouvellement", value: nextRenewalDate },
              ].map(({ label, value }, i, arr) => (
                <tr key={label}>
                  <td style={{
                    padding: "12px 20px",
                    borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : "none",
                    width: "50%",
                  }}>
                    <Text style={{ ...s.small, margin: 0, color: colors.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "11px" }}>
                      {label}
                    </Text>
                  </td>
                  <td style={{
                    padding: "12px 20px",
                    borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : "none",
                  }}>
                    <Text style={{ ...s.text, margin: 0, fontWeight: 700, color: colors.textDark }}>
                      {value}
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <EmailDivider />

        <Text style={s.small}>
          Conservez cet email comme justificatif de paiement. Pour toute question ou pour télécharger
          votre facture officielle, contactez <strong>support@wagadu.app</strong>.
        </Text>
      </Section>
    </EmailLayout>
  );
}