import { authOptions } from "@/lib/authOptions";
import { blobServiceClient } from "@/lib/blob";
import { fileTypeFromBuffer } from "file-type";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { v7 as uuidv7 } from "uuid";

const ALLOWED_MIME_TYPES = ["image/webp", "image/jpeg", "image/png"];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const contentType = request.headers.get("content-type");

    if (!contentType || !ALLOWED_MIME_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "Unsupported Media Type" },
        {
          status: 415,
        }
      );
    }

    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    if (buffer.length > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    // Validate using file signature
    const type = await fileTypeFromBuffer(buffer);
    if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
      return NextResponse.json(
        { error: "Unsupported Media Type" },
        {
          status: 415,
        }
      );
    }

    const containerClient = blobServiceClient.getContainerClient("images");
    const extension = type.ext;
    const blobName = `${uuidv7()}.${extension}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: type.mime,
      },
    });

    return NextResponse.json({
      users_profile_picture_url: `${process.env.NEXT_PUBLIC_AZURE_IMAGE_URL}/images/${blobName}`,
    });
  } catch (error) {
    console.error("Error in profile-picture upload:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
