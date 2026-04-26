import { getExams } from "@/lib/actions";

const ExamsPage = async ({
    params,
}: {
    params: { studentId: string };
}) => {
    // Récupérer les examens de l'élève en utilisant une fonction d'action qui vérifie que le parent a le droit de voir ces examens 
    const exams = await getExams(params.studentId);

    return (
        <div className="p-4 flex flex-col gap-6">
            <h1 className="text-xl font-semibold">Compositions</h1>

            <div className="bg-white rounded-md overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-left">Titre</th>
                            <th className="p-3 text-left">Cours</th>
                            <th className="p-3 text-left">Date de debut</th>
                            <th className="p-3 text-left">Date limite</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exams.map((exam) => (
                            <tr key={exam.id} className="border-b">
                                <td className="p-3 font-medium">
                                    {exam.title}
                                </td>
                                <td className="p-3">
                                    {exam.lesson.name}
                                </td>
                                <td className="p-3">
                                    {new Date(exam.startTime).toLocaleDateString()}
                                </td>
                                <td className="p-3">
                                    {new Date(exam.endTime).toLocaleDateString()}
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>

                {exams.length === 0 && (
                    <p className="p-4 text-center text-gray-500">
                        Aucun devoir disponible
                    </p>
                )}
            </div>
        </div>
    );
};

export default ExamsPage;