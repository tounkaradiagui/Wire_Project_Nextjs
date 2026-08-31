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
import { seedSchoolYears } from "./seed/school-years";
import { seedTerms } from "./seed/terms";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Reset données de l'école par défaut...\n");

    const school = await prisma.school.upsert({
        where: {
            slug: "default-school",
        },
        update: {},
        create: {
            slug: "default-school",
            name: "École de démonstration",
            city: "Bamako",
            country: "Mali",
            email: "demo@wagadu.com",
            status: "ACTIVE",
            isVerified: true,
        },
    });

    console.log("✅ Reset terminé.\n");
    console.log("🌱 Seed en cours...\n");

    // ── Ordre d'insertion (respecter les FK) ───────────────────────────────
    await seedGradesAndClasses(school.id, prisma);   // Grade → Class
    await seedSubjects(school.id, prisma);           // Subject
    await seedAdmins(school.id, prisma);             // UserProfile → Admin
    await seedTeachers(school.id, prisma);           // UserProfile → Teacher
    await seedParents(school.id, prisma);            // UserProfile → Parent
    await seedStudents(school.id, prisma);           // UserProfile → Student (dépend Class + Parent)
    await seedLessons(prisma);            // Lesson (dépend Subject + Class + Teacher)
    await seedSessions(prisma);           // Session (dépend Lesson)
    await seedExamsAndAssignments(prisma);// Exam + Assignment (dépend Lesson)
    await seedAttendance(prisma);         // Attendance (dépend Student + Session)

    const schoolYear = await seedSchoolYears(school.id, prisma); // SchoolYear
    const terms = await seedTerms(prisma, schoolYear.id); // Term

    await seedResults(prisma, terms); // Result (dépend Student + Exam + Term)

    console.log("\n✅ Seed terminé avec succès !");
}

main()
    .catch((e) => {
        console.error("❌ Erreur seed :", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
