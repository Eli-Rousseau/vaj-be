import {
  S3Client,
  ListObjectsCommand,
  ListObjectsCommandOutput,
} from "@aws-sdk/client-s3";

import Logger from "./logger";

export function createS3Client(): S3Client | undefined {
  // Import the environment variables
  const endpoint: string = process.env.B2_ENDPOINT || "";
  const region: string = process.env.B2_REGION || "";
  const keyId: string = process.env.B2_KEY_ID || "";
  const applicationKey: string = process.env.B2_APPLICATION_KEY || "";

  if (!endpoint || !region || !keyId || !applicationKey) {
    Logger.debug(
      "Missing required environment variables: B2_ENDPOINT, B2_OWNER, B2_KEY_ID or B2_APPLICATION_KEY."
    );
    return;
  }

  // Initialize the S3Client
  const s3Client: S3Client = new S3Client({
    endpoint: "https://" + endpoint,
    region: region,
    credentials: {
      accessKeyId: keyId,
      secretAccessKey: applicationKey,
    },
    forcePathStyle: true,
  });

  return s3Client;
}

export async function listObjectsCloudStorage(
  prefix: string = ""
): Promise<ListObjectsCommandOutput | undefined> {
  // Import the environment variables
  const bucketName: string = process.env.B2_BUCKET_NAME || "";

  if (!bucketName) {
    Logger.debug(
      "Missing required environment variables: B2_BUCKET_ENDPOINT or B2_BUCKET_OWNER."
    );
    return;
  }

  // Request the S3 Client
  const s3Client: S3Client | undefined = createS3Client();

  if (S3Client === undefined) return;

  // Make the S3 ListObjectsCommand
  try {
    const listObjects = await s3Client!.send(
      new ListObjectsCommand({
        Bucket: bucketName,
        Delimiter: "/",
        MaxKeys: 1000,
        Prefix: prefix,
      })
    );

    Logger.debug("Succeeded the S3 ListObjectsCommand.");
    return listObjects;
  } catch (error) {
    Logger.error(`Failed the S3 ListObjectsCommand: ${error}`);
    return;
  }
}

export async function putSingleObjectCloudStorage() {}

export async function putMultipleObjectsCloudStorage() {}

export async function getSingleObjectCloudStorage() {}

export async function getMultipleObjectsCloudStorage() {}

export async function deleteSingleObjectCloudStorage() {}

export async function deleteMultipleObjectsCloudStorage() {}
