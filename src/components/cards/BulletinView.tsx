import { BulletinSubjectRow } from "@/components/cards/BulletinSubjectRow"


type SubjectReport = {
  id: number
  subject: { name: string }
  teacher: { name: string; surname: string }
  coefficient: number
  classAverage: number | null
  assignmentScore: number | null  // ← (A)
  examScore: number | null        // ← (B)
  finalAverage: number            // ← (A+2B)/3
  continuousScore: number | null
  product: number | null
  appreciation: string | null
}

type Props = {
  data: {
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
      birthday: Date | null
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
}

const fmt = (n: number | null | undefined) =>
  n != null ? n.toFixed(2) : "—"

export function BulletinView({ data }: Props) {
  const { student, class: cls, term, subjectReports, termAverages } = data
  const ordinal = ["", "1er", "2ème", "3ème"][term.order] ?? `${term.order}ème`

  return (
    <div className="bg-white border border-gray-300 rounded-xl overflow-hidden
                    shadow-sm print:shadow-none print:border-black">

      {/* ── EN-TÊTE ── */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              MEAPLN
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Direction Nationale de l'Enseignement Secondaire Général
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-700">REPUBLIQUE DU MALI</p>
            <p className="text-xs text-gray-400">Un Peuple - Un But - Une Foi</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <h1 className="text-xl font-black tracking-wide text-gray-900 uppercase">
            Bulletin Trimestriel de Notes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {ordinal} Trimestre · {term.schoolYear.name} · Classe : {cls.name}
          </p>
        </div>

        {/* Infos élève */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-400">Élève : </span>
            <span className="font-semibold text-gray-900">
              {student.surname} {student.name}
            </span>
          </div>
          <div>
            <span className="text-gray-400">ID Unique : </span>
            <span className="font-medium text-gray-700">{student.cardNumber}</span>
          </div>
          <div>
            <span className="text-gray-400">Né(e) le : </span>
            <span className="font-medium text-gray-700">
              {student.birthday
                ? new Date(student.birthday).toLocaleDateString("fr-FR")
                : "—"}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Sexe : </span>
            <span className="font-medium text-gray-700">
              {student.sex === "MALE" ? "Masculin" : "Féminin"}
            </span>
          </div>
        </div>
      </div>

      {/* ── TABLEAU MATIÈRES ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs
                           font-semibold text-gray-500 uppercase tracking-wide">
              <th className="text-left px-4 py-3">Désignation</th>
              <th className="text-center px-3 py-3">Moy. Classe {"(A)"}</th>
              <th className="text-center px-3 py-3">Note Compo {"(B)"}</th>
              <th className="text-center px-3 py-3">Coef</th>
              <th className="text-center px-3 py-3">Moy. Matière {"(A + 2B/3)"}</th>
              <th className="text-center px-3 py-3">Produit</th>
              <th className="text-center px-3 py-3">Appréciation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subjectReports.map((sr, i) => (
              <BulletinSubjectRow key={sr.id} sr={sr} index={i} />
            ))}
          </tbody>

          {/* Footer tableau */}
          <tfoot>
            <tr className="border-t-2 border-gray-300 bg-gray-50">
              <td colSpan={3} className="px-4 py-3 text-sm text-gray-600">
                Total des coefs :{" "}
                <span className="font-bold text-gray-900">
                  {data.totalCoefficients}
                </span>
                {"   "}· Total des notes :{" "}
                <span className="font-bold text-gray-900">
                  {fmt(data.totalPoints)}
                </span>
              </td>
              <td colSpan={4} className="px-4 py-3 text-right">
                <div className="inline-flex items-center gap-2">
                  <span className="text-sm text-gray-500">Moyenne obtenue :</span>
                  <span
                    className={`text-xl font-black px-3 py-1 rounded-lg border-2 ${data.generalAverage >= 10
                      ? "border-green-400 text-green-700 bg-green-50"
                      : "border-red-400 text-red-700 bg-red-50"
                      }`}
                  >
                    {fmt(data.generalAverage)} / 20
                  </span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── RÉCAP TRIMESTRES ── */}
      <div className="border-t border-gray-200 p-4 flex flex-wrap gap-3">
        {termAverages.map(({ termOrder, average }) => {
          const label = ["", "1er", "2ème", "3ème"][termOrder]
          const isCurrentTerm = termOrder === term.order
          return (
            <div
              key={termOrder}
              className={`px-4 py-2 rounded-lg border text-sm ${isCurrentTerm
                ? "border-gray-900 bg-gray-900 text-white font-bold"
                : "border-gray-200 text-gray-600"
                }`}
            >
              Moy. {label} Tr :{" "}
              <span className="font-bold">
                {average != null ? average.toFixed(2) : "—"}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── STATS CLASSE ── */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="flex flex-wrap gap-6 text-sm">
          {[
            { label: "Plus forte moyenne", value: data.classHighest },
            { label: "Moyenne de la classe", value: data.classAverage },
            { label: "Plus faible moyenne", value: data.classLowest },
          ].map(({ label, value }) => (
            <div key={label}>
              <span className="text-gray-400">{label} : </span>
              <span className="font-bold text-gray-900">{fmt(value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RANG + APPRÉCIATION ── */}
      <div className="border-t border-gray-200 px-4 py-4 flex flex-wrap
                      items-center justify-between gap-4">
        <div className="text-sm">
          <span className="text-gray-400">Rang : </span>
          <span className="font-black text-gray-900 text-lg">
            {data.rank}
            <span className="text-sm font-normal">e</span>
          </span>
          <span className="text-gray-400 text-sm">
            {" "}/ {data.totalStudents} élèves
          </span>
        </div>

        {data.appreciation && (
          <div className="border border-gray-300 rounded-lg px-4 py-2 text-sm">
            <span className="text-gray-400">
              Appréciation du Chef d'Établissement :{" "}
            </span>
            <span className="font-bold text-gray-900">{data.appreciation}</span>
          </div>
        )}
      </div>

      {/* ── DÉCISION ── */}
      {data.decision && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 text-center">
          <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Décision Administratif : {data.decision}
          </p>
        </div>
      )}
    </div>
  )
}