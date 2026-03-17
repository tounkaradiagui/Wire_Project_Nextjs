import { getStudentAttendancesForParent } from "@/lib/actions";

const AttendanceBadge = ({ status }: { status: string }) => {
    const styles = {
        PRESENT: "bg-green-100 text-green-700",
        ABSENT: "bg-red-100 text-red-700",
        LATE: "bg-yellow-100 text-yellow-700",
    };

    return (
        <span
            className={`px-2 py-1 text-xs rounded ${styles[status as keyof typeof styles]
                }`}
        >
            {status}
        </span>
    );
};

const AbsencesPage = async ({
    params,
}: {
    params: { studentId: string };
}) => {
    const result = await getStudentAttendancesForParent(params.studentId);

    if (!result.success) {
        return (
            <p className="p-4 text-center text-red-500">{result.error}</p>
        );
    }

    const attendances = result.data;

    return (
        <div className="p-4 flex flex-col gap-6">
            <h1 className="text-xl font-semibold">Absences</h1>

            <div className="bg-white rounded-md overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-left">Cours</th>
                            <th className="p-3 text-left">Statut</th>
                            <th className="p-3 text-left">Séance</th>
                            <th className="p-3 text-left">Commentaire</th>
                            <th className="p-3 text-left">Justificatif</th>
                        </tr>
                    </thead>

                    <tbody>
                        {attendances.map((attendance: any) => {
                            const session = attendance.session;
                            // const student = attendance.student;
                            return (
                                <tr key={attendance.id} className="border-b">
                                    {/* <h1>
                                        Absences de {student.name} {student.surname}
                                    </h1> */}
                                    <td className="p-3">
                                        {session
                                            ? new Date(session.date).toLocaleDateString()
                                            : "-"}
                                    </td>

                                    <td className="p-3">
                                        {session?.lesson?.name ?? "-"}{" "}
                                        {session?.class?.name
                                            ? `(${session.class.name})`
                                            : ""}
                                    </td>

                                    <td className="p-3">
                                        <AttendanceBadge status={attendance.status} />
                                    </td>
                                    <td className="p-3">
                                        {new Date(session.startTime).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                        {/* -
                                        {new Date(session.endTime).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })} */}
                                    </td>

                                    <td className="p-3 text-gray-600">
                                        {attendance.comment || "-"}
                                    </td>

                                    <td className="p-3">
                                        {attendance.proofUrl ? (
                                            <a
                                                href={attendance.proofUrl}
                                                target="_blank"
                                                className="text-blue-600 underline"
                                            >
                                                Voir
                                            </a>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {attendances.length === 0 && (
                    <p className="p-4 text-center text-gray-500">
                        Aucune absence enregistrée
                    </p>
                )}
            </div>
        </div>
    );
};

export default AbsencesPage;