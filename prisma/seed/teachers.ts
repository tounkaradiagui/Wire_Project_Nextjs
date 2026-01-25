import { PrismaClient } from "../../src/generated/prisma";
import { randomName, randomElement } from "./utils";
import prisma from '@/lib/prisma';

export async function seedTeachers(prisma: PrismaClient) {
    for (let i = 1; i <= 15; i++) {
        const sex = i % 2 === 0 ? "FEMALE" : "MALE";
        const { name, surname } = randomName(sex);

        await prisma.teacher.create({
            data: {
                id: `teacher${i}`,
                username: `enseignant${i}`,
                name,
                surname,
                sex,
                address: "Bamako",
                bloodType: "O+",
            },
        });
    }
}
