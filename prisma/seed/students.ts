import { PrismaClient } from "@prisma/client";
import { randomName } from "./utils";
import { randomUUID } from "crypto";

export async function seedStudents(schoolId: string, prisma: PrismaClient) {
  const classes = await prisma.class.findMany({
    where: { schoolId: schoolId }, // scoper par école
  });
  const parents = await prisma.parent.findMany({
    where: { schoolId: schoolId },
  });

  if (classes.length === 0) throw new Error("Aucune classe trouvée. Lancez seedGradesAndClasses d'abord.");
  if (parents.length === 0) throw new Error("Aucun parent trouvé. Lancez seedParents d'abord.");

  const now = new Date();
  const schoolYearEnd = new Date(now.getFullYear(), 7, 31);
  schoolYearEnd.setDate(schoolYearEnd.getDate() + 7);

  for (let i = 1; i <= 443; i++) {
    const sex = i % 2 === 0 ? "FEMALE" : "MALE";
    const { name, surname } = randomName(sex);

    const classItem = classes[i % classes.length];
    const parent = parents[i % parents.length];
    const studentId = `student${i}`;

    await prisma.userProfile.create({
      data: {
        id: studentId,
        clerkId: studentId,
        username: `eleve${i}`,
        firstName: name,
        lastName: surname,
        role: "STUDENT",
        isActive: true,
        isBanned: false,
        schoolId: schoolId,
      },
    });

    await prisma.student.create({
      data: {
        id: studentId,
        username: `eleve${i}`,
        name,
        surname,
        sex,
        email: `eleve${i}@school.com`,
        phone: `700000${i.toString().padStart(3, "0")}`,
        verificationToken: randomUUID(),
        cardNumber: String(1000000 + i),
        cardExpiresAt: schoolYearEnd,
        address: "Bamako",
        bloodType: "A+",
        birthday: new Date(2010, 0, (i % 28) + 1),
        parentId: parent.id,
        classId: classItem.id,
        gradeId: classItem.gradeId,
        userProfileId: studentId,
        schoolId: schoolId,
      },
    });
  }

  console.log("Élèves seedés.");
}
