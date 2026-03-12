import { PrismaClient } from "@prisma/client";

import { seedAdmins } from "./seed/admins";
import { seedGradesAndClasses } from "./seed/grades-classes";
import { seedSubjects } from "./seed/subjects";
import { seedTeachers } from "./seed/teachers";
import { seedParents } from "./seed/parents";
import { seedStudents } from "./seed/students";
import { seedLessons } from "./seed/lessons";
import { seedSessions } from "./seed/sessions";
import { seedExamsAndAssignments } from "./seed/exams-assignments";
import { seedAttendance } from "./seed/attendance";
import { seedResults } from "./seed/results";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Reset base de données...");

    await prisma.attendance.deleteMany();
    await prisma.session.deleteMany();
    await prisma.result.deleteMany();
    await prisma.exam.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.student.deleteMany();
    await prisma.parent.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.class.deleteMany();
    await prisma.grade.deleteMany();

    console.log("🌱 Seed en cours...");

    await seedGradesAndClasses(prisma);
    await seedAdmins(prisma);
    await seedSubjects(prisma);
    await seedTeachers(prisma);
    await seedParents(prisma);
    await seedStudents(prisma);
    await seedLessons(prisma);

    // important pour calendrier + absences
    await seedSessions(prisma);

    await seedExamsAndAssignments(prisma);
    await seedAttendance(prisma);
    await seedResults(prisma);

    console.log("✅ Seed terminé avec succès");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());