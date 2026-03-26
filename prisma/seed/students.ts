import { PrismaClient } from "@prisma/client";
import { randomName } from "./utils";
import { randomUUID } from "crypto";

export async function seedStudents(prisma: PrismaClient) {
  const classes = await prisma.class.findMany();
  const parents = await prisma.parent.findMany();

  for (let i = 1; i <= 443; i++) {
    const sex = i % 2 === 0 ? "FEMALE" : "MALE";
    const { name, surname } = randomName(sex);

    const classItem = classes[i % classes.length];
    const parent = parents[i % parents.length];

    const studentId = `student${i}`;

    // 🔐 Génération d’un token sécurisé
    const verificationToken = randomUUID();

    // 🪪 Génération d’un numéro de carte unique (7 chiffres)
    const cardNumber = String(1000000 + i); // ex: 1000001, 1000002...

    // 📅 Expiration (fin année scolaire + 7 jours)
    const now = new Date();
    const currentYear = now.getFullYear();
    const schoolYearEnd = new Date(currentYear, 7, 31); // 31 Août
    schoolYearEnd.setDate(schoolYearEnd.getDate() + 7);

    // Créer UserProfile
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
      },
    });

    // Créer Student lié
    await prisma.student.create({
      data: {
        id: studentId,
        username: `eleve${i}`,
        name,
        surname,
        sex,

        email: `eleve${i}@school.com`,
        phone: `700000${i.toString().padStart(3, "0")}`,

        verificationToken,
        cardNumber,
        cardExpiresAt: schoolYearEnd,

        address: "Bamako",
        bloodType: "A+",
        birthday: new Date(2010, 0, (i % 28) + 1),

        parentId: parent.id,
        classId: classItem.id,
        gradeId: classItem.gradeId,

        userProfileId: studentId,
      },
    });
  }
}