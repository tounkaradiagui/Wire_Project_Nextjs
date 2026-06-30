"use client"

import { useState, useTransition } from "react"
import { changePassword } from "@/lib/actions/change-password"

export function PasswordModal() {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    })

    const handleClose = () => {
        setOpen(false)
        setError(null)
        setSuccess(false)
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (form.newPassword !== form.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.")
            return
        }
        if (form.newPassword.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.")
            return
        }

        startTransition(async () => {
            const result = await changePassword(
                form.currentPassword,
                form.newPassword,
            )

            if (result.success) {
                setSuccess(true)
                setTimeout(handleClose, 2000)
            } else {
                setError(result.message)
            }
        })
    }

    const strength = (pwd: string) => {
        if (!pwd) return null
        if (pwd.length < 8) return { label: "Trop court", color: "bg-red-400", w: "w-1/4" }
        if (pwd.length < 10) return { label: "Faible", color: "bg-orange-400", w: "w-2/4" }
        if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd))
            return { label: "Moyen", color: "bg-yellow-400", w: "w-3/4" }
        return { label: "Fort", color: "bg-green-500", w: "w-full" }
    }

    const pwdStrength = strength(form.newPassword)

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white
                   hover:bg-gray-700 transition-colors"
            >
                Modifier
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={handleClose}
                    />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md
                          mx-4 p-6 space-y-5 z-10">

                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Changer le mot de passe
                                </h3>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Choisissez un mot de passe sécurisé
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        {success && (
                            <div className="bg-green-50 border border-green-200 rounded-lg
                              px-4 py-3 text-sm text-green-700 font-medium">
                                ✅ Mot de passe modifié avec succès !
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg
                              px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {!success && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <PasswordField
                                    label="Mot de passe actuel"
                                    value={form.currentPassword}
                                    show={showPasswords.current}
                                    onChange={(v) => setForm({ ...form, currentPassword: v })}
                                    onToggle={() =>
                                        setShowPasswords((s) => ({ ...s, current: !s.current }))
                                    }
                                />

                                <div className="space-y-1.5">
                                    <PasswordField
                                        label="Nouveau mot de passe"
                                        value={form.newPassword}
                                        show={showPasswords.new}
                                        onChange={(v) => setForm({ ...form, newPassword: v })}
                                        onToggle={() =>
                                            setShowPasswords((s) => ({ ...s, new: !s.new }))
                                        }
                                    />
                                    {pwdStrength && (
                                        <div className="space-y-1">
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all
                                        ${pwdStrength.color} ${pwdStrength.w}`} />
                                            </div>
                                            <p className="text-xs text-gray-400">{pwdStrength.label}</p>
                                        </div>
                                    )}
                                </div>

                                <PasswordField
                                    label="Confirmer le mot de passe"
                                    value={form.confirmPassword}
                                    show={showPasswords.confirm}
                                    onChange={(v) => setForm({ ...form, confirmPassword: v })}
                                    onToggle={() =>
                                        setShowPasswords((s) => ({ ...s, confirm: !s.confirm }))
                                    }
                                    error={
                                        form.confirmPassword &&
                                            form.confirmPassword !== form.newPassword
                                            ? "Les mots de passe ne correspondent pas"
                                            : undefined
                                    }
                                />

                                <ul className="text-xs text-gray-400 space-y-0.5 list-disc list-inside">
                                    <li className={form.newPassword.length >= 8 ? "text-green-600" : ""}>
                                        Au moins 8 caractères
                                    </li>
                                    <li className={/[A-Z]/.test(form.newPassword) ? "text-green-600" : ""}>
                                        Une majuscule
                                    </li>
                                    <li className={/[0-9]/.test(form.newPassword) ? "text-green-600" : ""}>
                                        Un chiffre
                                    </li>
                                </ul>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium
                               border border-gray-200 text-gray-700
                               hover:bg-gray-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={
                                            isPending ||
                                            !form.currentPassword ||
                                            !form.newPassword ||
                                            !form.confirmPassword
                                        }
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium
                               bg-gray-900 text-white hover:bg-gray-700
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isPending ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white/30
                                         border-t-white rounded-full animate-spin" />
                                                Modification...
                                            </>
                                        ) : "Enregistrer"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

function PasswordField({
    label, value, show, onChange, onToggle, error,
}: {
    label: string
    value: string
    show: boolean
    onChange: (v: string) => void
    onToggle: () => void
    error?: string
}) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-gray-900
                      transition-colors ${error ? "border-red-300 focus:ring-red-400" : "border-gray-200"
                        }`}
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                     text-gray-400 hover:text-gray-600 text-sm"
                >
                    {show ? "🙈" : "👁"}
                </button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    )
}