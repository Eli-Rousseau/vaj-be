import {
  S3Client,
  ListObjectsCommand,
  ListObjectsCommandOutput,
  _Object,
  PutObjectCommand,
  PutObjectCommandOutput,
  HeadObjectCommand,
  HeadObjectCommandOutput,
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
  bucket: string,
  prefix: string = ""
): Promise<_Object[] | undefined> {
  // Request the S3 Client
  const s3Client: S3Client | undefined = createS3Client();
  if (S3Client === undefined) return;

  // Execute the S3 ListObjectsCommand
  let output: ListObjectsCommandOutput;
  try {
    output = await s3Client!.send(
      new ListObjectsCommand({
        Bucket: bucket,
        Delimiter: "/",
        MaxKeys: 1000,
        Prefix: prefix,
      })
    );
    const statusCode: number | undefined = output.$metadata.httpStatusCode;
    Logger.debug(
      `Terminated the S3 ListObjectsCommand with status code: ${statusCode}.`
    );

    // Exit when status code is not 200
    if (!statusCode || !(statusCode >= 200 && statusCode < 300)) {
      return;
    }
  } catch (error) {
    Logger.error(`Failed the S3 ListObjectsCommand: ${error}`);
    return;
  }

  // Return the output contents
  return output.Contents;
}

export interface PutS3Object {
  bucket: string;
  key: string;
  contentType: string;
  fileContent: Buffer;
}

export async function putSingleObjectCloudStorage(
  object: PutS3Object
): Promise<string | void> {
  // Request the S3 Client
  const s3Client: S3Client | undefined = createS3Client();
  if (S3Client === undefined) return;

  // Excute the S3 PutObjectCommand
  let output: PutObjectCommandOutput;
  try {
    output = await s3Client!.send(
      new PutObjectCommand({
        Bucket: object.bucket,
        Key: object.key,
        Body: object.fileContent,
        ContentType: object.contentType,
        Metadata: {
          uploadedBy: "owner",
        },
        CacheControl: "max-age=3600",
        ServerSideEncryption: "AES256",
      })
    );
    const statusCode: number | undefined = output.$metadata.httpStatusCode;
    Logger.debug(
      `Terminated the S3 PutObjectCommand with status code: ${statusCode}.`
    );

    // Exit when status code is not 200
    if (!statusCode || !(statusCode >= 200 && statusCode < 300)) {
      return;
    }
  } catch (error) {
    Logger.error(`Failed the S3 PutObjectCommand: ${error}`);
    return;
  }

  // Construct the friendly url
  const url: string = `https://f003.backblazeb2.com/file/${object.bucket}/${object.key}`;

  return url;
}

export async function putMultipleObjectsCloudStorage() {}

export async function deleteSingleObjectCloudStorage() {}

export async function deleteMultipleObjectsCloudStorage() {}
