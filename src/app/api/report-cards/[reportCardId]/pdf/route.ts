import "@/lib/pdf/polyfill"

import { getReportCardById, getTermAverages } from "@/lib/actions/report-cards"
import { generateReportCardPdf } from "@/lib/pdf/generate-pdf"
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reportCardId: string }> }
) {
  try {
    const { reportCardId } = await params
    const id = Number(reportCardId)

    const user = await currentUser()
    if (!user) return new NextResponse("Non autorisé", { status: 401 })

    const reportCard = await getReportCardById(id)
    const termAverages = await getTermAverages(
      reportCard.student.id,
      reportCard.term.schoolYear.id
    )

    const data = {
      generalAverage: reportCard.generalAverage,
      totalCoefficients: reportCard.totalCoefficients ?? 0,
      totalPoints: reportCard.totalPoints ?? 0,
      rank: reportCard.rank,
      totalStudents: reportCard.totalStudents,
      classHighest: reportCard.classHighest,
      classAverage: reportCard.classAverage,
      classLowest: reportCard.classLowest,
      appreciation: reportCard.appreciation,
      decision: reportCard.decision,
      student: {
        name: reportCard.student.name,
        surname: reportCard.student.surname,
        cardNumber: reportCard.student.cardNumber,
        sex: reportCard.student.sex,
        birthday: reportCard.student.birthday
          ? reportCard.student.birthday.toISOString()
          : null,
      },
      class: { name: reportCard.class.name },
      term: {
        name: reportCard.term.name,
        order: reportCard.term.order,
        schoolYear: { name: reportCard.term.schoolYear.name },
      },
      subjectReports: reportCard.subjectReports.map((sr) => ({
        id: sr.id,
        coefficient: sr.coefficient,
        classAverage: sr.classAverage,
        assignmentScore: sr.assignmentScore,
        examScore: sr.examScore,
        continuousScore: sr.continuousScore,
        finalAverage: sr.finalAverage,
        product: sr.product,
        appreciation: sr.appreciation,
        subject: { name: sr.subject.name },
        teacher: { name: sr.teacher.name, surname: sr.teacher.surname },
      })),
      termAverages,
    }
    const buffer = generateReportCardPdf(data)

    return new Response(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="bulletin-${reportCard.student.cardNumber}-T${reportCard.term.order}.pdf"`,
      },
    })

  } catch (error) {
    console.error("[PDF generation error]", error)
    return new NextResponse(`Erreur: ${String(error)}`, { status: 500 })
  }
}
