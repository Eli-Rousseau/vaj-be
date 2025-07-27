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
  content: Buffer;
  contentType: string;
  publicUrl?: string;
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

// Define global variables
let globalAuthResponse: AccountAuthorizationUrlResponse | null;
let globalUploadUrlResponse: UploadUrlResponse | null;

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

const getUploadUrl = async function (): Promise<
  UploadUrlResponse | undefined | null
> {
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
  const bucketId: string = process.env.B2_BUCKET_ID || "";
  if (!baseUrl || !bucketId) {
    Logger.error(
      "Missing required environment variables: B2_BASE_URL or B2_BUCKET_ID."
    );
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

    const url: string = `${baseUrl}/b2api/v4/b2_get_upload_url?bucketId=${bucketId}`;
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
    Logger.info(`Succeeded b2_authorize_account request.`);

    return globalUploadUrlResponse;
  } catch (error) {
    Logger.error(`Failed b2_get_upload_url request: ${error}.`);
    return;
  }
};

export const uploadFile = async function (
  file: File
): Promise<UploadFileResponse | undefined> {
  // Import the environment variables
  const bucketRegion: string = process.env.B2_REGION || "";
  const bucketName: string = process.env.B2_BUCKET_NAME || "";
  if (!bucketRegion || !bucketName) {
    Logger.error(
      "Missing required environment variables: B2_REGION or B2_BUCKET_NAME."
    );
    return;
  }

  // Retrieve the upload url response
  const uploadUrlResponse = await getUploadUrl();
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
    Logger.info(`Succeeded b2_upload_file request.`);

    const publicUrl: string = `https://f${
      bucketRegion.match(/\d{3}/)![0]
    }.backblazeb2.com/file/${bucketName}/${file.name}`;
    file["publicUrl"] = publicUrl;

    return uploadFileResponse;
  } catch (error) {
    Logger.error(`Failed b2_upload_file request: ${error}.`);
    return;
  }
};

export const fileExists = async function () {};

export const deleteFile = async function () {};
