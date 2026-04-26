
// Composant pour afficher le statut d'un bulletin  
type Status = "DRAFT" | "GENERATED" | "VALIDATED" | "PUBLISHED"


// Ajouter un statut "PENDING" pour les bulletins en attente de génération, qui n'ont pas encore de statut dans la base de données, et afficher "En attente" avec un badge gris dans ce cas
const config: Record<Status | "PENDING", { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "bg-gray-100 text-gray-600" },
  DRAFT: { label: "Brouillon", className: "bg-gray-100 text-gray-600" },
  GENERATED: { label: "Généré", className: "bg-blue-100 text-blue-700" },
  VALIDATED: { label: "Validé", className: "bg-yellow-100 text-yellow-700" },
  PUBLISHED: { label: "Publié", className: "bg-green-100 text-green-700" },
}


export function StatusBadge({ status }: { status: Status | "PENDING" }) {
  const { label, className } = config[status] ?? config.PENDING
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}