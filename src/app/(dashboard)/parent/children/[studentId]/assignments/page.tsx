import { getStudentAssignmentsForParent } from "@/lib/actions";

const AssignmentsPage = async ({
    params,
}: {
    params: { studentId: string };
}) => {
    // Récupérer les devoirs de l'élève en utilisant une fonction d'action qui vérifie que le parent a le droit de voir ces devoirs
    const result = await getStudentAssignmentsForParent(params.studentId);

    if (!result.success) {
        return (
            <p className="p-4 text-center text-red-500">
                {result.error}
            </p>
        );
    }

    const assignments = result.data;

    return (
        <div className="p-4 flex flex-col gap-6">
            <h1 className="text-xl font-semibold">Devoirs</h1>

            <div className="bg-white rounded-md overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-left">Titre</th>
                            <th className="p-3 text-left">Cours</th>
                            <th className="p-3 text-left">Date limite</th>
                            <th className="p-3 text-left">Description</th>
                            <th className="p-3 text-left">Fichier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignments.map((assignment) => (
                            <tr key={assignment.id} className="border-b">
                                <td className="p-3 font-medium">
                                    {assignment.title}
                                </td>
                                <td className="p-3">
                                    {assignment.lesson.name}
                                </td>
                                <td className="p-3">
                                    {new Date(assignment.dueDate).toLocaleDateString()}
                                </td>
                                <td className="p-3 text-gray-600">
                                    {"description" in assignment && (assignment as any).description ? (assignment as any).description : "-"}
                                </td>
                                <td className="p-3">
                                    {'fileUrl' in assignment && (assignment as any).fileUrl ? (
                                        <a
                                            href={(assignment as any).fileUrl}
                                            target="_blank"
                                            className="text-blue-600 underline"
                                        >
                                            Télécharger
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {assignments.length === 0 && (
                    <p className="p-4 text-center text-gray-500">
                        Aucun devoir disponible
                    </p>
                )}
            </div>
        </div>
    );
};

export default AssignmentsPage;