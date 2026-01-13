import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/notifications - Get all notifications for current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { read: false } : {}),
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        read: n.read,
        createdAt: n.createdAt,
        postId: n.postId,
        actor: {
          id: n.actor.id,
          name: n.actor.name,
          username: n.actor.email?.split("@")[0] ?? "user",
          image: n.actor.image,
          isVerified: n.actor.isVerified,
        },
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a notification (internal use)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, userId, postId } = await req.json();
    const actorId = session.user.id as string;

    // Don't notify yourself
    if (userId === actorId) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        userId,
        actorId,
        postId,
      },
    });

    return NextResponse.json({ notification });
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
