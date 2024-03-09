"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Montserrat } from "next/font/google";
import { Poppins } from "next/font/google";
import { LayoutDashboard, FileCode2, MessageSquare, ImageIcon, VideoIcon, Music, Code, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Hint } from "../hint";
import { Menus } from "../menus";

// const montserrat = Montserrat({ weight: "600", subsets: ["latin"] });
const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

const routes = [
  {
    label: "Main",
    icon: LayoutDashboard,
    href: "/main",
    color: "text-sky-500",
  },
  {
    label: "HTML 생성",
    icon: FileCode2,
    href: "/htmlcode",
    color: "text-orange-700",
  },
  {
    label: "CHAT GPT",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-500",
  },
  {
    label: "이미지 생성",
    icon: ImageIcon,
    href: "/draw",
    color: "text-pink-700",
  },
  // {
  //   label: "Video Generation",
  //   icon: VideoIcon,
  //   href: "/video",
  //   color: "text-orange-700",
  // },
  // {
  //   label: "Music Generation",
  //   icon: Music,
  //   href: "/music",
  //   color: "text-emerald-500",
  // },
  // {
  //   label: "Code Generation",
  //   icon: Code,
  //   href: "/code",
  //   color: "text-green-700",
  // },
  {
    label: "관리자",
    icon: Settings,
    href: "/settings",
  },
];

const TabSeparator = () => {
  return (
    <div className="text-neutral-300 px-1.5">
      |
    </div>
  );
};

const Sidebar = () => {
  // const pathName = usePathname();
  return (
    <div className="absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md">
      {/* <Button asChild variant="board" className="px-2">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Board logo"
            height={20}
            width={20}
          />
          <span className={cn("font-semibold text-xl ml-2 text-black", font.className)}>
            Builder
          </span>
        </Link>
      </Button> */}
      <Hint label="메인" side="bottom" sideOffset={10}>
        <Button asChild variant="board" className="px-2">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Board logo"
              height={25}
              width={25}
            />
            <span className={cn(
              "font-semibold text-xl ml-2 text-black",
              font.className,
            )}>
              HTML Builder
            </span>
          </Link>
        </Button>
      </Hint>
      <TabSeparator />
      <Menus
        side="bottom"
        sideOffset={10}
      >
        <div>
          <Hint label="메뉴" side="bottom" sideOffset={10}>
            <Button size="icon" variant="board">
              <Menu />
            </Button>
          </Hint>
        </div>
      </Menus>
      {/* <TabSeparator />
      <Hint label="Edit title" side="bottom" sideOffset={10}>
        <Button
          variant="board"
          className="text-base font-normal px-2"
          onClick={() => onOpen(data._id, data.title)}
        >
          {data.title}
        </Button>
      </Hint>
      <TabSeparator />
      <Actions
        id={data._id}
        title={data.title}
        side="bottom"
        sideOffset={10}
      >
        <div>
          <Hint label="Main menu" side="bottom" sideOffset={10}>
            <Button size="icon" variant="board">
              <Menu />
            </Button>
          </Hint>
        </div>
      </Actions> */}
    </div>
  );
    // <div className="space-y-4 py-4 flex flex-row w-full bg-[#111827] text-white">
    //   <div className="px-3 py-2 flex-1">
    //     <Link href="/home" className="flex items-center pl-3 mb-14">
    //       <div className="relative w-8 h-8 mr-4">
    //         <Image fill alt="Logo" src="/logo.png" />
    //       </div>
    //       <h1>
    //         JARVIS
    //       </h1>
    //     </Link>
    //     <div className="space-y-1">
    //       {routes.map((route) => (
    //         <Link
    //           href={route.href}
    //           key={route.href}
    //           className={cn("text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
    //           pathName === route.href ? "text-white bg-white/10" : "text-zinc-400"
    //           )}
    //         >
    //           <div className="flex items-center flex-1">
    //             <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
    //             {route.label}
    //           </div>
    //         </Link>
    //       ))}
    //     </div>
    //   </div>
    // </div>
};

export default Sidebar;