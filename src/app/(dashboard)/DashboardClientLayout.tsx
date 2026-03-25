"use client";

import { useState } from "react";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function DashboardClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [open, setOpenAction] = useState(false);

    return (
        <div className="h-screen flex">
            {/* Sidebar */}
            <div
                className={`
                    fixed md:static z-50 top-0 left-0 h-full bg-gray-800 text-white
                    w-64 transform transition-transform duration-300
                    ${open ? "translate-x-0" : "-translate-x-full"} 
                    md:translate-x-0 md:w-[14%] lg:w-[16%] xl:w-[14%]
                    flex flex-col overflow-y-auto
                `}
            >
                <Link
                    href="/"
                    className="flex items-center gap-2 p-4 justify-center lg:justify-start"
                >
                    <span className="hidden lg:block font-bold">Wagadu</span>
                </Link>

                <Menu isMobileOpen={open} />
            </div>

            {/* Overlay (mobile seulement) */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 md:hidden"
                    onClick={() => setOpenAction(false)}
                />
            )}

            {/* Main */}
            <div className="flex-1 bg-blue-50 overflow-scroll flex flex-col">
                <Navbar setOpenAction={setOpenAction} />
                {children}
            </div>
        </div>
    );
}