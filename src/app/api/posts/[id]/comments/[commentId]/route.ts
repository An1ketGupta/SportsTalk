import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: Promise<{
    id: string;
    commentId: string;
  }>;
};

// Delete a comment
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: postId, commentId } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if post matches
    if (comment.postId !== postId) {
      return NextResponse.json({ error: "Comment not found in this post" }, { status: 404 });
    }

    // Allow deletion if user is the comment author OR the post author
    if (comment.authorId !== user.id && comment.post.authorId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
