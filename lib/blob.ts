import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

class AzureBlobService {
  private static instance: AzureBlobService;
  private blobServiceClient: BlobServiceClient | null = null;
  private initialized = false;

  private constructor() {}

  public static getInstance(): AzureBlobService {
    if (!AzureBlobService.instance) {
      AzureBlobService.instance = new AzureBlobService();
    }
    return AzureBlobService.instance;
  }

  private initialize(): void {
    if (this.initialized) return;

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!connectionString) {
      throw new Error("Azure Storage connection string is not set in environment variables");
    }

    try {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize Azure Blob Service Client:", error);
      throw new Error("Failed to initialize Azure Blob Storage client");
    }
  }

  public getContainerClient(containerName: string): ContainerClient {
    this.initialize();

    if (!this.blobServiceClient) {
      throw new Error("Azure Blob Service Client is not initialized");
    }

    return this.blobServiceClient.getContainerClient(containerName);
  }

  public isInitialized(): boolean {
    return this.initialized && this.blobServiceClient !== null;
  }
}

// Export singleton instance
export const azureBlobService = AzureBlobService.getInstance();

// For backward compatibility
export const blobServiceClient = {
  getContainerClient: (containerName: string) => {
    return azureBlobService.getContainerClient(containerName);
  },
};
