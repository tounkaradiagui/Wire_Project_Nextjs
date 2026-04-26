import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"


// Données nécessaires pour générer le rapport de fin d'année
type ReportCardData = {
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
  subjectReports: {
    id: number
    subject: { name: string }
    teacher: { name: string; surname: string }
    coefficient: number
    classAverage: number | null
    examScore: number | null
    assignmentScore: number | null
    continuousScore: number | null
    finalAverage: number
    product: number
    appreciation: string | null
  }[]
  termAverages: { termOrder: number; average: number | null }[]
}

// Formater les nombres avec 2 décimales ou afficher "—" si la valeur est nulle ou indéfinie
const fmt = (n: number | null) =>
  n !== null && n !== undefined ? n.toFixed(2) : "—"

// Géerer les styles du document PDF
const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingHorizontal: 30,
    paddingVertical: 24,
    color: "#111",
  },

  // En-tête
  headerBox: {
    border: "1pt solid #111",
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerCenter: {
    alignItems: "center",
    borderBottom: "1pt solid #111",
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginVertical: 6,
    letterSpacing: 1,
  },
  infoRow: {
    marginBottom: 2,
    fontSize: 9,
  },
  bold: { fontFamily: "Helvetica-Bold" },

  // Tableau matières
  table: {
    marginTop: 8,
    border: "1pt solid #111",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottom: "1pt solid #111",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #ccc",
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #ccc",
    backgroundColor: "#fafafa",
  },

  // Cellules
  cellDesignation: { width: "32%", padding: 4, borderRight: "0.5pt solid #aaa" },
  cellMoyClasse: { width: "14%", padding: 4, borderRight: "0.5pt solid #aaa", textAlign: "center" },
  cellCompo: { width: "14%", padding: 4, borderRight: "0.5pt solid #aaa", textAlign: "center" },
  cellCoef: { width: "8%", padding: 4, borderRight: "0.5pt solid #aaa", textAlign: "center" },
  cellMoyenne: { width: "14%", padding: 4, borderRight: "0.5pt solid #aaa", textAlign: "center" },
  cellProduit: { width: "10%", padding: 4, textAlign: "center" },
  cellApprec: { width: "8%", padding: 4, borderLeft: "0.5pt solid #aaa", textAlign: "center" },

  // Footer tableau
  tableFooter: {
    flexDirection: "row",
    borderTop: "1pt solid #111",
    paddingVertical: 4,
    paddingHorizontal: 6,
    justifyContent: "space-between",
    alignItems: "center",
  },
  generalAverage: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    border: "1pt solid #111",
    padding: "4 8",
  },

  // Section trimestres
  termRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  termBox: {
    border: "1pt solid #aaa",
    padding: "3 10",
    fontSize: 9,
  },

  // Stats classe
  statsRow: {
    marginTop: 4,
    fontSize: 9,
    border: "1pt solid #aaa",
    padding: "3 6",
  },

  // Rang + appréciation
  bottomRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rankText: { fontSize: 9 },
  appreciationBox: {
    border: "1pt solid #111",
    padding: "3 8",
    fontSize: 9,
  },
  decisionBox: {
    marginTop: 8,
    border: "1pt solid #111",
    padding: "4 8",
    fontSize: 9,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
})

// Composant principal pour générer le document PDF du bulletin de notes
export function ReportCardDocument({ data }: { data: ReportCardData }) {
  const { student, class: cls, term, subjectReports, termAverages } = data

  // ── Extraire toutes les expressions AVANT le return ──
  const ordinal = ["", "1er", "2ème", "3ème"][term.order] ?? `${term.order}ème`
  const birthdayStr = student.birthday
    ? new Date(student.birthday).toLocaleDateString("fr-FR")
    : "—"
  const sexStr = student.sex === "MALE" ? "M" : "F"

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* ── EN-TÊTE ── */}
        <View style={S.headerBox}>
          <View style={S.headerRow}>
            <Text style={S.bold}>MEAPLN</Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={S.bold}>REPUBLIQUE DU MALI</Text>
              <Text>Un Peuple - Un But - Une Foi</Text>
            </View>
          </View>
          <View style={S.headerCenter}>
            <Text>DIRECTION NATIONALE DE L'ENSEIGNEMENT SECONDAIRE GÉNÉRAL</Text>
          </View>
        </View>

        {/* ── TITRE ── */}
        <Text style={S.headerTitle}>BULLETIN TRIMESTRIEL DE NOTES</Text>

        {/* ── INFOS ÉLÈVE ── */}
        <View style={{ marginBottom: 6 }}>
          <Text style={S.infoRow}>
            <Text style={S.bold}>De l'élève : </Text>
            {`${student.name} ${student.surname} — ${student.cardNumber}`}
          </Text>
          <Text style={S.infoRow}>
            <Text style={S.bold}>Né(e) le : </Text>
            {`${birthdayStr}   `}
            <Text style={S.bold}>Sexe : </Text>
            {sexStr}
          </Text>
          <Text style={S.infoRow}>
            <Text style={S.bold}>{ordinal} TRIMESTRE</Text>
            {`  ${term.schoolYear.name}  *** Classe de : ${cls.name}`}
          </Text>
        </View>

        {/* ── TABLEAU DES MATIÈRES ── */}
        <View style={S.table}>
          <View style={S.tableHeader}>
            <Text style={[S.cellDesignation, S.bold]}>Désignation</Text>
            <Text style={[S.cellMoyClasse, S.bold]}>Moy. Classe</Text>
            <Text style={[S.cellCompo, S.bold]}>Note Compo</Text>
            <Text style={[S.cellCoef, S.bold]}>Coef</Text>
            <Text style={[S.cellMoyenne, S.bold]}>Moyenne</Text>
            <Text style={[S.cellProduit, S.bold]}>Produit</Text>
            <Text style={[S.cellApprec, S.bold]}>Appréciation</Text>
          </View>

          {subjectReports.map((sr, i) => {
            // ── Extraire par ligne aussi ──
            const appreciationStr = sr.appreciation ?? "—"
            const coefStr = String(sr.coefficient)

            return (
              <View key={sr.id} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
                <Text style={S.cellDesignation}>
                  {sr.subject.name.toUpperCase()}
                </Text>
                <Text style={S.cellMoyClasse}>{fmt(sr.assignmentScore)}</Text>
                <Text style={S.cellCompo}>{fmt(sr.examScore)}</Text>
                <Text style={S.cellCoef}>{coefStr}</Text>
                <Text style={S.cellMoyenne}>{fmt(sr.finalAverage)}</Text>
                <Text style={S.cellProduit}>{fmt(sr.product)}</Text>
                <Text style={S.cellApprec}>{appreciationStr}</Text>
              </View>
            )
          })}

          <View style={S.tableFooter}>
            <Text>
              {`Total des coefs : ${data.totalCoefficients}   Total des notes : ${fmt(data.totalPoints)}   Moyenne obtenue :`}
            </Text>
            <Text style={S.generalAverage}>
              {`${fmt(data.generalAverage)} / 20`}
            </Text>
          </View>
        </View>

        {/* ── MOYENNES PAR TRIMESTRE ── */}
        <View style={S.termRow}>
          {termAverages.map(({ termOrder, average }) => {
            const termLabel = termOrder === 1 ? "1er" : `${termOrder}ème`
            return (
              <View key={termOrder} style={S.termBox}>
                <Text>
                  {`My ${termLabel} Tr : ${fmt(average)}`}
                </Text>
              </View>
            )
          })}
        </View>

        {/* ── STATS DE LA CLASSE ── */}
        <View style={S.statsRow}>
          <Text>
            {`Plus forte moyenne : ${fmt(data.classHighest)}   Moyenne de la classe : ${fmt(data.classAverage)}   Plus faible moyenne : ${fmt(data.classLowest)}`}
          </Text>
        </View>

        {/* ── RANG + APPRÉCIATION ── */}
        <View style={S.bottomRow}>
          <Text style={S.rankText}>
            {`Rang : ${data.rank}ème / ${data.totalStudents} élèves`}
          </Text>
          <View style={S.appreciationBox}>
            <Text>
              {`APPRÉCIATION DU CHEF D'ÉTABLISSEMENT : ${data.appreciation ?? "—"}`}
            </Text>
          </View>
        </View>

        {/* ── DÉCISION ── */}
        {data.decision ? (
          <View style={S.decisionBox}>
            <Text>{data.decision}</Text>
          </View>
        ) : null}

      </Page>
    </Document>
  )
}