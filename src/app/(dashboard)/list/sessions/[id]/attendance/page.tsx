import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

const AttendancePage = async ({
    params,
}: {
    params: Promise<{ id: string }>;
}) => {
    const { id } = await params;

    const session = await prisma.session.findUnique({
        where: { id },
        include: {
            lesson: {
                include: {
                    subject: true,
                    teacher: true,
                    class: {
                        include: {
                            students: true,
                        },
                    },
                },
            },
            attendances: true,
        },
    });

    if (!session) {
        notFound();
    }

    const students = session.lesson.class.students;

    const startDate = new Date(session.startTime);
    const endDate = new Date(session.endTime);

    const day = startDate
        .toLocaleDateString("fr-FR", { weekday: "long" })
        .replace(/^./, (c) => c.toUpperCase());

    const startTime = startDate.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const endTime = endDate.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="bg-white p-6 rounded-md flex-1 m-4 mt-0">
            {/* HEADER */}
            <div className="bg-white shadow-sm border rounded-lg p-5 mb-6">
                <h2 className="text-xl font-semibold mb-3">
                    {session.lesson.subject.name}
                </h2>

                <div className="flex flex-wrap gap-3 text-sm">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded">
                        🏫 {session.lesson.class.name}
                    </span>

                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded">
                        👨‍🏫 {session.lesson.teacher.name} -{" "}
                        {session.lesson.teacher.surname}
                    </span>
                </div>

                <p className="text-sm text-gray-600 mt-6">
                    📅 {day} • {startDate.toLocaleDateString("fr-FR")} • ⏰ {startTime} -{" "}
                    {endTime}
                </p>
            </div>

            {/* FORM */}
        </div>
    );
};

export default AttendancePage;