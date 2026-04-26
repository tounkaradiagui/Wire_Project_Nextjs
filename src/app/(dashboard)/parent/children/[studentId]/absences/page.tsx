import { getStudentAttendancesForParent } from "@/lib/actions";
import Link from "next/link";

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
    params: Promise<{ studentId: string }>;
}) => {
    const { studentId } = await params;
    const result = await getStudentAttendancesForParent(studentId);

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
                            return (
                                <tr key={attendance.id} className="border-b">
                                    <td className="p-3">
                                        {session
                                            ?
                                            new Intl.DateTimeFormat("fr-FR", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            }).format(new Date(session.date))
                                            : "-"}

                                    </td>

                                    <td className="p-3">
                                        {session?.lesson?.name ?? "-"}
                                        {session?.class?.name && (
                                            <span className="text-xs text-gray-500 ml-1">
                                                ({session.class.name})
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-3">
                                        <AttendanceBadge status={attendance.status} />
                                    </td>
                                    <td className="p-3">
                                        {new Date(session.startTime).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}

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
                    <div className="p-6 text-center text-gray-500">
                        📭 Aucune absence enregistrée pour cet élève
                    </div>
                )}
            </div>
        </div>
    );
};

export default AbsencesPage;