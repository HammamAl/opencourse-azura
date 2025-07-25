import { NextResponse } from "next/server";

export async function GET() {
  try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!connectionString) {
      console.warn("Azure Storage connection string is not set");
      return NextResponse.json(
        {
          error: "Azure Storage not configured",
          message: "Azure Storage connection string is not available",
        },
        { status: 503 }
      );
    }

    const { BlobServiceClient } = await import("@azure/storage-blob");
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

    const containerName = "your-container-name"; // Replace with your container name
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobs = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      blobs.push({
        name: blob.name,
        lastModified: blob.properties.lastModified,
        size: blob.properties.contentLength,
      });
    }

    return NextResponse.json({ blobs });
  } catch (error) {
    console.error("Azure blob API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : "Unable to fetch blobs",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
