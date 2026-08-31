import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Building2,
    MapPin,
    Mail,
    Phone,
    Users,
    UserCircle,
    Clock,
    CheckCircle2,
    XCircle,
    CalendarDays,
    ShieldAlert,
    Info,
    MessageSquare,
    CircleDot,
} from "lucide-react";
import FormContainer from "@/components/FormContainer";

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_MAP = {
    PENDING: { label: "En attente", dot: "bg-amber-400", pill: "bg-amber-50 text-amber-700 ring-amber-200", icon: Clock },
    VALIDATED: { label: "Approuvée", dot: "bg-emerald-400", pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: CheckCircle2 },
    REJECTED: { label: "Refusée", dot: "bg-red-400", pill: "bg-red-50 text-red-700 ring-red-200", icon: XCircle },
};

function StatusPill({ status }: { status: string }) {
    const cfg = STATUS_MAP[status as keyof typeof STATUS_MAP] ?? STATUS_MAP.PENDING;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${cfg.pill}`}>
            <Icon className="h-3.5 w-3.5" />
            {cfg.label}
        </span>
    );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, children }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-700">{title}</h2>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function Field({ label, value, icon: Icon, href }: {
    label: string;
    value: string | number | null | undefined;
    icon?: React.ElementType;
    href?: string;
}) {
    if (!value && value !== 0) return null;
    const displayValue = String(value);
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-400">{label}</span>
            {Icon && (
                <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {href ? (
                        <a href={href} className="text-sm font-semibold text-blue-600 hover:underline">
                            {displayValue}
                        </a>
                    ) : (
                        <span className="text-sm font-semibold text-slate-800">{displayValue}</span>
                    )}
                </div>
            )}
            {!Icon && (
                href ? (
                    <a href={href} className="text-sm font-semibold text-blue-600 hover:underline">
                        {displayValue}
                    </a>
                ) : (
                    <span className="text-sm font-semibold text-slate-800">{displayValue}</span>
                )
            )}
        </div>
    );
}

// ─── Timeline step ────────────────────────────────────────────────────────────

function TimelineStep({ done, label, date }: { done: boolean; label: string; date?: string | null }) {
    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${done
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 bg-white text-slate-300"
                    }`}>
                    {done
                        ? <CheckCircle2 className="h-4 w-4" />
                        : <CircleDot className="h-4 w-4" />
                    }
                </div>
                <div className="mt-1 w-0.5 flex-1 bg-slate-100" />
            </div>
            <div className="pb-5 pt-0.5">
                <p className={`text-sm font-semibold ${done ? "text-slate-800" : "text-slate-400"}`}>{label}</p>
                {date && <p className="mt-0.5 text-xs text-slate-400">{new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SchoolRequestDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const request = await prisma.schoolRegistrationRequest.findUnique({
        where: { id },
        include: {
            schoolProvision: true,
            createdSchool: true,
        },
    });

    if (!request) notFound();

    const isPending = request.status === "PENDING";
    const isValidated = request.status === "VALIDATED";
    const isRejected = request.status === "REJECTED";
    const isProcessed = isValidated || isRejected;


    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

                {/* ── Header ──────────────────────────────────────────── */}
                <div className="mb-8">
                    <Link
                        href="/super_admin/schools-request"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour aux demandes
                    </Link>

                    <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                                {request.schoolName}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Demande de création d'espace Wagadu
                            </p>
                        </div>
                        <StatusPill status={request.status} />
                    </div>

                    {/* Meta bar */}
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Reçue le{" "}
                            {new Date(request.createdAt).toLocaleDateString("fr-FR", {
                                day: "numeric", month: "long", year: "numeric",
                            })}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {request.city}, {request.country}
                        </span>
                        {request.studentsCount && (
                            <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {request.studentsCount} élèves estimés
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Grid layout ─────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* ── Colonne principale (2/3) ──────────────────── */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Infos établissement */}
                        <SectionCard title="Informations de l'établissement" icon={Building2}>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                <Field label="Nom de l'école" value={request.schoolName} />
                                <Field label="Ville" value={request.city} />
                                <Field label="Pays" value={request.country} />
                                <Field
                                    label="Nombre d'élèves estimé"
                                    value={request.studentsCount
                                        ? `${request.studentsCount.toLocaleString("fr-FR")} élèves`
                                        : null
                                    }
                                    icon={Users}
                                />
                            </div>
                        </SectionCard>

                        {/* Responsable */}
                        <SectionCard title="Responsable de l'établissement" icon={UserCircle}>
                            <div className="flex items-center gap-4 pb-5">
                                {/* Avatar initiales */}
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-lg font-black text-white shadow-sm">
                                    {request.contactName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-base font-bold text-slate-800">{request.contactName}</p>
                                    <p className="mt-0.5 text-xs text-slate-400">Contact principal</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
                                <Field
                                    label="Email"
                                    value={request.email}
                                    icon={Mail}
                                    href={`mailto:${request.email}`}
                                />
                                {request.phone && (
                                    <Field
                                        label="Téléphone"
                                        value={request.phone}
                                        icon={Phone}
                                        href={`tel:${request.phone}`}
                                    />
                                )}
                                <Field
                                    label="Localisation"
                                    value={`${request.city}, ${request.country}`}
                                    icon={MapPin}
                                />
                            </div>
                        </SectionCard>

                        {/* Message */}
                        {request.message && (
                            <SectionCard title="Message du demandeur" icon={MessageSquare}>
                                <p className="text-sm leading-relaxed text-slate-600 italic">
                                    &ldquo;{request.message}&rdquo;
                                </p>
                            </SectionCard>
                        )}

                        {/* Note de révision */}
                        {request.reviewNote && (
                            <SectionCard title="Note de l'administrateur" icon={Info}>
                                <p className="text-sm leading-relaxed text-slate-600">{request.reviewNote}</p>
                                {request.reviewedAt && (
                                    <p className="mt-2 text-xs text-slate-400">
                                        Traité le{" "}
                                        {new Date(request.reviewedAt).toLocaleDateString("fr-FR", {
                                            day: "numeric", month: "long", year: "numeric",
                                        })}
                                    </p>
                                )}
                            </SectionCard>
                        )}
                    </div>

                    {/* ── Colonne latérale (1/3) ───────────────────────── */}
                    <div className="space-y-5">

                        {/* Contact rapide */}
                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                Contact rapide
                            </h3>
                            <div className="space-y-3">
                                <a
                                    href={`mailto:${request.email}`}
                                    className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                >
                                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span className="truncate">{request.email}</span>
                                </a>
                                {request.phone && (
                                    <a
                                        href={`tel:${request.phone}`}
                                        className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                                        <span>{request.phone}</span>
                                    </a>
                                )}
                                <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span>{request.city}, {request.country}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}

                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

                            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                Actions
                            </h3>

                            {request.schoolProvision && (

                                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                                    <p className="text-sm font-semibold text-emerald-700">
                                        Cette demande a déjà été provisionnée.
                                    </p>

                                    <p className="mt-1 text-xs text-emerald-600">

                                        École créée avec succès.

                                    </p>

                                    {request.createdSchoolId && (

                                        <Link
                                            href={`/super_admin/schools-list/${request.createdSchoolId}`}
                                            className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:underline"
                                        >
                                            Voir l'école créée →
                                        </Link>

                                    )}

                                </div>

                            )}

                            {isPending ? (

                                <div className="space-y-3">

                                    {/* Création de l'espace */}
                                    <FormContainer
                                        table="schoolProvision"
                                        type="create"
                                        data={request}
                                    />

                                    {/* Refus */}
                                    <FormContainer
                                        table="schoolRequest"
                                        type="delete"
                                        id={request.id}
                                    />

                                </div>

                            ) : (

                                <div
                                    className={`flex items-center gap-2 rounded-xl p-4 mt-4 ${isValidated
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-red-50 text-red-700"
                                        }`}
                                >
                                    {isValidated ? (
                                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                                    ) : (
                                        <XCircle className="h-5 w-5 shrink-0" />
                                    )}

                                    <div>

                                        <p className="text-sm font-bold">

                                            {isValidated
                                                ? "Espace école créé"
                                                : "Demande refusée"}

                                        </p>

                                        {request.reviewedAt && (

                                            <p className="text-xs opacity-75">

                                                Le{" "}

                                                {new Date(
                                                    request.reviewedAt
                                                ).toLocaleDateString("fr-FR")}

                                            </p>

                                        )}

                                    </div>

                                </div>

                            )}

                        </div>

                        {/* Avertissement si pending */}
                        {isPending && (
                            <div className="flex gap-2.5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                <p className="text-xs leading-relaxed text-amber-700">
                                    En cliquant sur « Créer l'espace école », un formulaire de provisionnement
                                    s'ouvrira afin de créer :

                                    • le compte Clerk de l'administrateur

                                    • l'établissement

                                    • l'abonnement

                                    • le profil administrateur

                                    • puis envoyer automatiquement les identifiants par email.
                                </p>
                            </div>
                        )}

                        {/* Progression */}
                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">
                                Progression
                            </h3>
                            <div>
                                <TimelineStep
                                    done={true}
                                    label="Demande soumise"
                                    date={request.createdAt.toString()}
                                />
                                <TimelineStep
                                    done={isProcessed}
                                    label="Examinée par l'équipe"
                                    date={request.reviewedAt?.toString()}
                                />
                                <TimelineStep
                                    done={isValidated}
                                    label="Provisionnement terminé"
                                    date={isValidated ? request.reviewedAt?.toString() : null}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}