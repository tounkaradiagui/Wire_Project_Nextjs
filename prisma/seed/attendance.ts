import { PrismaClient, AttendanceStatus } from "@prisma/client";

export async function seedAttendance(prisma: PrismaClient) {
    const students = await prisma.student.findMany({ take: 50 });
    const sessions = await prisma.session.findMany();

    const statuses: AttendanceStatus[] = [
        AttendanceStatus.PRESENT,
        AttendanceStatus.ABSENT,
        AttendanceStatus.LATE,
    ];

    for (const session of sessions) {
        for (const student of students) {
            await prisma.attendance.create({
                data: {
                    studentId: student.id,
                    sessionId: session.id,
                    status: statuses[Math.floor(Math.random() * statuses.length)],
                    comment: "Généré automatiquement",
                    createdBy: "TEACHER",
                },
            });
        }
    }
}