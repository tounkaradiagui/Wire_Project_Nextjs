const fmt = (n: number | null | undefined) =>
  n != null ? n.toFixed(2) : "—"

type SubjectReport = {
  subject: { name: string }
  coefficient: number
  classAverage: number | null     // Moy. Classe (moyenne de la matière dans la classe)
  assignmentScore: number | null  // Moy. Matière (note des devoirs/continue) → colonne "Moyenne"
  examScore: number | null         // Note de Compo
  finalAverage: number            // (assignmentScore + 2×examScore) / 3
  product: number | null          // finalAverage × coefficient
  appreciation: string | null
}

export function BulletinSubjectRow({
  sr,
  index,
}: {
  sr: SubjectReport
  index: number
}) {
  const isLow = sr.finalAverage < 10

  return (
    <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
      {/* Désignation */}
      <td className="px-4 py-2.5 font-medium text-gray-800 uppercase text-xs tracking-wide">
        {sr.subject.name}
      </td>

      {/* (A) Moy. Matière = assignmentScore */}
      <td className="px-3 py-2.5 text-center text-gray-600">
        {fmt(sr.assignmentScore)}
      </td>

      {/* (B) Note de Composition = examScore */}
      <td className="px-3 py-2.5 text-center text-gray-600">
        {fmt(sr.examScore)}
      </td>

      {/* Coefficient */}
      <td className="px-3 py-2.5 text-center text-gray-500">
        {sr.coefficient}
      </td>

      {/* Moyenne finale = (A + 2B) / 3 */}
      <td className="px-3 py-2.5 text-center">
        <span className={`font-bold ${isLow ? "text-red-500" : "text-gray-900"}`}>
          {fmt(sr.finalAverage)}
        </span>
      </td>

      {/* Produit */}
      <td className="px-3 py-2.5 text-center text-gray-600">
        {fmt(sr.product)}
      </td>

      {/* Appréciation */}
      <td className="px-3 py-2.5 text-center text-gray-500 text-xs">
        {sr.appreciation ?? "—"}
      </td>
    </tr>
  )
}