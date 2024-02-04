"use client";

import MobileSidebar from "@/components/layout/mobile/sidebar";
import UserMenu from "@/components/layout/user/user-menu";

const Navbar = () => {
  return ( 
    <div className="flex items-center p-4">
      <MobileSidebar />
      <div className="flex w-full justify-end">
        <UserMenu />
      </div>
    </div>
  );
}

export default Navbar;
