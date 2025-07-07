import { NextRequest, NextResponse } from "next/server";
import { getContainerClient } from "@/lib/azureBlob";

// Example: GET /api/azure/list-blobs?container=mycontainer
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const containerName = searchParams.get("container");
  if (!containerName) {
    return NextResponse.json({ error: "Missing container parameter" }, { status: 400 });
  }

  const containerClient = getContainerClient(containerName);
  const blobs: string[] = [];
  for await (const blob of containerClient.listBlobsFlat()) {
    blobs.push(blob.name);
  }

  return NextResponse.json({ blobs });
}
