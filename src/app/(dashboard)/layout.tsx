import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex">
      {/* Left */}
      <div className="w-1/6 bg-gray-800 text-white md:w-[14%] lg:w-[16%] xl:w-[14%] overflow-scroll">
        <Link
          href="/"
          className="flex items-center gap-2 p-2 justify-center lg:justify-start"
        >
          <Image src="/logo.png" alt="Logo" width={50} height={50} />
          <span className="hidden lg:block font-bold">Présencia</span>
        </Link>

        {/* Sidebar Menu */}
        <Menu />
      </div>
      {/* Right */}
      <div className="w-5/6 bg-blue-50 md:w-[92%] lg:w-[84%] xl:w-[86%] overflow-scroll flex flex-col">
        {/* Top Nav */}
        <Navbar />
        {/* Content */}
        {children}
      </div>
    </div>
  );
}
