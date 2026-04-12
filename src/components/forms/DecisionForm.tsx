import { useState, useTransition } from "react"
import { updateReportCardAppreciation } from "@/lib/actions/report-cards"

const DECISIONS = [
  "Passant(e) en classe supérieure",
  "Redoublant(e)",
  "Félicitations du jury",
  "Encouragements du jury",
  "Avertissement",
  "Conseil de discipline",
]

export function DecisionForm({ reportCardId }: { reportCardId: number }) {
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleUpdate = (field: "decision", value: string) => {
    setSaved(false)
    startTransition(async () => {
      const result = await updateReportCardAppreciation(
        reportCardId,
        field === "decision" ? value : undefined
      )
      if (result.success) setSaved(true)
    })
  }

  return (
    <div className="flex flex-col gap-1 items-center">
      {/* Décision */}
      <select
        onChange={(e) => handleUpdate("decision", e.target.value)}
        disabled={isPending}
        className="text-xs border border-gray-200 rounded px-2 py-1 w-full
                   bg-white text-gray-700 focus:outline-none focus:ring-1
                   focus:ring-gray-900 disabled:opacity-50"
      >
        <option value="">Décision Administratif</option>
        {DECISIONS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Feedback */}
      {isPending && <span className="text-xs text-gray-400 animate-pulse">...</span>}
      {saved && !isPending && <span className="text-xs text-green-600">✓</span>}
    </div>
  )
}