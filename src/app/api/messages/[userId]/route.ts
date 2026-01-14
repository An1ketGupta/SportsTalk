import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/messages/[userId] - Get messages with a specific user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id as string;
    const { userId: otherUserId } = await params;

    // Get other user info
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!otherUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all messages between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Mark notifications as read
    await prisma.notification.updateMany({
      where: {
        userId: currentUserId,
        actorId: otherUserId,
        type: "message",
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({
      user: {
        ...otherUser,
        username: otherUser.email?.split("@")[0] ?? "user",
      },
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt,
        isMine: m.senderId === currentUserId,
        sender: m.sender,
      })),
    });
  } catch (error) {
    console.error("Messages API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/messages/[userId] - Send a message to a specific user
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id as string;
    const { userId: receiverId } = await params;
    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: currentUserId,
        receiverId: receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Create notification
    if (receiverId !== currentUserId) {
      await prisma.notification.create({
        data: {
          type: "message",
          userId: receiverId,
          actorId: currentUserId,
          read: false,
        },
      });
    }

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        isMine: true,
        sender: message.sender,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
