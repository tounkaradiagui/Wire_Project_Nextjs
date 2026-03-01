import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Exemple : recréer une session pour Math chapitre 2
    const session = await prisma.session.create({
        data: {
            date: new Date("2026-02-24T08:00:00"),
            startTime: new Date("2026-02-24T08:00:00"),
            endTime: new Date("2026-02-24T09:00:00"),
            room: "Salle 102",
            lessonId: 8,            // doit exister
            teacherId: "user_3A9yE4XSxFYwhfYt9madaC4qYCD"  // remplace par un teacher existant
        }
    });

    const attendances = await prisma.attendance.findMany({
  where: { sessionId: null }
})

for (const att of attendances) {
  // Vérifier si une Attendance existe déjà pour ce studentId et cette session
  const exists = await prisma.attendance.findFirst({
    where: {
      studentId: att.studentId,
      sessionId: 'e156fdfb-a27d-4a8e-8607-ccf9292b4dea'
    }
  })

  if (!exists) {
    await prisma.attendance.update({
      where: { id: att.id },
      data: { sessionId: 'e156fdfb-a27d-4a8e-8607-ccf9292b4dea' }
    })
  } else {
    console.log(`Skipping Attendance ${att.id} for student ${att.studentId}, already linked`)
  }
}
  console.log("Session créée :", session)
}


main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())