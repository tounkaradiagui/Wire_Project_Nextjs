import { PrismaClient } from "@prisma/client";
import { randomName } from "./utils";

export async function seedStudents(prisma: PrismaClient) {
  const classes = await prisma.class.findMany();
  const parents = await prisma.parent.findMany();

  for (let i = 1; i <= 443; i++) {
    const sex = i % 2 === 0 ? "FEMALE" : "MALE";
    const { name, surname } = randomName(sex);
    const classItem = classes[i % classes.length];
    const parent = parents[i % parents.length];

    // Créer UserProfile
    await prisma.userProfile.create({
      data: {
        id: `student${i}`,
        clerkId: `student${i}`,
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
        id: `student${i}`,
        username: `eleve${i}`,
        name,
        surname,
        sex,
        address: "Bamako",
        bloodType: "A+",
        parentId: parent.id,
        classId: classItem.id,
        gradeId: classItem.gradeId,
        userProfileId: `student${i}`,
      },
    });
  }
}