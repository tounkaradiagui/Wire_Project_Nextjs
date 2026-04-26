export default function MaintenancePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center
                    bg-gray-50 text-center px-6">
            <div className="space-y-4 max-w-md">
                <p className="text-5xl">🔧</p>
                <h1 className="text-2xl font-bold text-gray-900">
                    Maintenance en cours
                </h1>
                <p className="text-gray-500 text-sm">
                    Nous effectuons des améliorations. Le service sera rétabli
                    très prochainement.
                </p>
                <p className="text-xs text-gray-400">
                    Wagadu — {new Date().getFullYear()}
                </p>
            </div>
        </div>
    )
}