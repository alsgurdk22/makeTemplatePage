import React from "react";

import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";

const PagesLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="h-full relative">
      <div className="hidden w-full h-16 md:flex md:w-full md:flex-row md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>
      <main className="md:pt-16 h-full">
        {children}
      </main>
    </div>
  );
};

export default PagesLayout;
