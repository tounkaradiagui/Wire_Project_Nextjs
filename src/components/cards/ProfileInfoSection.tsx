"use client"

import Image from "next/image"

type Props = {
    profile: {
        firstName: string
        lastName: string
        username: string
        image: string | null
        role: string
        email: string
        isActive: boolean
        createdAt: string
        className: string | null
        gradeName: string | null
    }
}

export function ProfileInfoSection({ profile }: Props) {
    const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    const joinedDate = new Date(profile.createdAt).toLocaleDateString("fr-FR", {
        year: "numeric", month: "long", day: "numeric",
    })

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
            <div>
                <h2 className="text-base font-semibold text-gray-900">
                    Informations personnelles
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                    Vos informations de compte
                </p>
            </div>

            {/* Avatar + nom */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    {profile.image ? (
                        <Image
                            src={profile.image}
                            alt="Photo de profil"
                            width={72}
                            height={72}
                            className="rounded-full object-cover border-2 border-gray-200"
                        />
                    ) : (
                        <div className="w-18 h-18 rounded-full bg-gray-900
                            flex items-center justify-center text-white
                            text-xl font-bold border-2 border-gray-200">
                            {initials}
                        </div>
                    )}
                    {/* Indicateur actif */}
                    <span className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full
                            border-2 border-white ${profile.isActive ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                </div>

                <div>
                    <p className="text-lg font-bold text-gray-900">
                        {profile.firstName} {profile.lastName}
                    </p>
                    <p className="text-sm text-gray-500">@{profile.username}</p>
                    <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600
                           px-2 py-0.5 rounded-full font-medium">
                        {profile.role}
                    </span>
                </div>
            </div>

            {/* Grille infos */}
            <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                    { label: "Email", value: profile.email },
                    { label: "Nom d'utilisateur", value: `@${profile.username}` },
                    { label: "Membre depuis", value: joinedDate },
                    { label: "Statut", value: profile.isActive ? "Actif" : "Inactif" },
                    ...(profile.className ? [
                        { label: "Classe", value: profile.className },
                        { label: "Niveau", value: profile.gradeName ?? "—" },
                    ] : []),
                ].map(({ label, value }) => (
                    <div key={label} className="space-y-0.5">
                        <p className="text-gray-400 text-xs">{label}</p>
                        <p className="font-medium text-gray-800">{value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}