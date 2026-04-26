"use client"

import { useState } from "react"

export function DownloadPdfButton({ reportCardId }: { reportCardId: number }) {
  const [loading, setLoading] = useState(false)

  // Gérer le clic pour télécharger le PDF
  const handleDownload = async () => {
    setLoading(true)
    try {
      // Appeler l'API pour générer le PDF
      const res = await fetch(`/api/report-cards/${reportCardId}/pdf`)
      if (!res.ok) throw new Error("Erreur PDF")

      // Télécharger le PDF
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `bulletin-${reportCardId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Erreur", err)
      alert("Impossible de générer le PDF.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                 bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50
                 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white
                           rounded-full animate-spin" />
          Génération...
        </>
      ) : (
        <>
          📄 Télécharger PDF
        </>
      )}
    </button>
  )
}