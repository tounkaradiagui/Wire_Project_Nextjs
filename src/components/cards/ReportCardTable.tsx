"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { StatusBadge } from "@/components/cards/StatusBadge"
import { DecisionForm } from "@/components/forms/DecisionForm"

type Row = {
  student: {
    id: string
    name: string
    surname: string
    cardNumber: string
    image: string | null
  }
  reportCard: {
    id: number
    status: string
    generalAverage: number
    rank: number
    generatedAt: Date | null
    publishedAt: Date | null
  } | null
}

type Props = {
  rows: Row[]
  classId: number
  termId: number
  currentFilter: string
  role: string
}

const FILTERS = [
  { value: "ALL", label: "Tous" },
  { value: "PENDING", label: "En attente" },
  { value: "GENERATED", label: "Générés" },
  { value: "VALIDATED", label: "Validés" },
  { value: "PUBLISHED", label: "Publiés" },
]

export function ReportCardTable({
  rows, classId, termId, currentFilter, role,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const isTeacher = role === "TEACHER"
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN"

  const handleFilter = (value: string) => {
    const params = new URLSearchParams()
    if (value !== "ALL") params.set("status", value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${currentFilter === f.value
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Élève</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Moyenne</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Rang</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Généré le</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
              {/* Colonne appréciation visible teacher seulement */}
              {isTeacher && (
                <th className="text-center px-4 py-3 font-semibold text-gray-600">
                  Appréciations
                </th>
              )}
              {/* Colonne décision visible admin seulement */}
              {isAdmin && (
                <th className="text-center px-4 py-3 font-semibold text-gray-600">
                  Décision
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  Aucun élève pour ce filtre.
                </td>
              </tr>
            ) : (
              rows.map(({ student, reportCard }, index) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Numéro */}
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {index + 1}
                  </td>

                  {/* Élève */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center
                                      justify-center text-xs font-bold text-gray-600 shrink-0">
                        {student.name[0]}{student.surname[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.surname} {student.name}
                        </p>
                        <p className="text-xs text-gray-400">{student.cardNumber}</p>
                      </div>
                    </div>
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={
                        (reportCard?.status as any) ?? "PENDING"
                      }
                    />
                  </td>

                  {/* Moyenne */}
                  <td className="px-4 py-3 text-center">
                    {reportCard ? (
                      <span
                        className={`font-bold ${reportCard.generalAverage >= 10
                          ? "text-green-600"
                          : "text-red-500"
                          }`}
                      >
                        {reportCard.generalAverage.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>

                  {/* Rang */}
                  <td className="px-4 py-3 text-center text-gray-600">
                    {reportCard?.rank ? `${reportCard.rank}e` : "—"}
                  </td>

                  {/* Généré le */}
                  <td className="px-4 py-3 text-center text-gray-400 text-xs">
                    {reportCard?.generatedAt
                      ? new Date(reportCard.generatedAt).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>


                  {/* Actions */}
                  {/* Dans la colonne Actions de ReportCardTable */}
                  <td className="px-4 py-3 text-center">
                    {reportCard ? (
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/bulletins/${reportCard.id}`}
                          className="px-3 py-1 rounded-lg text-xs font-medium
                                    bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          👁 Voir
                        </Link>

                        <a href={`/api/report-cards/${reportCard.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-lg text-xs font-medium
                                    bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                        >
                          📄 PDF
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">Non généré</span>
                    )}
                  </td>

                  {/* Appréciations — teacher uniquement */}
                  {isTeacher && (
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/report-cards/${classId}/${termId}/appreciations`}
                        className="px-3 py-1 rounded-lg text-xs font-medium
                                   bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        ✏️ Appréciations
                      </Link>
                    </td>
                  )}

                  {/* Décision — admin uniquement */}
                  {isAdmin && (
                    <td className="px-4 py-3 text-center">
                      {reportCard ? (
                        <DecisionForm reportCardId={reportCard.id} />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400">
        {rows.length} élève{rows.length > 1 ? "s" : ""} affiché{rows.length > 1 ? "s" : ""}
      </p>
    </div>
  )
}