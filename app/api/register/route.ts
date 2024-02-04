import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

import prisma from "@/lib/prismadb";

export async function POST(
  req: NextRequest,
) {
  try {
    const body = await req.json();
    const {
      email,
      name,
      password,
    } = body;

    if (!email || !name || !password) {
      return new NextResponse('필수 항목을 전부 입력해주세요.', { status: 400});
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('[REGISTER_ERROR]: ', error);
    return new NextResponse('회원가입 중 오류가 발생했습니다.', { status: 500 });
  }
};