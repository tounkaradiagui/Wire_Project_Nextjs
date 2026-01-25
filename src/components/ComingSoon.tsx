import { Construction, Clock } from "lucide-react";

const ComingSoon = ({
    title,
}: {
    title: string;
}) => {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white rounded-xl shadow-md p-8 max-w-md text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <Construction size={28} />
                    </div>
                </div>

                <h2 className="text-lg font-semibold mb-2">
                    {title}
                </h2>

                <p className="text-sm text-gray-600 leading-relaxed">
                    Cette fonctionnalité est actuellement en{" "}
                    <span className="font-medium text-blue-600">mode test</span>.
                    <br />
                    Elle sera disponible très prochainement.
                </p>

                <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-400">
                    <Clock size={14} />
                    En cours de développement
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;
