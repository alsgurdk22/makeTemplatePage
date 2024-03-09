import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthContext from "@/app/context/auth-context"
import ToasterContext from "@/app/context/toaster-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HTML Builder",
  description: "쉽고 빠르게 뉴스레터와 팝업을 제작하세요!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthContext>
          <ToasterContext />
            {children}
        </AuthContext>
      </body>
    </html>
  );
}
