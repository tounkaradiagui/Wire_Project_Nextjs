import { PrismaClient } from "@prisma/client";
import { randomName } from "./utils";

export async function seedParents(prisma: PrismaClient) {
  for (let i = 1; i <= 167; i++) {
    const sex = i % 2 === 0 ? "FEMALE" : "MALE";
    const { name, surname } = randomName(sex);

    // Créer UserProfile
    await prisma.userProfile.create({
      data: {
        id: `parent${i}`,
        clerkId: `parent${i}`,
        username: `parent${i}`,
        firstName: name,
        lastName: surname,
        role: "PARENT",
        isActive: true,
        isBanned: false,
      },
    });

    // Créer Parent lié
    await prisma.parent.create({
      data: {
        id: `parent${i}`,
        username: `parent${i}`,
        name,
        surname,
        sex,
        phone: `223700${i}`,
        address: "Bamako",
        userProfileId: `parent${i}`,
      },
    });
  }
}