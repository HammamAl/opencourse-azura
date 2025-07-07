import { BlobServiceClient } from "@azure/storage-blob";

const connStr = process.env.AZURE_BLOB_CONN_STRING;

export const blobServiceClient = BlobServiceClient.fromConnectionString(
  connStr!,
);
