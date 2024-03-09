"use client";

// import { toast } from "sonner";
import { Image as ImageIcon, LogOut, Layers } from "lucide-react";
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { signOut } from "next-auth/react";

// import { ConfirmModal } from "@/components/confirm-modal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
// import { api } from "@/convex/_generated/api";
// import { useApiMutation } from "@/hooks/use-api-mutation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import { useRenameModal } from "@/store/use-rename-modal";

interface MenusProps {
  children: React.ReactNode;
  side?: DropdownMenuContentProps["side"];
  sideOffset?: DropdownMenuContentProps["sideOffset"];
  // id: string;
  // title: string;
};

export const Menus = ({ children, side, sideOffset }: MenusProps) => {
  // const { onOpen } = useRenameModal();
  // const { mutate, pending } = useApiMutation(api.board.remove);

  // const onCopyLink = () => {
  //   navigator.clipboard.writeText(
  //     `${window.location.origin}/board/${id}`,
  //   )
  //     .then(() => toast.success("Link copied"))
  //     .catch(() => toast.error("Failed to copy link"))
  // };

  // const onDelete = () => {
  //   mutate({ id })
  //     .then(() => toast.success("Board deleted"))
  //     .catch(() => toast.error("Failed to delete board"));
  // };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={(e) => e.stopPropagation()}
        side={side}
        sideOffset={sideOffset}
        className="w-60"
      >
        <Link href="/htmlcode">
          <DropdownMenuItem
            className="p-3 cursor-pointer"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            이미지맵 생성
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          onClick={() => {
            alert('준비중');
          }}
          className="p-3 cursor-pointer"
        >
          <Layers className="h-4 w-4 mr-2" />
          이미지맵 제작 리스트
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            signOut({ callbackUrl: "/" });
          }}
          className="p-3 cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};