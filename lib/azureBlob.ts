import { BlobServiceClient } from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
if (!connectionString) {
  throw new Error("Azure Storage connection string is not set in .env");
}

export const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Utility function: get container client
export function getContainerClient(containerName: string) {
  return blobServiceClient.getContainerClient(containerName);
}
