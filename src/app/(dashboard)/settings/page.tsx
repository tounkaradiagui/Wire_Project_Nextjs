import { PasswordModal } from "@/components/cards/PasswordModal"
import { PreferencesSection } from "@/components/cards/PreferencesSection"
import { currentUser } from "@clerk/nextjs/server"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
    const clerkUser = await currentUser()
    if (!clerkUser) redirect("/")

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">

            {/* ── PAGE HEADER ── */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Gérez la sécurité et les préférences de votre compte
                </p>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* Colonne principale */}
                <div className="col-span-2 space-y-6">

                    {/* Sécurité */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                        <h3 className="text-base font-semibold text-gray-900 border-b
                           border-gray-100 pb-3">
                            Sécurité
                        </h3>

                        {/* Mot de passe */}
                        <div className="flex items-center justify-between py-2">
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-gray-900">
                                    Mot de passe
                                </p>
                                <p className="text-xs text-gray-400">
                                    Utilisez un mot de passe fort et unique
                                </p>
                            </div>
                            <PasswordModal />
                        </div>

                        {/* Email (readonly) */}
                        <div className="flex items-center justify-between py-2 border-t
                            border-gray-100">
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-gray-900">
                                    Adresse email
                                </p>
                                <p className="text-xs text-gray-400">
                                    {clerkUser.emailAddresses[0]?.emailAddress ?? "—"}
                                </p>
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5
                               rounded-lg font-medium">
                                Géré par Clerk
                            </span>
                        </div>

                        {/* 2FA */}
                        <div className="flex items-center justify-between py-2 border-t
                            border-gray-100">
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-gray-900">
                                    Double authentification
                                </p>
                                <p className="text-xs text-gray-400">
                                    Renforcez la sécurité de votre compte
                                </p>
                            </div>
                            <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1.5
                               rounded-lg font-medium">
                                Bientôt disponible
                            </span>
                        </div>
                    </div>

                    {/* Préférences */}
                    <PreferencesSection />
                </div>

                {/* Colonne droite — Info */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Conseils de sécurité
                        </h3>
                        <ul className="space-y-3 text-xs text-gray-500">
                            {[
                                "Utilisez au moins 8 caractères",
                                "Mélangez majuscules, chiffres et symboles",
                                "N'utilisez pas le même mot de passe ailleurs",
                                "Changez votre mot de passe régulièrement",
                            ].map((tip) => (
                                <li key={tip} className="flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Votre compte
                        </h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Vos données sont sécurisées via Clerk. Pour supprimer votre
                            compte, contactez un administrateur.
                        </p>

                        <Link href="/profile"
                            className="block text-center text-xs font-semibold border
                            border-gray-200 text-gray-700 rounded-xl py-2.5
                            hover:bg-gray-50 transition-colors"
                        >
                            ← Retour au profil
                        </Link>
                    </div>
                </div>
            </div>
        </div >
    )
}