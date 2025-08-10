import crypto from "crypto";
import { Readable } from "stream";

import Logger from "./logger";

type Allowed = {
  buckets: any[];
  capabilities: string[];
  namePrefix: string;
};

type StorageApi = {
  absoluteMinimumPartSize: number;
  apiUrl: string;
  allowed: Allowed;
  recommendedPartSize: number;
  s3ApiUrl: string;
};

type GroupsApi = {
  capabilities: string[];
  groupsApiUrl: string;
  infoType: string;
};

type ApiInfo = {
  groupsApi: GroupsApi;
  storageApi: StorageApi;
};

type AccountAuthorizationUrlResponse = {
  accountId: string;
  apiInfo: ApiInfo;
  authorizationToken: string;
  applicationKeyExpirationTimestamp: number;
};

type UploadUrlResponse = {
  bucketId: string;
  uploadUrl: string;
  authorizationToken: string;
  authorizationTokenExpirationTimestamp?: number;
};

export type File = {
  name: string;
  bucket: string;
  content: Buffer;
  contentType: string;
  publicUrl?: string;
  id?: string;
};

type FileRetention = {
  isClientAuthorizedToRead: boolean;
  value: { mode: string; retainUntilTimestamp: number };
};

type LegalHold = {
  isClientAuthorizedToRead: boolean;
  value: string;
};

type ServerSideEncryption = {
  algorithm: string;
  mode: string;
};

type UploadFileResponse = {
  accountId: string;
  action: string;
  bucketId: string;
  contentLength: string;
  contentSha1: string;
  contentMd5: string;
  contentType: string;
  fileId: string;
  fileInfo: any;
  fileName: string;
  fileRetention: FileRetention;
  legalHold: LegalHold;
  replicationStatus: string;
  serverSideEncryption: ServerSideEncryption;
  uploadTimestamp: number;
};

type GetFileInfoResponse = {
  accountId: string;
  action: string;
  bucketId: string;
  contentLength: string;
  contentSha1: string;
  contentMd5: string;
  contentType: string;
  fileId: string;
  fileInfo: any;
  fileName: string;
  fileRetention: FileRetention;
  legalHold: LegalHold;
  replicationStatus: string;
  serverSideEncryption: ServerSideEncryption;
  uploadTimestamp: number;
};

type BadFileIdResponse = {
  code: string;
  message: string;
  status: number;
};

type DeleteFileResponse = {
  keyName: string;
  applicationKeyId: string;
  capabilities: string[];
  accountId: string;
  expirationTimestamp: number;
  bucketIds: string;
  namePrefix: string;
  options: string[];
};

type Bucket = {
  id: string;
  name: string;
  region: string;
  endpoint: string;
};

// Define global variables
let globalAuthResponse: AccountAuthorizationUrlResponse | null;
let globalUploadUrlResponse: UploadUrlResponse | null;

const getBucketMap = function (): Map<string, Bucket> | undefined {
  // Retrieve all the bucket names
  let bucketNames: Set<string> = new Set();
  for (let key in process.env) {
    if (/^B2_.*_BUCKET/.test(key)) {
      bucketNames.add(key.split("_")[1]);
    }
  }

  // Make a map of bucket names over bucket instance
  const bucketMap: Map<string, Bucket> = new Map();
  for (let bucketName of bucketNames) {
    // Import the environment variables
    const id: string = process.env[`B2_${bucketName}_BUCKET_ID`] || "";
    const name: string = process.env[`B2_${bucketName}_BUCKET_NAME`] || "";
    const region: string = process.env[`B2_${bucketName}_BUCKET_REGION`] || "";
    const endpoint: string =
      process.env[`B2_${bucketName}_BUCKET_ENDPOINT`] || "";

    if (!id || !name || !region || !endpoint) {
      Logger.error(
        `Missing required environment variables: B2_${name}_BUCKET_ID, B2_${name}_BUCKET_NAME, B2_${name}_BUCKET_REGION or B2_${name}_BUCKET_ENDPOINT.`
      );
      return;
    }

    // Add key and values to bucket map
    bucketMap.set(bucketName, {
      id,
      name,
      region,
      endpoint,
    });
  }

  return bucketMap;
};

const getAccountAuthorization = async function (): Promise<
  AccountAuthorizationUrlResponse | null | undefined
> {
  // Check whether an authResponse is already defined
  if (globalAuthResponse) {
    const expirationSeconds =
      globalAuthResponse.applicationKeyExpirationTimestamp;
    const expirationDate =
      expirationSeconds != null
        ? new Date(expirationSeconds * 1000)
        : new Date("5000-01-01T00:00:00Z");
    if (Date.now() < expirationDate.getTime()) {
      return globalAuthResponse;
    }
  }

  // Import the environment variables
  const applicationKeyId: string = process.env.B2_KEY_ID || "";
  const applicationKey: string = process.env.B2_APPLICATION_KEY || "";
  const baseUrl: string = process.env.B2_BASE_URL || "";
  if (!applicationKeyId || !applicationKey || !baseUrl) {
    Logger.error(
      "Missing required environment variables: B2_KEY_ID, B2_APPLICATION_KEY, or B2_BASE_URL."
    );
    return;
  }

  // Perform the b2_authorize_account request
  try {
    const url: string = `${baseUrl}/b2api/v4/b2_authorize_account`;
    const headers = {
      Authorization:
        "Basic " +
        Buffer.from(`${applicationKeyId}:${applicationKey}`).toString("base64"),
    };

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      Logger.error(
        `Failed b2_authorize_account: HTTP ${response.status} ${response.statusText}`
      );
      return;
    }

    globalAuthResponse = await response.json();
    Logger.info(`Succeeded b2_authorize_account request.`);

    return globalAuthResponse;
  } catch (error) {
    Logger.error(`Failed b2_authorize_account request: ${error}.`);
    return;
  }
};

const getUploadUrl = async function (
  bucketObject: Bucket
): Promise<UploadUrlResponse | undefined | null> {
  // Check whether an authResponse is already defined
  if (globalUploadUrlResponse) {
    const expirationSeconds =
      globalUploadUrlResponse.authorizationTokenExpirationTimestamp!;
    const expirationDate =
      expirationSeconds != null
        ? new Date(expirationSeconds * 1000)
        : new Date("2000-01-01T00:00:00Z");
    if (Date.now() < expirationDate.getTime()) {
      return globalUploadUrlResponse;
    }
  }

  // Import the environment variables
  const baseUrl: string = process.env.B2_BASE_URL || "";
  if (!baseUrl) {
    Logger.error("Missing required environment variables: B2_BASE_URL.");
    return;
  }

  // Retrieve the account authorization response
  const authResponse = await getAccountAuthorization();
  if (!authResponse) {
    throw Error("Unable to retrieve account authorization.");
  }

  // Peform b2_get_upload_url request
  try {
    const now: number = Date.now() / 1000;

    const url: string = `${baseUrl}/b2api/v4/b2_get_upload_url?bucketId=${bucketObject.id}`;
    const headers = {
      Authorization: authResponse.authorizationToken,
    };

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      Logger.error(
        `Failed b2_get_upload_url: HTTP ${response.status} ${response.statusText}`
      );
      return;
    }

    globalUploadUrlResponse = await response.json();
    globalUploadUrlResponse!["authorizationTokenExpirationTimestamp"] = now;
    Logger.info(`Succeeded b2_get_upload_url request.`);

    return globalUploadUrlResponse;
  } catch (error) {
    Logger.error(`Failed b2_get_upload_url request: ${error}.`);
    return;
  }
};

export const uploadFile = async function (file: File): Promise<void> {
  // Retrieve the bucket instance
  const bucketMap = getBucketMap();
  if (bucketMap === undefined || bucketMap.size === 0) {
    Logger.error(`Unable to parse retrieve any storage bucket.`);
    return;
  }
  const bucketObject = bucketMap.get(file.bucket.toUpperCase());
  if (!bucketObject) {
    Logger.error(`Unable to retrieve bucket object for: ${file.bucket}.`);
    return;
  }

  // Retrieve the upload url response
  const uploadUrlResponse = await getUploadUrl(bucketObject);
  if (!uploadUrlResponse) {
    throw Error("Unable to retrieve the upload url.");
  }

  // Peform the b2_upload_file request
  try {
    const sha1 = crypto.createHash("sha1").update(file.content).digest("hex");
    const stream = Readable.from(file.content);

    const url: string = uploadUrlResponse.uploadUrl;
    const headers = {
      Authorization: uploadUrlResponse.authorizationToken,
      "X-Bz-File-Name": encodeURIComponent(file.name),
      "Content-Type": file.contentType,
      "Content-Length": file.content.length.toString(),
      "X-Bz-Content-Sha1": sha1,
      "X-Bz-Server-Side-Encryption": "AES256",
    };

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: stream as unknown as BodyInit,
      // @ts-expect-error: 'duplex' is a Node.js-specific option
      duplex: "half",
    });

    if (!response.ok) {
      Logger.error(
        `Failed b2_upload_file: HTTP ${response.status} ${response.statusText}`
      );
      return;
    }

    const uploadFileResponse: UploadFileResponse = await response.json();

    const publicUrl: string = `https://f${
      bucketObject.region.match(/\d{3}/)![0]
    }.backblazeb2.com/file/${file.bucket}/${file.name}`;
    file["publicUrl"] = publicUrl;
    file["id"] = uploadFileResponse.fileId;

    return;
  } catch (error) {
    Logger.error(`Failed b2_upload_file request: ${error}.`);
    return;
  }
};

export const fileExists = async function (
  file: File
): Promise<boolean | undefined> {
  // Import the environment variables
  const baseUrl: string = process.env.B2_BASE_URL || "url";
  if (!baseUrl) {
    Logger.error("Missing required environment variables: B2_BASE_URL.");
    return;
  }

  // Retrieve the account authorization response
  const authResponse = await getAccountAuthorization();
  if (!authResponse) {
    throw Error("Unable to retrieve account authorization.");
  }

  // Peform the b2_get_file_info request
  try {
    const url: string = `${baseUrl}/b2api/v4/b2_get_file_info?fileId=${file.id}`;
    const headers = {
      Authorization: authResponse.authorizationToken,
    };

    const response = await fetch(url, {
      headers: headers,
    });

    if (!response.ok && response.status !== 400) {
      Logger.error(
        `Failed b2_get_file_info: HTTP ${response.status} ${response.statusText}`
      );
      return;
    }

    const getFileInfoResponse: GetFileInfoResponse | BadFileIdResponse =
      await response.json();
    if (
      "message" in getFileInfoResponse &&
      /Bad File ID/i.test(getFileInfoResponse.message)
    ) {
      Logger.info("Succeeded b2_get_file_info request.");
      return false;
    }

    if (response.ok) {
      Logger.info("Succeeded b2_get_file_info request.");
      return true;
    } else {
      Logger.error(
        `Failed b2_get_file_info: HTTP ${response.status} ${response.statusText}`
      );
      return;
    }
  } catch (error) {
    Logger.error(`Failed b2_get_file_info request: ${error}.`);
    return;
  }
};

export const deleteFile = async function (file: File): Promise<void> {
  // Import the environment variables
  const baseUrl: string = process.env.B2_BASE_URL || "url";
  if (!baseUrl) {
    Logger.error("Missing required environment variables: B2_BASE_URL.");
    return;
  }

  // Retrieve the account authorization response
  const authResponse = await getAccountAuthorization();
  if (!authResponse) {
    throw Error("Unable to retrieve account authorization.");
  }

  // Peform the b2_delete_file_version request
  try {
    const url: string = `${baseUrl}/b2api/v2/b2_delete_file_version`;
    const headers = {
      Authorization: authResponse.authorizationToken,
      "Content-Type": "application/json",
    };
    const body = {
      fileName: file.name,
      fileId: file.id,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      Logger.error(
        `Failed b2_delete_file_version: HTTP ${response.status} ${response.statusText}`
      );
      return;
    }

    const deleteFileResponse: DeleteFileResponse = await response.json();
    Logger.info("Succeeded b2_delete_file_version request.");

    file["publicUrl"] = undefined;
    file["id"] = undefined;
    return;
  } catch (error) {
    Logger.error(`Failed b2_delete_file_version request: ${error}.`);
    return;
  }
};
