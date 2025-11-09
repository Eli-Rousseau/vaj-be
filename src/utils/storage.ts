import crypto from "crypto";
import path from "path";
import { existsSync, readFileSync } from "fs";
import { Readable } from "stream";

import getLogger from "./logger";
import { S3ContentType } from "./enums";
import { Expose, plainToInstance } from "class-transformer";

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
  @Expose()
  id!: string;
  @Expose()
  name!: string;
  @Expose()
  region!: string;
  @Expose()
  endpoint!: string;
}

export { S3ContentType };

export class File {
  key!: string;
  name!: string;
  bucket!: Bucket;
  content!: Buffer;
  contentType!: S3ContentType;
  publicUrl?: string;
  id?: string;

  constructor(init: {
    key: string;
    bucket: Bucket;
    content: Buffer;
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
    logger.error("Missing required environmental variable: STAGE.");
    process.exit(-1);
  }

  const filePath = `${process.cwd()}/src/utils/buckets-config.json`;
  if (!existsSync(filePath)) {
    logger.error("Missing the buckets configution file.");
    process.exit(-1);
  }

  const fileContent = readFileSync(filePath, { encoding: "utf-8" });
  const parsedConfig = JSON.parse(fileContent);

  if (!parsedConfig[stage]) {
    logger.error(`Stage "${stage}" not found in buckets configuration.`);
    process.exit(-1);
  }

  const fileConfig = parsedConfig[stage];

  baseBuckets = Object.fromEntries(
    Object.entries(fileConfig).map(([key, value]) => {
      const bucketInstance = plainToInstance(Bucket, value);
      return [key, bucketInstance];
    })
  );

  return baseBuckets;
};

export const findBucket = function (bucketKey: string) {
  const buckets = getBuckets();

  try {
    const bucket = buckets[bucketKey];
    return bucket;
  } catch (error) {
    logger.error(error);
    process.exit(-1);
  }
};

const hasNonExperiredApplicationKey = function () {
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
  if (hasNonExperiredApplicationKey()) return globalAuthResponse!;

  const applicationKeyId = process.env.B2_KEY_ID;
  const applicationKey = process.env.B2_APPLICATION_KEY;
  const baseUrl = process.env.B2_BASE_URL;
  if (!applicationKeyId || !applicationKey || !baseUrl) {
    logger.error(
      "Missing required environment variables: B2_KEY_ID, B2_APPLICATION_KEY, or B2_BASE_URL."
    );
    return;
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
      logger.error(
        `Failed b2_authorize_account: HTTP ${response.status} ${response.statusText}`
      );
      return;
    }

    globalAuthResponse = await response.json();
    logger.info(`b2_authorize_account request.`);

    return globalAuthResponse;
  } catch (error) {
    logger.error(error);
    return;
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
    logger.error("Missing required environment variables: B2_BASE_URL.");
    return;
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
      logger.error(
        `Failed b2_get_upload_url: HTTP ${response.status} ${response.statusText}`
      );
      return;
    }

    const uploadUrlResponse: UploadUrlResponse = await response.json();
    uploadUrlResponse["authorizationTokenExpirationTimestamp"] = now;
    globalUploadUrlResponses = globalUploadUrlResponses ?? {};
    globalUploadUrlResponses[bucket.id] = uploadUrlResponse;
    logger.info(`b2_get_upload_url request.`);

    return uploadUrlResponse;
  } catch (error) {
    logger.error(error);
    return;
  }
};

export const uploadFile = async function (file: File) {
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
      logger.error(
        `Failed b2_upload_file: HTTP ${response.status} ${response.statusText}`
      );
      return;
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
    logger.error(`Failed b2_upload_file request: ${error}.`);
    return;
  }
};

export const fileExists = async function (
  file: File
): Promise<boolean | undefined> {
  // Import the environment variables
  const baseUrl: string = process.env.B2_BASE_URL || "url";
  if (!baseUrl) {
    // Logger.error("Missing required environment variables: B2_BASE_URL.");
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
      // Logger.error(
      //   `Failed b2_get_file_info: HTTP ${response.status} ${response.statusText}`
      // );
      return;
    }

    const getFileInfoResponse: GetFileInfoResponse | BadFileIdResponse =
      await response.json();
    if (
      "message" in getFileInfoResponse &&
      /Bad File ID/i.test(getFileInfoResponse.message)
    ) {
      // Logger.info("Succeeded b2_get_file_info request.");
      return false;
    }

    if (response.ok) {
      // Logger.info("Succeeded b2_get_file_info request.");
      return true;
    } else {
      // Logger.error(
      //   `Failed b2_get_file_info: HTTP ${response.status} ${response.statusText}`
      // );
      return;
    }
  } catch (error) {
    // Logger.error(`Failed b2_get_file_info request: ${error}.`);
    return;
  }
};

export const deleteFile = async function (file: File): Promise<void> {
  // Import the environment variables
  const baseUrl: string = process.env.B2_BASE_URL || "url";
  if (!baseUrl) {
    // Logger.error("Missing required environment variables: B2_BASE_URL.");
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
      // Logger.error(
      //   `Failed b2_delete_file_version: HTTP ${response.status} ${response.statusText}`
      // );
      return;
    }

    const deleteFileResponse: DeleteFileResponse = await response.json();
    // Logger.info("Succeeded b2_delete_file_version request.");

    file["publicUrl"] = undefined;
    file["id"] = undefined;
    return;
  } catch (error) {
    // Logger.error(`Failed b2_delete_file_version request: ${error}.`);
    return;
  }
};

// export const listFileNames = async function (
//   bucket: string,
//   prefix: string = ""
// ): Promise<string[] | undefined> {
//   // Import the environment variables
//   const baseUrl: string = process.env.B2_BASE_URL || "url";
//   if (!baseUrl) {
//     // Logger.error("Missing required environment variables: B2_BASE_URL.");
//     return;
//   }

//   // Retrieve the bucket instance
//   const bucketMap = getBucketMap();
//   if (bucketMap === undefined || bucketMap.size === 0) {
//     // Logger.error(`Unable to parse retrieve any storage bucket.`);
//     return;
//   }
//   const bucketObject = bucketMap.get(bucket.toUpperCase());
//   if (!bucketObject) {
//     // Logger.error(`Unable to retrieve bucket object for: ${bucket}.`);
//     return;
//   }

//   // Retrieve the account authorization response
//   const authResponse = await getAccountAuthorization();
//   if (!authResponse) {
//     throw Error("Unable to retrieve account authorization.");
//   }

//   // Perform the b2_list_file_names request
//   try {
//     let startFileName: string | null = "";
//     let fileNames: string[] = [];

//     while (startFileName !== null) {
//       const url: string = `${baseUrl}/b2api/v4/b2_list_file_names?bucketId=${
//         bucketObject.id
//       }${prefix ? `&prefix=${prefix}` : ""}${
//         startFileName ? `&startFileName=${startFileName}` : ""
//       }`;
//       const headers = {
//         Authorization: authResponse.authorizationToken,
//       };

//       const response = await fetch(url, {
//         method: "GET",
//         headers: headers,
//       });

//       if (!response.ok) {
//         // Logger.error(
//         //   `Failed b2_list_file_names: HTTP ${response.status} ${response.statusText}`
//         // );
//         return;
//       }

//       const listFileNamesResponse: ListFileNamesResponse =
//         await response.json();
//       for (let i: number = 0; i < listFileNamesResponse.files.length; i++) {
//         const file: GetFileInfoResponse = listFileNamesResponse.files[i];
//         fileNames.push(file.fileName);
//       }
//       startFileName = listFileNamesResponse.nextFileName;
//     }

//     // Logger.info("Succeeded b2_list_file_names request.");

//     return fileNames;
//   } catch (error) {
//     // Logger.error(`Failed b2_list_file_names request: ${error}.`);
//     return;
//   }
// };
