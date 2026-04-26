import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Mon Profil",
}

export default async function ProfilePage() {
    const clerkUser = await currentUser()
    if (!clerkUser) redirect("/")

    const profile = await prisma.userProfile.findUnique({
        where: { clerkId: clerkUser.id },
        include: {
            student: { include: { class: { include: { grade: true } }, parent: true } },
            teacher: { include: { subjects: { include: { subject: true } } } },
            parent: { include: { students: true } },
            admin: true,
        },
    })

    if (!profile) notFound()

    const roleLabel: Record<string, string> = {
        SUPER_ADMIN: "Super Administrateur",
        ADMIN: "Administrateur",
        TEACHER: "Enseignant",
        PARENT: "Parent",
        STUDENT: "Élève",
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "—"
    const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    const joinedDate = profile.createdAt.toLocaleDateString("fr-FR", {
        year: "numeric", month: "long", day: "numeric",
    })

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">

            {/* ── PAGE HEADER ── */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Vos informations personnelles et données de compte
                </p>
            </div>

            {/* ── HERO CARD ── */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {/* Banner */}
                <div className="h-28 bg-linear-to-r from-gray-900 via-gray-800 to-gray-700" />

                {/* Avatar + nom */}
                <div className="px-8 pb-6">
                    <div className="flex items-end justify-between -mt-12 mb-6">
                        <div className="relative">
                            {profile.image ? (
                                <Image
                                    src={profile.image}
                                    alt="Photo de profil"
                                    width={96}
                                    height={96}
                                    className="rounded-2xl object-cover border-4 border-white shadow-md"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-2xl bg-gray-900 border-4 border-white
                                shadow-md flex items-center justify-center
                                text-white text-2xl font-bold">
                                    {initials}
                                </div>
                            )}
                            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full
                                border-2 border-white shadow ${profile.isActive ? "bg-green-500" : "bg-gray-300"
                                }`}
                            />
                        </div>

                        <span className="text-xs font-semibold bg-gray-900 text-white
                             px-3 py-1.5 rounded-full mb-2">
                            {roleLabel[profile.role] ?? profile.role}
                        </span>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {profile.firstName} {profile.lastName}
                        </h2>
                        <p className="text-sm text-gray-400">@{profile.username}</p>
                    </div>
                </div>
            </div>

            {/* ── GRILLE PRINCIPALE ── */}
            <div className="grid grid-cols-3 gap-6">

                {/* Colonne gauche — Infos de base */}
                <div className="col-span-2 space-y-6">

                    {/* Informations personnelles */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                        <h3 className="text-base font-semibold text-gray-900 border-b
                           border-gray-100 pb-3">
                            Informations personnelles
                        </h3>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { label: "Prénom", value: profile.firstName },
                                { label: "Nom", value: profile.lastName },
                                { label: "Nom d'utilisateur", value: `@${profile.username}` },
                                { label: "Email", value: email },
                                { label: "Membre depuis", value: joinedDate },
                                { label: "Statut", value: profile.isActive ? "✅ Actif" : "⛔ Inactif" },
                            ].map(({ label, value }) => (
                                <div key={label} className="space-y-1">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                        {label}
                                    </p>
                                    <p className="text-sm font-medium text-gray-800">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Infos contextuelles selon rôle */}
                    {profile.role === "STUDENT" && profile.student && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                            <h3 className="text-base font-semibold text-gray-900 border-b
                             border-gray-100 pb-3">
                                Informations scolaires
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { label: "Classe", value: profile.student.class?.name ?? "—" },
                                    { label: "Niveau", value: profile.student.class?.grade?.name ?? "—" },
                                    { label: "N° Carte", value: profile.student.cardNumber },
                                    { label: "Groupe sanguin", value: profile.student.bloodType },
                                    { label: "Adresse", value: profile.student.address },
                                    {
                                        label: "Parent", value: profile.student.parent
                                            ? `${profile.student.parent.name} ${profile.student.parent.surname}`
                                            : "—"
                                    },
                                ].map(({ label, value }) => (
                                    <div key={label} className="space-y-1">
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                            {label}
                                        </p>
                                        <p className="text-sm font-medium text-gray-800">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {profile.role === "TEACHER" && profile.teacher && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                            <h3 className="text-base font-semibold text-gray-900 border-b
                             border-gray-100 pb-3">
                                Informations professionnelles
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { label: "Téléphone", value: profile.teacher.phone ?? "—" },
                                    { label: "Adresse", value: profile.teacher.address },
                                    { label: "Groupe sanguin", value: profile.teacher.bloodType },
                                ].map(({ label, value }) => (
                                    <div key={label} className="space-y-1">
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                            {label}
                                        </p>
                                        <p className="text-sm font-medium text-gray-800">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Matières enseignées */}
                            {profile.teacher.subjects.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-gray-100">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                        Matières enseignées
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.teacher.subjects.map((ts) => (
                                            <span
                                                key={ts.subjectId}
                                                className="text-xs bg-gray-100 text-gray-700 px-3 py-1
                                   rounded-full font-medium"
                                            >
                                                {ts.subject.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {profile.role === "PARENT" && profile.parent && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
                            <h3 className="text-base font-semibold text-gray-900 border-b
                             border-gray-100 pb-3">
                                Mes enfants
                            </h3>
                            <div className="space-y-2">
                                {profile.parent.students.map((s) => (
                                    <div key={s.id}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center
                                    justify-center text-white text-xs font-bold">
                                            {s.name[0]}{s.surname[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {s.surname} {s.name}
                                            </p>
                                            <p className="text-xs text-gray-400">{s.username}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Colonne droite — Résumé */}
                <div className="space-y-6">

                    {/* Carte compte */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                        <h3 className="text-base font-semibold text-gray-900 border-b
                           border-gray-100 pb-3">
                            Compte
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Statut</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${profile.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-600"
                                    }`}>
                                    {profile.isActive ? "Actif" : "Inactif"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Rôle</span>
                                <span className="text-xs font-semibold bg-gray-100 text-gray-700
                                 px-2 py-0.5 rounded-full">
                                    {roleLabel[profile.role]}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Banni</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${profile.isBanned
                                    ? "bg-red-100 text-red-600"
                                    : "bg-gray-100 text-gray-500"
                                    }`}>
                                    {profile.isBanned ? "Oui" : "Non"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Lien vers paramètres */}
                    <div className="bg-gray-900 rounded-2xl p-6 text-white space-y-3">
                        <p className="font-semibold text-sm">Sécurité & Préférences</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Changez votre mot de passe et personnalisez votre expérience
                        </p>

                        <Link href="/settings"
                            className="block w-full text-center text-xs font-semibold
                            bg-white text-gray-900 rounded-xl py-2.5
                            hover:bg-gray-100 transition-colors"
                        >
                            Aller aux Paramètres →
                        </Link>
                    </div>
                </div>
            </div>
        </div >
    )
}