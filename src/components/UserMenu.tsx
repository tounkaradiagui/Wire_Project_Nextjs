"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User, ChevronDown } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

type Props = {
    username?: string | null;
    roleLabel: string;
    imageUrl?: string | null;
};

const UserMenu = ({ username, roleLabel, imageUrl }: Props) => {
    const [open, setOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { signOut } = useClerk();

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSignOut = async () => {
        setSigningOut(true);
        await signOut();
        // Rechargement complet du navigateur, pas une navigation SPA
        window.location.href = "/sign-in";
    };

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md transition"
            >
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt="Avatar"
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {username?.[0]?.toUpperCase()}
                    </div>
                )}
                <ChevronDown size={16} className="text-gray-500" />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-52 bg-white border rounded-md shadow-lg z-50">
                    <div className="px-4 py-3 border-b">
                        <p className="text-sm font-medium">@{username}</p>
                        <p className="text-xs text-gray-500">{roleLabel}</p>
                    </div>

                    <Link href="/profile">
                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
                            <User size={16} />
                            Mon profil
                        </button>
                    </Link>

                    <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                        <LogOut size={16} />
                        {signingOut ? "Déconnexion..." : "Déconnexion"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;