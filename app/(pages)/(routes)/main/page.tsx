"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const MainPage = () => {
  return (
    <div className="w-full h-full flex justify-center items-center relative overflow-hidden bg-[url('/main_bg.svg')] bg-cover">
      <div className="absolute">
        <h1 className="font-bold text-[2.75rem] md:text-[7xl] lg:text-[4rem] xl:text-[5.75rem] max-w-4xl mx-auto text-center z-10 bg-gradient-to-r from-orange-200 to-yellow-200 bg-clip-text text-transparent">
          쉽고 빠르게!<br/>뉴스레터와 팝업 생성
        </h1>
        <br />
        <h3 className="text-3xl text-center text-white">HTML 생성, 이젠 기다릴 필요 없이 리소스 절감!</h3>
        <br />
        <div className="flex w-full justify-center">
          <Link href="/htmlcode">
            <Button color="primary" className="text-xl !p-8">
              Get Started
            </Button>
          </Link>
        </div>
        <br />
        <h5 className="text-center text-md font-light text-blue-400">by FrontEnd Team - UI Unit</h5>
      </div>
    </div>
  );
};

export default MainPage;
