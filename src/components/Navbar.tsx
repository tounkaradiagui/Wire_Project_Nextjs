import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

const NavbarPage = () => {
  return (
    <div className="flex items-center justify-between p-4">
      {/* Search bar */}
      <div className="hidden md:flex items-center gap-2 ring-[1.5px] ring-gray-300 px-2 rounded-full text-xs">
        <Image src="/search.png" alt="search" width={14} height={14} />
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div>
      {/* Others icons */}
      <div className="flex items-center gap-6 w-full justify-end">
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
          <Image src="/message.png" alt="message" width={20} height={20} />
        </div>

        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image src="/announcement.png" alt="message" width={20} height={20} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center rounded-full text-xs bg-blue-600 text-white">
            1
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-medium">Diagui Tounkara</span>
          <span className="text-xs text-gray-500">Admin</span>
        </div>
        <UserButton />
        {/* <Image
          src="/avatar.png"
          alt="profile"
          width={40}
          height={40}
          className="rounded-full cursor-pointer"
        /> */}
      </div>
    </div>
  );
};
export default NavbarPage;
