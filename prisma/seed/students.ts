import { PrismaClient } from "../../src/generated/prisma";
import { randomName } from "./utils";
import prisma from '@/lib/prisma';

export async function seedStudents(prisma: PrismaClient) {
    const classes = await prisma.class.findMany();
    const parents = await prisma.parent.findMany();

    for (let i = 1; i <= 443; i++) {
        const sex = i % 2 === 0 ? "FEMALE" : "MALE";
        const { name, surname } = randomName(sex);
        const classItem = classes[i % classes.length];
        const parent = parents[i % parents.length];

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
            },
        });
    }
}
