import { PrismaClient } from "../../src/generated/prisma";
import { randomName } from "./utils";
import prisma from '@/lib/prisma';

export async function seedParents(prisma: PrismaClient) {
    for (let i = 1; i <= 167; i++) {
        const sex = i % 2 === 0 ? "FEMALE" : "MALE";
        const { name, surname } = randomName(sex);

        await prisma.parent.create({
            data: {
                id: `parent${i}`,
                username: `parent${i}`,
                name,
                surname,
                sex,
                phone: `223700${i}`,
                address: "Bamako",
            },
        });
    }
}
