import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

// POST /api/notifications/read-all - Mark all notifications as read
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;

    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
        type: { not: "message" },
      },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark all read error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
