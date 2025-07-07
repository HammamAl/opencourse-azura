import { BlobServiceClient } from "@azure/storage-blob";

let _blobServiceClient: BlobServiceClient | null = null;

// Lazy initialization function
function getBlobServiceClient(): BlobServiceClient {
  if (!_blobServiceClient) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!connectionString) {
      throw new Error("Azure Storage connection string is not set in environment variables");
    }

    try {
      _blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    } catch (error) {
      console.error("Failed to create Azure Blob Service Client:", error);
      throw new Error("Failed to initialize Azure Blob Storage client");
    }
  }

  return _blobServiceClient;
}

// Export the getter function instead of the client directly
export { getBlobServiceClient };

// Utility function: get container client
export function getContainerClient(containerName: string) {
  return getBlobServiceClient().getContainerClient(containerName);
}

// For backward compatibility, export a getter
export const blobServiceClient = {
  getContainerClient: (containerName: string) => {
    return getBlobServiceClient().getContainerClient(containerName);
  },
};
