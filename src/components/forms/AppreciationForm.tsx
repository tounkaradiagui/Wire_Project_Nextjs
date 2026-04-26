"use client"

import { useState, useTransition } from "react"
import { updateSubjectAppreciation } from "@/lib/actions/report-cards"

// Liste des appréciations possibles pour les bulletins
const APPRECIATIONS = [
  "Excellent",
  "Très bien",
  "Bien",
  "Assez bien",
  "Passable",
  "Insuffisant",
  "Très insuffisant",
]

export function AppreciationForm({
  subjectReportId,
  initialValue,
}: {
  subjectReportId: number
  initialValue: string
}) {
  const [value, setValue] = useState(initialValue)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Gérer la mise à jour de l'appréciation en appelant l'API updateSubjectAppreciation avec le subjectReportId et la nouvelle valeur, 
  // et afficher un indicateur de chargement pendant la mise à jour, ainsi qu'une confirmation visuelle lorsque la sauvegarde est réussie
  const handleChange = (newValue: string) => {
    setValue(newValue)
    setSaved(false)
    startTransition(async () => {
      const result = await updateSubjectAppreciation(subjectReportId, newValue)
      if (result.success) setSaved(true)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5
                   bg-white text-gray-700 focus:outline-none focus:ring-2
                   focus:ring-gray-900 disabled:opacity-50 transition-all"
      >
        <option value="">— Choisir —</option>
        {APPRECIATIONS.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      {/* Indicateur sauvegarde */}
      {isPending && (
        <span className="text-xs text-gray-400 animate-pulse">...</span>
      )}
      {saved && !isPending && (
        <span className="text-xs text-green-600">✓</span>
      )}
    </div>
  )
}