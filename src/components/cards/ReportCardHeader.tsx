"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  generateReportCards,
  validateReportCards,
  publishReportCards,
} from "@/lib/actions/report-cards"

type Props = {
  cls: { name: string; grade: { name: string } }
  term: { name: string; order: number; schoolYear: { name: string } }
  classId: number
  termId: number
  stats: {
    total: number
    generated: number
    validated: number
    published: number
  }
  termClosed: boolean
}

export function ReportCardHeader({
  cls, term, classId, termId, stats, termClosed,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null)
  const [confirm, setConfirm] = useState<"generate" | "validate" | "publish" | null>(null)

  const allGenerated = stats.generated + stats.validated + stats.published === stats.total
  const allValidated = stats.validated + stats.published === stats.total
  const allPublished = stats.published === stats.total

  const handleAction = (action: "generate" | "validate" | "publish") => {
    startTransition(async () => {
      setMessage(null)
      setConfirm(null)

      const fn =
        action === "generate" ? generateReportCards :
          action === "validate" ? validateReportCards :
            publishReportCards

      const result = await fn(classId, termId)

      setMessage({
        text: result.message,
        type: result.success ? "success" : "error",
      })

      if (result.success) router.refresh()
    })
  }

  const ordinal = ["", "1er", "2ème", "3ème"][term.order] ?? `${term.order}ème`

  return (
    <div className="space-y-4">

      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bulletins — {cls.name}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {ordinal} Trimestre · {term.schoolYear.name} · {cls.grade.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total élèves", value: stats.total, color: "bg-gray-100 text-gray-700" },
          { label: "Générés", value: stats.generated, color: "bg-blue-100 text-blue-700" },
          { label: "Validés", value: stats.validated, color: "bg-yellow-100 text-yellow-700" },
          { label: "Publiés", value: stats.published, color: "bg-green-100 text-green-700" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-lg p-4 ${stat.color}`}
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs mt-1 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Message feedback */}
      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${message.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
            }`}
        >
          {message.text}
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* GÉNÉRER */}
        {confirm === "generate" ? (
          <ConfirmInline
            label={`Regénérer les ${stats.total} bulletins ?`}
            onConfirm={() => handleAction("generate")}
            onCancel={() => setConfirm(null)}
            isPending={isPending}
            confirmClass="bg-blue-600 hover:bg-blue-700"
          />
        ) : (
          <button
            onClick={() => setConfirm("generate")}
            disabled={isPending || termClosed}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white
                       hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {stats.total === 0 ? "Aucun élève" : allGenerated ? "Regénérer" : "Générer les bulletins"}
          </button>
        )}

        {/* VALIDER */}
        {confirm === "validate" ? (
          <ConfirmInline
            label={`Valider les ${stats.generated} bulletins générés ?`}
            onConfirm={() => handleAction("validate")}
            onCancel={() => setConfirm(null)}
            isPending={isPending}
            confirmClass="bg-yellow-500 hover:bg-yellow-600"
          />
        ) : (
          <button
            onClick={() => setConfirm("validate")}
            disabled={isPending || stats.generated === 0}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-yellow-500 text-white
                       hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            Valider ({stats.generated})
          </button>
        )}

        {/* PUBLIER */}
        {confirm === "publish" ? (
          <ConfirmInline
            label={`Publier les ${stats.validated} bulletins ? Les parents pourront les voir.`}
            onConfirm={() => handleAction("publish")}
            onCancel={() => setConfirm(null)}
            isPending={isPending}
            confirmClass="bg-green-600 hover:bg-green-700"
          />
        ) : (
          <button
            onClick={() => setConfirm("publish")}
            disabled={isPending || stats.validated === 0}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white
                       hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            Publier ({stats.validated})
          </button>
        )}

        {/* Indicateur loading */}
        {isPending && (
          <span className="text-sm text-gray-500 animate-pulse">
            Traitement en cours...
          </span>
        )}
      </div>

      {/* Avertissement trimestre fermé */}
      {termClosed && (
        <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200
                      rounded px-3 py-2">
          Ce trimestre est clôturé. La génération est désactivée.
        </p>
      )}
    </div>
  )
}

// ── Confirmation inline (remplace un dialog) ──
function ConfirmInline({
  label,
  onConfirm,
  onCancel,
  isPending,
  confirmClass,
}: {
  label: string
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
  confirmClass: string
}) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200
                    rounded-lg px-4 py-2">
      <span className="text-sm text-gray-700 mr-2">{label}</span>
      <button
        onClick={onConfirm}
        disabled={isPending}
        className={`px-3 py-1 rounded text-sm font-medium text-white
                    disabled:opacity-50 transition-colors ${confirmClass}`}
      >
        {isPending ? "..." : "Confirmer"}
      </button>
      <button
        onClick={onCancel}
        disabled={isPending}
        className="px-3 py-1 rounded text-sm font-medium bg-gray-200
                   text-gray-700 hover:bg-gray-300 transition-colors"
      >
        Annuler
      </button>
    </div>
  )
}