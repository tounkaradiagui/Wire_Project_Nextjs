"use client"

import { useState } from "react"

export function PreferencesSection() {
    const [prefs, setPrefs] = useState({
        emailNotifications: true,
        language: "fr",
        theme: "light",
    })
    const [saved, setSaved] = useState(false)

    const handleSave = () => {
        // Sauvegarder dans localStorage ou une action serveur
        localStorage.setItem("userPrefs", JSON.stringify(prefs))
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <div>
                <h2 className="text-base font-semibold text-gray-900">Préférences</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    Personnalisez votre expérience
                </p>
            </div>

            <div className="space-y-4 divide-y divide-gray-100">

                {/* Notifications email */}
                <div className="flex items-center justify-between py-3">
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            Notifications par email
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Recevoir les bulletins et annonces par email
                        </p>
                    </div>
                    <button
                        onClick={() =>
                            setPrefs((p) => ({ ...p, emailNotifications: !p.emailNotifications }))
                        }
                        className={`relative w-11 h-6 rounded-full transition-colors ${prefs.emailNotifications ? "bg-gray-900" : "bg-gray-200"
                            }`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                              shadow transition-transform ${prefs.emailNotifications ? "translate-x-5" : ""
                            }`}
                        />
                    </button>
                </div>

                {/* Langue */}
                <div className="flex items-center justify-between py-3">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Langue</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Langue d'affichage de l'interface
                        </p>
                    </div>
                    <select
                        value={prefs.language}
                        onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5
                       focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="bm">Bambara</option>
                    </select>
                </div>

                {/* Thème */}
                <div className="flex items-center justify-between py-3">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Thème</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Apparence de l'interface
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {[
                            { value: "light", label: "☀️ Clair" },
                            { value: "dark", label: "🌙 Sombre" },
                        ].map((t) => (
                            <button
                                key={t.value}
                                onClick={() => setPrefs((p) => ({ ...p, theme: t.value }))}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium
                            transition-colors ${prefs.theme === t.value
                                        ? "bg-gray-900 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bouton sauvegarder */}
            <div className="flex items-center justify-end gap-3 pt-2">
                {saved && (
                    <span className="text-sm text-green-600 font-medium">
                        ✅ Préférences sauvegardées
                    </span>
                )}
                <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900
                     text-white hover:bg-gray-700 transition-colors"
                >
                    Sauvegarder
                </button>
            </div>
        </div>
    )
}