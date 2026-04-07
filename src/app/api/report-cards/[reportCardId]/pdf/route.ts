// // app/api/report-cards/[reportCardId]/pdf/route.ts
// import { renderToBuffer } from "@react-pdf/renderer"
// import { ReportCardDocument } from "@/components/pdf/ReportCardDocument"
// // import { getReportCardById, getTermAverages } from "@/actions/report-cards"
// import { createElement } from "react"

// export async function GET(
//   _req: Request,
//   { params }: { params: { reportCardId: string } }
// ) {
//   const reportCard = await getReportCardById(Number(params.reportCardId))
//   const termAverages = await getTermAverages(
//     reportCard.student.id,         // ← champ id du student
//     reportCard.term.schoolYear.id
//   )

//   const buffer = await renderToBuffer(
//     createElement(ReportCardDocument, {
//       data: { ...reportCard, termAverages },
//     })
//   )

//   return new Response(buffer, {
//     headers: {
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename="bulletin-${reportCard.student.username}-T${reportCard.term.order}.pdf"`,
//     },
//   })
// }