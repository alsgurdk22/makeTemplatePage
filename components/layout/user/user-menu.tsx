"use client";

import { useCallback, useState } from "react";
import { signOut } from "next-auth/react";

import Avatar from "@/components/layout/user/avatar";
import MenuItem from "@/components/layout/user/menu-item";

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div className="relative">
      <div className="flex flex-row items-center gap-3">
        <div
          onClick={toggleOpen}
          className="p4 md:py-1 md:px-2 flex flex-row items-center gap-3 cursor-pointer"
        >
          <Avatar />
        </div>
      </div>
      {isOpen && (
        <div
          onClick={() => {
            setIsOpen(false);
          }}
          className="absolute rounded-xl shadow-md w-[12vw] bg-white overflow-hidden right-0 top-12 text-sm"
        >
          <div className="flex flex-col cursor-pointer text-center">
            <MenuItem
              label="로그아웃"
              onClick={() => {
                signOut({ callbackUrl: "/" });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
