import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/messages/conversations - Get all conversations for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;

    // Get all unique users the current user has exchanged messages with
    const sentMessages = await prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ["receiverId"],
    });

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ["senderId"],
    });

    // Combine unique user IDs and filter out self
    const userIds = [
      ...new Set([
        ...sentMessages.map((m) => m.receiverId),
        ...receivedMessages.map((m) => m.senderId),
      ]),
    ].filter((id) => id !== userId);

    // Get conversation details for each user
    const conversations = await Promise.all(
      userIds.map(async (otherUserId) => {
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        });

        // Get last message
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: userId },
            ],
          },
          orderBy: { createdAt: "desc" },
        });

        // Simple unread logic: mark as unread if last message was from the other user
        // (This will reset when page refreshes, but doesn't require schema changes)

        return {
          user: {
            ...otherUser,
            username: otherUser?.email?.split("@")[0] ?? "user",
          },
          lastMessage: lastMessage
            ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              isMine: lastMessage.senderId === userId,
            }
            : null,
          unreadCount: lastMessage && lastMessage.senderId === otherUserId ? 1 : 0,
        };
      })
    );

    // Sort by last message time
    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
      );
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Conversations API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
