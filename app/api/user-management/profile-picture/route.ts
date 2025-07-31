import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { v7 as uuidv7 } from "uuid";

// Lazy loading untuk Azure Blob Service Client
async function createBlobServiceClient() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (!connectionString || connectionString.trim() === "") {
    throw new Error("Azure Storage Connection String is not configured");
  }

  try {
    // Dynamic import untuk menghindari error saat build
    const { BlobServiceClient } = await import("@azure/storage-blob");
    return BlobServiceClient.fromConnectionString(connectionString);
  } catch (error) {
    console.error("Failed to initialize BlobServiceClient:", error);
    throw new Error("Azure Storage service is not available");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terauthorisasi" }, { status: 401 });
    }

    // Check environment variable before proceeding
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString || connectionString.trim() === "") {
      console.error("Azure Storage Connection String not configured");
      return NextResponse.json({ error: "Cloud storage tidak tersedia saat ini" }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Validasi file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Tipe file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP",
        },
        { status: 400 }
      );
    }

    // Validasi file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "Ukuran file terlalu besar. Maksimal 5MB",
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `profile-pictures-web/${session.user.id}/${uuidv7()}.${fileExtension}`;

    try {
      // Initialize BlobServiceClient lazily
      const blobServiceClient = await createBlobServiceClient();

      // Upload to Azure Blob Storage
      const containerClient = blobServiceClient.getContainerClient("profile-pictures-web");

      // Ensure container exists
      await containerClient.createIfNotExists({
        access: "blob", // Public read access
      });

      const blockBlobClient = containerClient.getBlockBlobClient(fileName);

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload file
      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: {
          blobContentType: file.type,
        },
      });

      // Get the URL
      const imageUrl = blockBlobClient.url;

      // Update user profile picture in database
      const updatedUser = await prisma.users.update({
        where: { id: session.user.id },
        data: {
          users_profile_picture_url: imageUrl,
          updated_at: new Date(),
        },
        select: {
          id: true,
          name: true,
          full_name: true,
          email: true,
          users_profile_picture_url: true,
          title: true,
          role: true,
        },
      });

      return NextResponse.json({
        message: "Foto profil berhasil diupload",
        user: updatedUser,
        imageUrl: imageUrl,
      });
    } catch (azureError) {
      console.error("Azure upload error:", azureError);
      return NextResponse.json(
        {
          error: "Gagal mengupload foto ke cloud storage",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan internal server",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terauthorisasi" }, { status: 401 });
    }

    // Get current user data
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { users_profile_picture_url: true },
    });

    if (!user?.users_profile_picture_url) {
      return NextResponse.json(
        {
          error: "Tidak ada foto profil untuk dihapus",
        },
        { status: 400 }
      );
    }

    // Check if Azure is available
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (connectionString && connectionString.trim() !== "") {
      try {
        // Initialize BlobServiceClient lazily
        const blobServiceClient = await createBlobServiceClient();

        // Extract blob name from URL
        const url = new URL(user.users_profile_picture_url);
        // For URL like: https://account.blob.core.windows.net/container/path/file.jpg
        // We need to get everything after the container name
        const pathParts = url.pathname.split("/");
        const blobName = pathParts.slice(2).join("/"); // Skip empty string and container name

        // Delete from Azure Blob Storage
        const containerClient = blobServiceClient.getContainerClient("profile-pictures-web");
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists();
      } catch (azureError) {
        console.error("Azure delete error:", azureError);
        // Continue to update database even if Azure delete fails
      }
    } else {
      console.warn("Azure Storage not configured, skipping blob deletion");
    }

    // Update database
    const updatedUser = await prisma.users.update({
      where: { id: session.user.id },
      data: {
        users_profile_picture_url: null,
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        full_name: true,
        email: true,
        users_profile_picture_url: true,
        title: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "Foto profil berhasil dihapus",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan internal server",
      },
      { status: 500 }
    );
  }
}
