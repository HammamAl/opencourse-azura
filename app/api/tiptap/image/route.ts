import { authOptions } from "@/lib/authOptions";
import { blobServiceClient } from "@/lib/blob";
import { fileTypeFromBuffer, FileTypeResult } from "file-type";
import { getServerSession, Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { v7 as uuidv7 } from "uuid";

// --- Configuration ---
const config = {
  allowedMimeTypes: ["image/webp", "image/jpeg", "image/png"],
  maxSizeBytes: 5 * 1024 * 1024, // 5 MB
  azureContainerName: "images",
};

/**
 * Creates a standardized JSON error response.
 * @param message The error message.
 * @param status The HTTP status code.
 * @returns A NextResponse object.
 */
function errorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Validates the server session and user role.
 * @param session The NextAuth session object.
 * @returns An error response if validation fails, otherwise null.
 */
function validateSession(session: Session | null): NextResponse | null {
  if (!session) {
    return errorResponse("Unauthorized", 401);
  }
  if (session.user.role !== "admin") {
    return errorResponse("Forbidden", 403);
  }
  return null;
}

/**
 * Validates the request headers and file buffer.
 * @param request The NextRequest object.
 * @param buffer The file buffer.
 * @returns A promise that resolves to an error response or the validated file type.
 */
async function validateRequest(
  request: NextRequest,
  buffer: Buffer
): Promise<NextResponse | FileTypeResult> {
  const contentType = request.headers.get("content-type");
  if (!contentType || !config.allowedMimeTypes.includes(contentType)) {
    return errorResponse("Unsupported Media Type", 415);
  }

  if (buffer.length > config.maxSizeBytes) {
    return errorResponse("File too large", 413);
  }

  const fileType = await fileTypeFromBuffer(buffer);
  if (!fileType || !config.allowedMimeTypes.includes(fileType.mime)) {
    return errorResponse("Unsupported Media Type", 415);
  }

  return fileType;
}

/**
 * Uploads the file buffer to Azure Blob Storage.
 * @param buffer The file buffer to upload.
 * @param fileType The validated file type information.
 * @returns The URL of the uploaded image.
 */
async function uploadToAzure(
  buffer: Buffer,
  fileType: FileTypeResult
): Promise<string> {
  const containerClient = blobServiceClient.getContainerClient(
    config.azureContainerName
  );
  const blobName = `${uuidv7()}.${fileType.ext}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: fileType.mime,
    },
  });

  return `${process.env.NEXT_PUBLIC_AZURE_IMAGE_URL}/${config.azureContainerName}/${blobName}`;
}

// --- API Endpoint ---
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const sessionError = validateSession(session);
  if (sessionError) {
    return sessionError;
  }

  try {
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const validationResult = await validateRequest(request, buffer);
    if (validationResult instanceof NextResponse) {
      return validationResult;
    }

    const imageUrl = await uploadToAzure(buffer, validationResult);

    return NextResponse.json({ image_url: imageUrl });
  } catch (error) {
    console.error("Failed to process file upload:", error);
    return errorResponse("Internal Server Error", 500);
  }
}
