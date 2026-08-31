import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    MapPin,
    Mail,
    Phone,
    Globe,
    GraduationCap,
    Users,
    BookOpen,
    Building2,
    CalendarDays,
    Award,
    ArrowLeft,
    Layers,
    UserCheck,
    BadgeCheck,
    Clock,
    Send,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; classes: string }> = {
        ACTIVE: { label: "Active", classes: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
        PENDING: { label: "En attente", classes: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
        SUSPENDED: { label: "Suspendue", classes: "bg-red-50 text-red-700 ring-1 ring-red-200" },
        INACTIVE: { label: "Inactive", classes: "bg-slate-100 text-slate-500 ring-1 ring-slate-200" },
    };
    const { label, classes } = map[status] ?? map.INACTIVE;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {label}
        </span>
    );
}

function PlanBadge({ plan }: { plan: string }) {
    const map: Record<string, { label: string; classes: string }> = {
        PREMIUM: { label: "Premium", classes: "bg-violet-50 text-violet-700 ring-1 ring-violet-200" },
        STANDARD: { label: "Standard", classes: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
        FREE: { label: "Gratuit", classes: "bg-slate-100 text-slate-500 ring-1 ring-slate-200" },
    };
    const { label, classes } = map[plan] ?? map.FREE;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>
            <Award className="h-3 w-3" />
            {label}
        </span>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    accent = false,
}: {
    icon: React.ElementType;
    label: string;
    value: number | string;
    accent?: boolean;
}) {
    return (
        <div className={`flex flex-col gap-3 rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${accent
            ? "border-blue-100 bg-linear-to-br from-blue-50 to-indigo-50"
            : "border-slate-100 bg-white"
            }`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                }`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <div className={`text-2xl font-bold tracking-tight ${accent ? "text-blue-700" : "text-slate-800"
                    }`}>
                    {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
                </div>
                <div className="mt-0.5 text-xs font-medium text-slate-500">{label}</div>
            </div>
        </div>
    );
}

function InfoRow({
    icon: Icon,
    label,
    value,
    href,
}: {
    icon: React.ElementType;
    label: string;
    value: string | null | undefined;
    href?: string;
}) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-400">{label}</div>
                {href ? (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 block truncate text-sm font-medium text-blue-600 hover:underline"
                    >
                        {value}
                    </a>
                ) : (
                    <div className="mt-0.5 text-sm font-medium text-slate-700">{value}</div>
                )}
            </div>
        </div>
    );
}

export default async function SchoolDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const school = await prisma.school.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    students: true,
                    teachers: true,
                    parents: true,
                    classes: true,
                    grades: true,
                    teacherApplications: true,
                },
            },
        },
    });

    if (!school) notFound();

    const hasBanner = Boolean(school.bannerUrl);
    const hasLogo = Boolean(school.logoUrl);

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Banner */}
            <div className="relative h-52 w-full overflow-hidden bg-linear-to-br from-[#0F2D56] via-[#1B5FC1] to-[#3EAAF5] sm:h-64 lg:h-72">
                {hasBanner && (
                    <Image
                        src={school.bannerUrl!}
                        alt={`Bannière ${school.name}`}
                        fill
                        className="object-cover opacity-40"
                        priority
                        sizes="100vw"
                    />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

                <div className="absolute left-4 top-4 sm:left-6 lg:left-8">
                    <Link
                        href="/super_admin/schools-list"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Retour aux écoles
                    </Link>
                </div>

                <div className="absolute right-4 top-4 flex gap-2 sm:right-6 lg:right-8">
                    <StatusBadge status={school.status} />
                    <PlanBadge plan={school.plan} />
                </div>

                <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 sm:px-6 lg:px-8">
                    <div className="flex items-end gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg sm:h-20 sm:w-20">
                            {hasLogo ? (
                                <Image
                                    src={school.logoUrl!}
                                    alt={`Logo ${school.name}`}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-600 to-indigo-700 text-2xl font-black text-white">
                                    {school.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="pb-1">
                            <h1 className="text-xl font-extrabold leading-tight text-white drop-shadow sm:text-2xl lg:text-3xl">
                                {school.name}
                            </h1>
                            <div className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                                <MapPin className="h-3.5 w-3.5" />
                                {school.city}, {school.country}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                    {/* Colonne principale */}
                    <div className="space-y-8 lg:col-span-2">

                        <section>
                            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                Chiffres clés
                            </h2>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <StatCard icon={GraduationCap} label="Élèves inscrits" value={school._count.students} accent />
                                <StatCard icon={Users} label="Enseignants" value={school._count.teachers} />
                                <StatCard icon={UserCheck} label="Parents" value={school._count.parents} />
                                <StatCard icon={Building2} label="Classes" value={school._count.classes} />
                                <StatCard icon={Layers} label="Niveaux" value={school._count.grades} />
                                <StatCard icon={BookOpen} label="Candidatures reçues" value={school._count.teacherApplications} />
                            </div>
                        </section>

                        {school.description && (
                            <section>
                                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                                    À propos
                                </h2>
                                <div className="rounded-2xl border border-slate-100 bg-white p-6">
                                    <p className="leading-relaxed text-slate-600">{school.description}</p>
                                </div>
                            </section>
                        )}

                        <section>
                            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                                Coordonnées
                            </h2>
                            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white px-5">
                                <InfoRow icon={MapPin} label="Adresse" value={school.address} />
                                <InfoRow icon={Mail} label="Email" value={school.email} href={`mailto:${school.email}`} />
                                <InfoRow icon={Phone} label="Téléphone" value={school.phone} href={`tel:${school.phone}`} />
                                <InfoRow icon={Globe} label="Site web" value={school.website} href={school.website ?? undefined} />
                                <InfoRow icon={CalendarDays} label="Année de fondation" value={school.foundedYear?.toString()} />
                                <InfoRow icon={Clock} label="Fuseau horaire" value={school.timezone} />
                                {school.isVerified && (
                                    <div className="flex items-center gap-3 py-3.5">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                            <BadgeCheck className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium text-slate-400">Certification</div>
                                            <div className="mt-0.5 text-sm font-semibold text-emerald-700">
                                                École vérifiée par Wagadu
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Colonne latérale */}
                    <div className="space-y-5">

                        <div className="rounded-2xl border border-slate-100 bg-white p-5">
                            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                Abonnement
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600">Plan actuel</span>
                                <PlanBadge plan={school.plan} />
                            </div>
                            {school.subscriptionEndsAt && (
                                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                                    <span className="text-sm font-medium text-slate-600">Expire le</span>
                                    <span className="text-sm font-semibold text-slate-700">
                                        {new Date(school.subscriptionEndsAt).toLocaleDateString("fr-FR", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            )}
                            {school.maxStudents && (
                                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                                    <span className="text-sm font-medium text-slate-600">Capacité</span>
                                    <span className="text-sm font-semibold text-slate-700">
                                        {school._count.students} / {school.maxStudents} élèves
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* CTA vers la page de candidature */}
                        <div className="rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50 to-indigo-50 p-5">
                            <h3 className="mb-1 text-sm font-bold text-[#0F2D56]">
                                Rejoindre l&apos;équipe
                            </h3>
                            <p className="mb-4 text-xs leading-relaxed text-slate-500">
                                Vous souhaitez postuler comme enseignant·e dans cet établissement ?
                            </p>
                            <Link
                                href={`/ecoles/${school.slug}#postuler`}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#1B5FC1] to-[#3EAAF5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                            >
                                <Send className="h-4 w-4" />
                                Envoyer ma candidature
                            </Link>
                        </div>

                        {school.language && (
                            <div className="rounded-2xl border border-slate-100 bg-white p-5">
                                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                                    Paramètres
                                </h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">Langue principale</span>
                                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-600">
                                        {school.language}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}