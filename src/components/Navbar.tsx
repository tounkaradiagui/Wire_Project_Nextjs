import Image from "next/image";


const NavbarPage = () => {
    return (
        <div className="flex items-center justify-between p-4">
            {/* Search bar */}
            <div className="hidden md:flex">
                <Image src="/search.png" alt="search" width={14} height={14}/>
                <input type="text" placeholder="Rechercher..."/>
            </div>
            {/* Others icons */}
        </div>
    )
}
export default NavbarPage