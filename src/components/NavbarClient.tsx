"use client";

import { Bell, Mail, Search, Menu } from "lucide-react";
import UserMenu from "@/components/UserMenu";

export default function NavbarClient({
    setOpenAction,
    user,
    roleLabel,
}: {
    setOpenAction: (value: boolean) => void;
    user: any;
    roleLabel: string;
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-white shadow-sm">
            {/* LEFT */}
            <div className="flex items-center gap-4">
                {/* Hamburger */}
                <button
                    className="md:hidden"
                    onClick={() => setOpenAction(true)}
                >
                    <Menu size={24} />
                </button>

                {/* Search */}
                <div className="hidden md:flex items-center gap-2 ring-[1.5px] ring-gray-300 px-2 rounded-full text-xs">
                    <Search size={14} className="text-gray-500" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-50 p-2 bg-transparent outline-none"
                    />
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-6">
                {/* Mail */}
                <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
                    <Mail size={18} className="text-gray-600 hover:scale-110 transition" />
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
                    <Bell size={18} className="text-gray-600 hover:text-blue-600" />
                    <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center rounded-full text-xs bg-blue-600 text-white">
                        1
                    </div>
                </div>

                {/* User Info */}
                <div className="flex flex-col">
                    <span className="text-sm font-medium">
                        {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-xs text-gray-500">
                        {roleLabel}
                    </span>
                </div>

                {/* Avatar */}
                <UserMenu
                    username={user?.username || user?.firstName}
                    roleLabel={roleLabel}
                    imageUrl={user?.imageUrl}
                />
            </div>
        </div>
    );
}