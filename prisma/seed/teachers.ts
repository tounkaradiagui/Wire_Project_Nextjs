import { PrismaClient } from "@prisma/client";
import { randomName } from "./utils";

export async function seedTeachers(prisma: PrismaClient) {
  for (let i = 1; i <= 15; i++) {
    const sex = i % 2 === 0 ? "FEMALE" : "MALE";
    const { name, surname } = randomName(sex);

    // Créer UserProfile d'abord
    await prisma.userProfile.create({
      data: {
        id: `teacher${i}`,
        clerkId: `teacher${i}`,
        username: `enseignant${i}`,
        firstName: name,
        lastName: surname,
        role: "TEACHER",
        isActive: true,
        isBanned: false,
      },
    });

    // Créer Teacher lié
    await prisma.teacher.create({
      data: {
        id: `teacher${i}`,
        username: `enseignant${i}`,
        name,
        surname,
        sex,
        address: "Bamako",
        bloodType: "O+",
        userProfileId: `teacher${i}`,
      },
    });
  }
}