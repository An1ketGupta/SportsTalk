import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        const validVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
        const isImage = validImageTypes.includes(file.type);
        const isVideo = validVideoTypes.includes(file.type);

        if (!isImage && !isVideo) {
            return NextResponse.json(
                { error: "Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, MOV) are allowed." },
                { status: 400 }
            );
        }

        // Validate file size (10MB for images, 100MB for videos)
        const maxImageSize = 10 * 1024 * 1024; // 10MB
        const maxVideoSize = 100 * 1024 * 1024; // 100MB
        const maxSize = isVideo ? maxVideoSize : maxImageSize;

        if (file.size > maxSize) {
            return NextResponse.json(
                { error: `File too large. Maximum size is ${isVideo ? "100MB" : "10MB"}.` },
                { status: 400 }
            );
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");
        const dataURI = `data:${file.type};base64,${base64}`;

        // Upload to Cloudinary
        const uploadOptions: any = {
            folder: "sportstalk",
            resource_type: isVideo ? "video" : "image",
        };

        // Add video-specific options
        if (isVideo) {
            uploadOptions.eager = [
                { width: 720, height: 720, crop: "limit", format: "mp4" }
            ];
            uploadOptions.eager_async = true;
        } else {
            // Image optimization
            uploadOptions.transformation = [
                { width: 1200, height: 1200, crop: "limit", quality: "auto" }
            ];
        }

        const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: result.format,
            width: result.width,
            height: result.height,
        });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to upload file" },
            { status: 500 }
        );
    }
}
