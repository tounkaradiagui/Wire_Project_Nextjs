import "@/lib/pdf/polyfill"
import { jsPDF } from "jspdf"

// Types pour les rapports de matières (doivent correspondre à ce que le backend envoie)
type SubjectReport = {
  id: number
  subject: { name: string }
  coefficient: number
  classAverage: number | null
  assignmentScore: number | null
  examScore: number | null
  finalAverage: number
  product: number | null
  appreciation: string | null
}

// Types pour les données du PDF (doivent correspondre à ce que le backend envoie)
type PdfData = {
  generalAverage: number
  totalCoefficients: number
  totalPoints: number
  rank: number
  totalStudents: number
  classHighest: number | null
  classAverage: number | null
  classLowest: number | null
  appreciation: string | null
  decision: string | null
  student: {
    name: string
    surname: string
    cardNumber: string
    sex: string
    birthday: string | null
  }
  class: { name: string }
  term: {
    name: string
    order: number
    schoolYear: { name: string }
  }
  subjectReports: SubjectReport[]
  termAverages: { termOrder: number; average: number | null }[]
}

const fmt = (n: number | null | undefined) =>
  n != null ? n.toFixed(2) : "—"

// Générer un PDF à partir des données du rapport de fin d'année
export function generateReportCardPdf(data: PdfData): Uint8Array {
  // Créer un nouveau document PDF au format A4 portrait
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  // Définir les dimensions et marges de la page pour faciliter les calculs de positionnement
  const pageW = 210
  const margin = 14
  const contentW = pageW - margin * 2
  let y = 14

  // Utilitaire pour changer rapidement de police et taille
  const sf = (style: "normal" | "bold", size: number) => {
    doc.setFont("helvetica", style)
    doc.setFontSize(size)
  }

  // ─── EN-TÊTE (sans bordure, comme BulletinView) ───
  // Ligne 1 : MEAPLN à gauche | REPUBLIQUE DU MALI à droite
  sf("bold", 8)
  doc.text("MEAPLN", margin, y)
  doc.text("REPUBLIQUE DU MALI", pageW - margin, y, { align: "right" })
  y += 4

  sf("normal", 7)
  doc.text("Direction Nationale de l'Enseignement Secondaire Général", margin, y)
  doc.text("Un Peuple - Un But - Une Foi", pageW - margin, y, { align: "right" })
  y += 8

  // ─── TITRE ────────────────────────────────────────
  sf("bold", 14)
  doc.text("BULLETIN TRIMESTRIEL DE NOTES", pageW / 2, y, { align: "center" })
  y += 5

  const ordinal = ["", "1er", "2ème", "3ème"][data.term.order] ?? `${data.term.order}ème`
  sf("normal", 8)
  doc.setTextColor(100, 100, 100)
  doc.text(
    `${ordinal} Trimestre · ${data.term.schoolYear.name} · Classe : ${data.class.name}`,
    pageW / 2, y, { align: "center" }
  )
  doc.setTextColor(0, 0, 0)
  y += 8

  // ─── INFOS ÉLÈVE ──────────────────────────────────
  const birthday = data.student.birthday
    ? new Date(data.student.birthday).toLocaleDateString("fr-FR")
    : "—"
  const sex = data.student.sex === "MALE" ? "Masculin" : "Féminin"

  // Ligne 1 : Élève | N° (ID Unique)
  sf("normal", 9)
  doc.setTextColor(120, 120, 120)
  doc.text("Élève : ", margin, y)
  sf("bold", 9)
  doc.setTextColor(0, 0, 0)
  doc.text(
    `${data.student.surname} ${data.student.name}`,
    margin + 14, y
  )

  sf("normal", 9)
  doc.setTextColor(120, 120, 120)
  doc.text("ID Unique : ", pageW / 2, y)
  sf("normal", 9)
  doc.setTextColor(0, 0, 0)
  doc.text(data.student.cardNumber, pageW / 2 + 20, y)
  y += 5

  // Ligne 2 : Né(e) le | Sexe
  sf("normal", 9)
  doc.setTextColor(120, 120, 120)
  doc.text("Né(e) le : ", margin, y)
  sf("normal", 9)
  doc.setTextColor(0, 0, 0)
  doc.text(birthday, margin + 17, y)

  doc.setTextColor(120, 120, 120)
  doc.text("Sexe : ", pageW / 2, y)
  sf("bold", 9)
  doc.setTextColor(0, 0, 0)
  doc.text(sex, pageW / 2 + 12, y)
  y += 9

  // ─── COLONNES TABLEAU ─────────────────────────────
  // Proportions identiques au BulletinView
  const colDefs = [
    { key: "designation", label: "DÉSIGNATION", w: 0.22 },
    { key: "moyClasse", label: "MOY. CLASSE (A)", w: 0.15 },
    { key: "compo", label: "NOTE COMPO (B)", w: 0.15 },
    { key: "coef", label: "COEF", w: 0.08 },
    { key: "moyenne", label: "MOY. MATIÈRE (A+2B/3)", w: 0.16 },
    { key: "produit", label: "PRODUIT", w: 0.10 },
    { key: "appreci", label: "APPRÉCIATION", w: 0.14 },
  ]

  // Calculer les largeurs en mm
  const colWidths = colDefs.map(c => c.w * contentW)
  const colXs: number[] = []
  let cx = margin
  colWidths.forEach(w => { colXs.push(cx); cx += w })

  const rowH = 7
  const headerH = 8

  // ── Header ──
  doc.setFillColor(245, 245, 245)
  doc.setDrawColor(200, 200, 200)
  doc.rect(margin, y, contentW, headerH, "FD")

  // Textes header
  colDefs.forEach((col, i) => {
    sf("bold", 6.5)
    doc.setTextColor(100, 100, 100)
    const align = i === 0 ? "left" : "center"
    const tx = i === 0 ? colXs[i] + 2 : colXs[i] + colWidths[i] / 2
    // Wrap long labels
    const lines = doc.splitTextToSize(col.label, colWidths[i] - 2)
    const lineH = 2.8
    const startY = y + headerH / 2 - ((lines.length - 1) * lineH) / 2
    lines.forEach((line: string, li: number) => {
      doc.text(line, tx, startY + li * lineH + 1.5, { align })
    })
  })

  // Lignes verticales header
  doc.setDrawColor(200, 200, 200)
  colXs.slice(1).forEach(x => {
    doc.line(x, y, x, y + headerH)
  })

  y += headerH

  // ── Lignes matières ──
  data.subjectReports.forEach((sr, i) => {
    const fillColor: [number, number, number] = i % 2 === 0
      ? [255, 255, 255]
      : [250, 250, 250]

    doc.setFillColor(...fillColor)
    doc.setDrawColor(220, 220, 220)
    doc.rect(margin, y, contentW, rowH, "FD")

    // Lignes verticales
    colXs.slice(1).forEach(x => {
      doc.line(x, y, x, y + rowH)
    })

    const isLow = sr.finalAverage < 10
    const ty = y + rowH / 2 + 2.5

    // Désignation
    sf("normal", 7.5)
    doc.setTextColor(40, 40, 40)
    const maxChars = Math.floor(colWidths[0] / 1.9)
    const name = sr.subject.name.toUpperCase()
    const displayName = name.length > maxChars ? name.substring(0, maxChars - 1) + "." : name
    doc.text(displayName, colXs[0] + 2, ty)

    // Moy. Classe
    sf("normal", 8)
    doc.setTextColor(80, 80, 80)
    doc.text(fmt(sr.assignmentScore), colXs[1] + colWidths[1] / 2, ty, { align: "center" })

    // Note Compo
    doc.text(fmt(sr.examScore), colXs[2] + colWidths[2] / 2, ty, { align: "center" })

    // Coef
    doc.setTextColor(100, 100, 100)
    doc.text(String(sr.coefficient), colXs[3] + colWidths[3] / 2, ty, { align: "center" })

    // Moyenne (colorée)
    sf("bold", 8)
    doc.setTextColor(isLow ? 200 : 0, isLow ? 0 : 0, 0)
    doc.text(fmt(sr.finalAverage), colXs[4] + colWidths[4] / 2, ty, { align: "center" })

    // Produit
    sf("normal", 8)
    doc.setTextColor(80, 80, 80)
    doc.text(fmt(sr.product), colXs[5] + colWidths[5] / 2, ty, { align: "center" })

    // Appréciation
    doc.setTextColor(100, 100, 100)
    sf("normal", 7)
    doc.text(sr.appreciation ?? "—", colXs[6] + colWidths[6] / 2, ty, { align: "center" })

    doc.setTextColor(0, 0, 0)
    y += rowH
  })

  // Bordure externe tableau (header + rows)
  const tableStartY = y - data.subjectReports.length * rowH - headerH
  doc.setDrawColor(180, 180, 180)
  doc.rect(margin, tableStartY, contentW, headerH + data.subjectReports.length * rowH)

  // ─── FOOTER TABLEAU ───────────────────────────────
  y += 8
  sf("normal", 8)
  doc.setTextColor(80, 80, 80)
  doc.text("Total des coefs : ", margin, y)
  sf("bold", 8)
  doc.setTextColor(0, 0, 0)

  // Calculer positions dynamiques
  const tc = `${data.totalCoefficients}`
  const tn = `${fmt(data.totalPoints)}`
  doc.text(tc, margin + 28, y)
  sf("normal", 8)
  doc.setTextColor(80, 80, 80)
  doc.text(" · Total des notes : ", margin + 28 + doc.getTextWidth(tc), y)
  sf("bold", 8)
  doc.setTextColor(0, 0, 0)
  const afterCoef = margin + 28 + doc.getTextWidth(tc) + doc.getTextWidth(" · Total des notes : ")
  doc.text(tn, afterCoef, y)

  // Box moyenne générale (droite)
  const avgText = `${fmt(data.generalAverage)} / 20`
  const avgW = 30
  const avgX = pageW - margin - avgW
  const isLowAvg = data.generalAverage < 10

  doc.setDrawColor(isLowAvg ? 200 : 34, isLowAvg ? 0 : 197, isLowAvg ? 0 : 94)
  doc.setFillColor(isLowAvg ? 255 : 240, isLowAvg ? 240 : 253, isLowAvg ? 240 : 244)
  doc.rect(avgX, y - 4, avgW, 8, "FD")
  sf("bold", 11)
  doc.setTextColor(isLowAvg ? 200 : 22, isLowAvg ? 0 : 163, isLowAvg ? 0 : 74)
  doc.text(avgText, avgX + avgW / 2, y, { align: "center" })
  doc.setTextColor(0, 0, 0)
  doc.setDrawColor(0)

  y += 9

  // ─── MOYENNES TRIMESTRES ──────────────────────────
  const boxW = 44
  data.termAverages.forEach(({ termOrder, average }, i) => {
    const label = termOrder === 1 ? "1er" : `${termOrder}ème`
    const text = `Moy. ${label} Tr : ${average != null ? average.toFixed(2) : "—"}`
    const boxX = margin + i * (boxW + 3)
    const isCurrent = termOrder === data.term.order

    doc.setDrawColor(isCurrent ? 30 : 200, isCurrent ? 30 : 200, isCurrent ? 30 : 200)
    doc.setFillColor(isCurrent ? 30 : 255, isCurrent ? 30 : 255, isCurrent ? 30 : 255)
    doc.rect(boxX, y, boxW, 6, "FD")
    sf(isCurrent ? "bold" : "normal", 7.5)
    doc.setTextColor(isCurrent ? 255 : 80, isCurrent ? 255 : 80, isCurrent ? 255 : 80)
    doc.text(text, boxX + boxW / 2, y + 4, { align: "center" })
    doc.setTextColor(0, 0, 0)
  })

  y += 9

  // ─── STATS CLASSE ────────────────────────────────
  doc.setFillColor(248, 248, 248)
  doc.setDrawColor(200, 200, 200)
  doc.rect(margin, y, contentW, 7, "FD")
  sf("normal", 8)
  doc.setTextColor(80, 80, 80)
  doc.text(
    `Plus forte moyenne : ${fmt(data.classHighest)}     Moyenne de la classe : ${fmt(data.classAverage)}     Plus faible moyenne : ${fmt(data.classLowest)}`,
    pageW / 2, y + 4.5, { align: "center" }
  )
  doc.setTextColor(0, 0, 0)
  y += 12

  // ─── RANG + APPRÉCIATION ─────────────────────────
  // Rang (gauche)
  sf("normal", 8)
  doc.setTextColor(80, 80, 80)
  doc.text("Rang : ", margin, y)
  sf("bold", 11)
  doc.setTextColor(0, 0, 0)
  doc.text(`${data.rank}`, margin + 12, y)
  sf("normal", 8)
  doc.setTextColor(80, 80, 80)
  doc.text(`e`, margin + 12 + doc.getTextWidth(`${data.rank}`), y - 1)
  doc.text(` / ${data.totalStudents} élèves`, margin + 12 + doc.getTextWidth(`${data.rank}`) + 3, y)
  doc.setTextColor(0, 0, 0)

  // Appréciation (droite)
  if (data.appreciation) {
    const apprW = 95
    const apprX = pageW - margin - apprW
    doc.setDrawColor(180)
    doc.rect(apprX, y - 5, apprW, 7, "D")
    sf("normal", 7.5)
    doc.setTextColor(80, 80, 80)
    doc.text("Appréciation du Chef d'Établissement : ", apprX + 2, y)
    sf("bold", 7.5)
    doc.setTextColor(0, 0, 0)
    doc.text(
      data.appreciation,
      apprX + 2 + doc.getTextWidth("Appréciation du Chef d'Établissement : "), y
    )
  }

  y += 9

  // ─── DÉCISION ────────────────────────────────────
  if (data.decision) {
    doc.setFillColor(248, 248, 248)
    doc.setDrawColor(180)
    doc.rect(margin, y, contentW, 8, "FD")
    sf("bold", 9)
    doc.setTextColor(0, 0, 0)
    doc.text(data.decision.toUpperCase(), pageW / 2, y + 5, { align: "center" })
  }

  doc.setDrawColor(0)
  doc.setTextColor(0, 0, 0)

  return doc.output("arraybuffer") as unknown as Uint8Array
}