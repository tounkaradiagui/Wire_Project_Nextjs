const ParentStudentResultsPage = async ({
    params,
}: {
    params: { studentId: string };
}) => {
    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold">
                Résultats de l’élève
            </h1>

            <p>ID élève : {params.studentId}</p>
        </div>
    );
};

export default ParentStudentResultsPage;
