import crypto from "crypto";
import path from "path";
import { existsSync, readFileSync } from "fs";
import { Readable } from "stream";

import getLogger from "./logger";
import { S3ContentType } from "./enums";

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

type ListFileNamesResponse = {
  files: GetFileInfoResponse[];
  nextFileName: string;
};

class Bucket {
  id!: string;
  name!: string;
  region!: string;
  endpoint!: string;

  constructor(init: {
    id: string,
    name: string,
    region: string,
    endpoint: string
  }) {
    this.id = init.id;
    this.name = init.name;
    this.region = init.region;
    this.endpoint = init.endpoint
  }
}

export { S3ContentType };

export class File {
  key!: string;
  name!: string;
  bucket!: Bucket;
  content?: Buffer;
  contentType!: S3ContentType;
  publicUrl?: string;
  id?: string;

  constructor(init: {
    key: string;
    bucket: Bucket;
    content?: Buffer;
    contentType: S3ContentType;
    publicUrl?: string;
    id?: string;
  }) {
    this.key = init.key;
    this.bucket = init.bucket;
    this.content = init.content;
    this.contentType = init.contentType;
    this.name = path.basename(init.key);
    this.publicUrl = init.publicUrl;
    this.id = init.id;
  }

  toPlain() {
    return {
      key: this.key,
      name: this.name,
      bucket: this.bucket,
      contentType: this.contentType,
      publicUrl: this.publicUrl,
      id: this.id,
    };
  }

  static fromPlain(plain: {
    key: string,
    name: string,
    bucket: string,
    content?: Buffer,
    contentType: string,
    publicUrl: string,
    id: string
  }) {
    try {
      const bucket = getBuckets()[plain.bucket];
      
      if (!(plain.contentType in S3ContentType)) {
        throw new Error(`Unrecognized S3ContentType: ${plain.contentType}`);
      }

      const contentType = S3ContentType[plain.contentType as keyof typeof S3ContentType];

      return new File({
        key: plain.key,
        bucket: bucket,
        content: plain.content,
        contentType: contentType,
        publicUrl: plain.publicUrl,
        id: plain.id
      });
    } catch (error) {
      throw Error(`Failed to create File instance: ${error}`);
    }
  }
}

// Define global variables
let globalAuthResponse: AccountAuthorizationUrlResponse | null = null;
let globalUploadUrlResponses: Record<string, UploadUrlResponse> | null = null;

const logger = getLogger({
  source: "utils",
  module: path.basename(__filename),
});

let baseBuckets: Record<string, Bucket> | null = null;

const getBuckets = function () {
  if (baseBuckets) return baseBuckets;

  const stage = process.env.STAGE;
  if (!stage) {
    throw Error("Missing required environmental variable: STAGE.");
  }

  const filePath = `${process.cwd()}/src/utils/buckets-config.json`;
  if (!existsSync(filePath)) {
    throw Error("Missing the buckets configution file.");
  }

  const fileContent = readFileSync(filePath, { encoding: "utf-8" });
  const parsedConfig = JSON.parse(fileContent);

  if (!parsedConfig[stage]) {
    throw Error(`Stage "${stage}" not found in buckets configuration.`);
  }

  const fileConfig: Record<string, any> = parsedConfig[stage];

  baseBuckets = Object.fromEntries(
    Object.entries(fileConfig).map(([key, value]) => {
      // const bucketInstance = plainToInstance(Bucket, value);
      try {
        const bucketInstance = new Bucket({
          id: value?.id,
          name: value?.name,
          region: value?.region,
          endpoint: value?.endpoint
        })
        return [key, bucketInstance];
      } catch (error) {
        throw Error(`Unable to transform input into Bucket instance: ${value}`);
      }
    })
  );

  return baseBuckets;
};

/**
 *
 * @description Helps to return bucket based on its key.
 */
export const findBucket = function (bucketKey: string) {
  const buckets = getBuckets();

  try {
    const bucket = buckets[bucketKey];
    return bucket;
  } catch (error) {
    throw Error(`Unable to retrieve the bucketkey: ${error}`);
  }
};

const hasNonExpiredApplicationKey = function () {
  if (!globalAuthResponse) return false;

  const expirationSeconds =
    globalAuthResponse.applicationKeyExpirationTimestamp;
  const expirationDate =
    expirationSeconds != null
      ? new Date(expirationSeconds * 1000)
      : new Date("5000-01-01T00:00:00Z");

  return Date.now() < expirationDate.getTime();
};

const getAccountAuthorization = async function () {
  if (hasNonExpiredApplicationKey()) return globalAuthResponse!;

  const applicationKeyId = process.env.B2_KEY_ID;
  const applicationKey = process.env.B2_APPLICATION_KEY;
  const baseUrl = process.env.B2_BASE_URL;
  if (!applicationKeyId || !applicationKey || !baseUrl) {
    throw Error("Missing required environment variables: B2_KEY_ID, B2_APPLICATION_KEY, or B2_BASE_URL.");
  }

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
      throw Error(`Failed b2_authorize_account: HTTP ${response.status} ${response.statusText}`);
    }

    globalAuthResponse = await response.json();
    logger.info(`b2_authorize_account request.`);

    return globalAuthResponse;
  } catch (error) {
    throw Error(`Failed b2_authorize_account: ${error}`);
  }
};

const hasNonExpiredAuthorizationToken = function (bucket: Bucket) {
  if (!globalUploadUrlResponses || !(bucket.id in globalUploadUrlResponses))
    return false;
  const globalUploadUrlResponse: UploadUrlResponse =
    globalUploadUrlResponses[bucket.id];

  const expirationSeconds =
    globalUploadUrlResponse.authorizationTokenExpirationTimestamp!;
  const expirationDate =
    expirationSeconds != null
      ? new Date(expirationSeconds * 1000)
      : new Date("2000-01-01T00:00:00Z");

  return Date.now() < expirationDate.getTime();
};

const getUploadUrl = async function (
  bucket: Bucket
): Promise<UploadUrlResponse | undefined | null> {
  if (hasNonExpiredAuthorizationToken(bucket)) {
    const globalUploadUrlResponse: UploadUrlResponse =
      globalUploadUrlResponses![bucket.id];
    return globalUploadUrlResponse;
  }

  const baseUrl = process.env.B2_BASE_URL;
  if (!baseUrl) {
    throw Error("Missing required environment variables: B2_BASE_URL.");
  }

  // Retrieve the account authorization response
  const authResponse = await getAccountAuthorization();
  if (!authResponse) {
    throw Error("Unable to retrieve account authorization.");
  }

  try {
    const now: number = Date.now() / 1000;

    const url: string = `${baseUrl}/b2api/v4/b2_get_upload_url?bucketId=${bucket.id}`;
    const headers = {
      Authorization: authResponse.authorizationToken,
    };

    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      throw Error(`Failed b2_get_upload_url: HTTP ${response.status} ${response.statusText}`);
    }

    const uploadUrlResponse: UploadUrlResponse = await response.json();
    uploadUrlResponse["authorizationTokenExpirationTimestamp"] = now;
    globalUploadUrlResponses = globalUploadUrlResponses ?? {};
    globalUploadUrlResponses[bucket.id] = uploadUrlResponse;
    logger.info(`b2_get_upload_url request.`);

    return uploadUrlResponse;
  } catch (error) {
    throw Error(`Failed b2_get_upload_url request: ${error}`);
  }
};

/**
 *
 * @description Stores ijnput file on the cloud.
 */
export const uploadFile = async function (file: File) {
  if (!file.content) {
    throw Error("Unable to upload file with empty content.")
  }

  // Retrieve the upload url response
  const uploadUrlResponse = await getUploadUrl(file.bucket);
  if (!uploadUrlResponse) {
    throw Error("Unable to retrieve the upload url.");
  }

  try {
    const sha1 = crypto.createHash("sha1").update(file.content).digest("hex");
    const stream = Readable.from(file.content);

    const url: string = uploadUrlResponse.uploadUrl;
    const headers = {
      Authorization: uploadUrlResponse.authorizationToken,
      "X-Bz-File-Name": encodeURIComponent(file.key),
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
      throw Error(`Failed b2_upload_file: HTTP ${response.status} ${response.statusText}`);
    }

    const uploadFileResponse: UploadFileResponse = await response.json();
    logger.info("b2_upload_file request.");

    const publicUrl: string = `https://f${
      file.bucket.region.match(/\d{3}/)![0]
    }.backblazeb2.com/file/${file.bucket.name}/${file.key}`;
    file["publicUrl"] = publicUrl;
    file["id"] = uploadFileResponse.fileId;

    return;
  } catch (error) {
    throw Error(`Failed b2_upload_file request: ${error}.`);
  }
};
/**
 *
 * @description Checks whether file exists on cloud.
 */
export const fileExists = async function (file: File) {
  const baseUrl = process.env.B2_BASE_URL;
  if (!baseUrl) {
    throw Error("Missing required environment variables: B2_BASE_URL.");
  }

  // Retrieve the account authorization response
  const authResponse = await getAccountAuthorization();
  if (!authResponse) {
    throw Error("Unable to retrieve account authorization.");
  }

  try {
    const url: string = `${baseUrl}/b2api/v4/b2_get_file_info?fileId=${file.id}`;
    const headers = {
      Authorization: authResponse.authorizationToken,
    };

    const response = await fetch(url, {
      headers: headers,
    });

    if (!response.ok && response.status !== 400) {
      throw Error(`Failed b2_get_file_info: HTTP ${response.status} ${response.statusText}`);
    }

    const getFileInfoResponse: GetFileInfoResponse | BadFileIdResponse =
      await response.json();
    logger.info("b2_get_file_info request.");
    return response.ok;
  } catch (error) {
    throw Error(`Failed b2_get_file_info request: ${error}`);
  }
};

/**
 *
 * @description Deletes the input file from the cloud.
 */
export const deleteFile = async function (file: File): Promise<void> {
  const baseUrl = process.env.B2_BASE_URL;
  if (!baseUrl) {
    throw Error("Missing required environment variables: B2_BASE_URL.");
  }

  // Retrieve the account authorization response
  const authResponse = await getAccountAuthorization();
  if (!authResponse) {
    throw Error("Unable to retrieve account authorization.");
  }

  try {
    const url: string = `${baseUrl}/b2api/v2/b2_delete_file_version`;
    const headers = {
      Authorization: authResponse.authorizationToken,
      "Content-Type": "application/json",
    };
    const body = {
      fileName: file.key,
      fileId: file.id,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw Error(`Failed b2_delete_file_version: HTTP ${response.status} ${response.statusText}`);
    }

    const deleteFileResponse: DeleteFileResponse = await response.json();
    logger.info("b2_delete_file_version request.");

    file["publicUrl"] = undefined;
    file["id"] = undefined;
    return;
  } catch (error) {
    throw Error(`Failed b2_delete_file_version request: ${error}`);
  }
};

/**
 *
 * @description Returns list of files in bucket starting with input prefix.
 */
export const listFileNames = async function (
  bucket: Bucket,
  prefix: string = ""
) {
  const baseUrl = process.env.B2_BASE_URL;
  if (!baseUrl) {
    throw Error("Missing required environment variables: B2_BASE_URL.");
  }

  // Retrieve the account authorization response
  const authResponse = await getAccountAuthorization();
  if (!authResponse) {
    throw Error("Unable to retrieve account authorization.");
  }

  try {
    let startFileName: string | null = "";
    let fileNames: string[] = [];

    while (startFileName !== null) {
      const url: string = `${baseUrl}/b2api/v4/b2_list_file_names?bucketId=${
        bucket.id
      }${prefix ? `&prefix=${prefix}` : ""}${
        startFileName ? `&startFileName=${startFileName}` : ""
      }`;
      const headers = {
        Authorization: authResponse.authorizationToken,
      };

      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        throw Error(`Failed b2_list_file_names: HTTP ${response.status} ${response.statusText}`);
      }

      const listFileNamesResponse: ListFileNamesResponse =
        await response.json();
      for (const file of listFileNamesResponse.files) {
        fileNames.push(file.fileName);
      }
      startFileName = listFileNamesResponse.nextFileName;
    }

    logger.info("b2_list_file_names request.");

    return fileNames;
  } catch (error) {
    throw Error(`Failed b2_list_file_names reques: ${error}`);
  }
};

/**
 * @description Downloads file content from the cloud.
 * @todo Implement
 */
export const downloadFile = async function (file: File) {
  const baseUrl = process.env.B2_BASE_URL;
  if (!baseUrl) {
    throw Error("Missing required environment variables: B2_BASE_URL.");
  }

  // Retrieve the account authorization response
  const authResponse = await getAccountAuthorization();
  if (!authResponse) {
    throw Error("Unable to retrieve account authorization.");
  }

  try {
    const url = `${baseUrl}/b2api/v4/b2_download_file_by_id?fileId=${file.id}`;
    const headers = {
      Authorization: authResponse.authorizationToken
    };

    const response = await fetch(url, {
      method: "GET",
      headers: headers
    });

    if (!response.ok) {
      throw Error(`Failed b2_download_file_by_id: HTTP ${response.status} ${response.statusText}`);
    }

    logger.info("b2_download_file_by_id request.");

    file.content = Buffer.from(await response.arrayBuffer());

  } catch (error) {
    throw Error(`Failed b2_download_file_by_id request: ${error}.`);
  }
};
