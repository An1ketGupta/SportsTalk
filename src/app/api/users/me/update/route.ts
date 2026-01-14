import { auth } from "@/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Update current user's profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, image, coverImage } = body;

    // Validation
    if (name !== undefined && (!name.trim() || name.trim().length === 0)) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 }
      );
    }

    if (bio !== undefined && bio.length > 160) {
      return NextResponse.json(
        { error: "Bio cannot exceed 160 characters" },
        { status: 400 }
      );
    }

    if (name !== undefined && name.length > 50) {
      return NextResponse.json(
        { error: "Name cannot exceed 50 characters" },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: currentUserId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(bio !== undefined && { bio: bio.trim() || null }),
        ...(image !== undefined && { image: image || null }),
        ...(coverImage !== undefined && { coverImage: coverImage || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        coverImage: true,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.email?.split("@")[0] ?? "user",
        image: updatedUser.image,
        bio: updatedUser.bio,
        coverImage: updatedUser.coverImage,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
