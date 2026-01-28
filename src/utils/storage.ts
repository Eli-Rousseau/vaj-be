import crypto from "crypto";
import path from "path";
import { Readable } from "stream";
import { existsSync, readFileSync } from "fs";
import { Exclude, Expose } from "class-transformer";

import { logger } from "../../src/utils/logger";
import { findEnumsValue, S3ContentType } from "../../src/utils/enums";
import { ShopFile } from "../database/classes/transformer-classes";

const LOGGER = logger.get({
  source: "utils",
  module: path.basename(__filename),
});

class Bucket {
  key!: string;
  id!: string;
  name!: string;
  region!: string;
  endpoint!: string;
  isPublic!: boolean;

  constructor(init: {
    key: string,
    id: string,
    name: string,
    region: string,
    endpoint: string,
    isPublic: boolean
  }) {
    this.key = init.key;
    this.id = init.id;
    this.name = init.name;
    this.region = init.region;
    this.endpoint = init.endpoint;
    this.isPublic = init.isPublic;
  }
}

export { S3ContentType };

export class File extends ShopFile {
  @Exclude()
  content: Buffer | null = null;

  @Expose()
  override contentType: S3ContentType | null = null;

  override toPlain(): ShopFile {
    return ShopFile.fromPlain(super.toPlain());
  }
}


// export class File {
//   key!: string;
//   name!: string;
//   bucket!: Bucket;
//   content?: Buffer;
//   contentType!: S3ContentType;
//   publicUrl?: string;
//   id?: string;

//   constructor(init: {
//     key: string;
//     bucket: Bucket;
//     content?: Buffer;
//     contentType: S3ContentType;
//     publicUrl?: string;
//     id?: string;
//   }) {
//     this.key = init.key;
//     this.bucket = init.bucket;
//     this.content = init.content;
//     this.contentType = init.contentType;
//     this.name = path.basename(init.key);
//     this.publicUrl = init.publicUrl;
//     this.id = init.id;
//   }

//   toPlain() {
//     return {
//       key: this.key,
//       name: this.name,
//       bucket: this.bucket.key,
//       contentType: this.contentType,
//       publicUrl: this.publicUrl,
//       id: this.id,
//     };
//   }

//   static fromPlain(plain: {
//     key: string,
//     name: string,
//     bucket: string,
//     content?: Buffer,
//     contentType: string,
//     publicUrl?: string,
//     id: string
//   }) {
//     try {
//       const bucket = storage.findBucket(plain.bucket);

//       const contentType = findEnumsValue(plain.contentType, S3ContentType);
      
//       if (!contentType) {
//         throw new Error(`Unrecognized S3ContentType: ${plain.contentType}`);
//       }

//       return new File({
//         key: plain.key,
//         bucket,
//         content: plain.content,
//         contentType,
//         publicUrl: plain.publicUrl,
//         id: plain.id
//       });
//     } catch (error) {
//       throw new Error(`Failed to create File instance: ${error}`);
//     }
//   }
// }

class StorageClient {

    private buckets: Record<string, Bucket> | null = null;
    private authorization: { 
        applicationKeyExpirationTimestamp: number;
        authorizationToken: string; 
        apiInfo: { storageApi: { apiUrl: string, downloadUrl: string } };
    } | null = null;
    private bucketUploadUrls: Map<Bucket, {
        authorizationTokenExpirationTimestamp: number;
        authorizationToken: string;
        uploadUrl: string;

    }> = new Map();

    private getBuckets(stage: string) {
        if (this.buckets) return this.buckets;

        const filePath = `${process.cwd()}/src/utils/buckets-config.json`;
        if (!existsSync(filePath)) {
            throw new Error("Missing the buckets configution file.");
        }

        const fileContent = readFileSync(filePath, { encoding: "utf-8" });
        const parsedConfig = JSON.parse(fileContent);

        if (!parsedConfig[stage]) {
            throw new Error(`Stage "${stage}" not found in buckets configuration.`);
        }

        const fileConfig: Record<string, any> = parsedConfig[stage];

        const buckets = Object.fromEntries(
            Object.entries(fileConfig).map(([key, value]) => {
            try {
                const bucketInstance = new Bucket({
                    key: value?.key,
                    id: value?.id,
                    name: value?.name,
                    region: value?.region,
                    endpoint: value?.endpoint,
                    isPublic: value?.isPublic
                })
                return [key, bucketInstance];
            } catch (error) {
                throw new Error(`Unable to transform input into Bucket instance: ${value}`);
            }
            })
        );

        return buckets;
    }

    findBucket(bucketKey: string) {
        const stage = process.env.STAGE;

        if (!stage) {
            throw new Error("Missing required environmental variable: STAGE.");
        }

        const buckets = this.getBuckets(stage);

        try {
            return buckets[bucketKey];
        } catch (error) {
            throw new Error(`Unable to retrieve the bucketkey: ${error}`);
        }
    }

    private hasNonExpiredValue(expirationTimestamp: number | null) {
        const expirationDate = expirationTimestamp !== null ? new Date(expirationTimestamp * 1000) : new Date("2000-01-01T00:00:00Z");
        return Date.now() < expirationDate.getTime() - 10_000; // 10 seconds buffer 
    }

    private async getAuthorization() {
        const baseUrl = process.env.B2_BASE_URL;
        const applicationKey = process.env.B2_APPLICATION_KEY;
        const applicationKeyId = process.env.B2_KEY_ID;

        if (!applicationKey || !applicationKeyId || !baseUrl) {
            throw new Error("Missing required environmental variable: B2_BASE_URL, B2_APPLICATION_KEY, or B2_KEY_ID.");
        }

        const expirationTimestamp = this.authorization ? this.authorization.applicationKeyExpirationTimestamp : null ;
        if (this.hasNonExpiredValue(expirationTimestamp)) return this.authorization!;

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
                throw new Error(`Failed b2_authorize_account: HTTP ${response.status} ${response.statusText}`);
            }

            this.authorization = await response.json();
            LOGGER.info(`b2_authorize_account request.`);

            return this.authorization!;
        } catch (error) {
            LOGGER.error(`Failed b2_authorize_account call.`);
            throw error;
        }
    }

    private async getUploadUrl(bucket: Bucket) {
        const expirationTimestamp = this.bucketUploadUrls.has(bucket) ? this.bucketUploadUrls.get(bucket)?.authorizationTokenExpirationTimestamp! : null;
        if (this.hasNonExpiredValue(expirationTimestamp)) return this.bucketUploadUrls.get(bucket)!;

        // Retrieve the account authorization response
        const authorization = await this.getAuthorization();

        try {
            const url = `${authorization.apiInfo.storageApi.apiUrl}/b2api/v4/b2_get_upload_url?bucketId=${bucket.id}`;
            const headers = {
                Authorization: authorization.authorizationToken,
            };

            const response = await fetch(url, {
                method: "GET",
                headers: headers,
            });

            if (!response.ok) {
                throw new Error(`Failed b2_get_upload_url: HTTP ${response.status} ${response.statusText}`);
            }

            const uploadUrl = await response.json();
            // this.uploadUrl["authorizationTokenExpirationTimestamp"] = Date.now() / 1000;
            this.bucketUploadUrls.set(bucket, uploadUrl);
            LOGGER.info(`b2_get_upload_url request.`);

            return this.bucketUploadUrls.get(bucket)!;
        } catch (error) {
            LOGGER.error(`Failed b2_get_upload_url call.`);
            throw error;
        }
    }

    async uploadFile(file: File) {
        if (!file.content) {
            throw new Error("Unable to upload file with empty content.")
        }

        const uploadUrl = await this.getUploadUrl(file.bucket);

        try {
            const sha1 = crypto.createHash("sha1").update(file.content).digest("hex");
            const stream = Readable.from(file.content);

            const url = uploadUrl.uploadUrl;
            const headers = {
                Authorization: uploadUrl.authorizationToken,
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
                throw new Error(`Failed b2_upload_file: HTTP ${response.status} ${response.statusText}`);
            }

            const uploadFile: { fileId: string } = await response.json();
            LOGGER.info("b2_upload_file request.");

            if (file.bucket.isPublic) {
                const publicUrl: string = `https://f${file.bucket.region.match(/\d{3}/)![0]}.backblazeb2.com/file/${file.bucket.name}/${file.key}`;
                file["publicUrl"] = publicUrl;
            }
            
            file["id"] = uploadFile.fileId;

            return;
        } catch (error) {
            LOGGER.error(`Failed b2_upload_file call.`);
            throw error;
        }
    }

    async fileExists(file: File) {
        const authorization = await this.getAuthorization();

        try {
            const url: string = `${authorization.apiInfo.storageApi.apiUrl}/b2api/v4/b2_get_file_info?fileId=${file.id}`;
            const headers = {
                Authorization: authorization.authorizationToken,
            };

            const response = await fetch(url, {
                headers: headers,
            });

            if (!response.ok && response.status !== 400) {
                throw new Error(`Failed b2_get_file_info: HTTP ${response.status} ${response.statusText}`);
            }

            (await response.json());
            LOGGER.info("b2_get_file_info request.");

            return response.ok;
        } catch (error) {
            LOGGER.error(`Failed b2_get_file_info call.`);
            throw error;
        }
    }

    async deleteFile(file: File) {
        const authorization = await this.getAuthorization();

        try {
            const url: string = `${authorization.apiInfo.storageApi.apiUrl}/b2api/v2/b2_delete_file_version`;
            const headers = {
                Authorization: authorization.authorizationToken,
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
                throw new Error(`Failed b2_delete_file_version: HTTP ${response.status} ${response.statusText}`);
            }

            (await response.json());
            LOGGER.info("b2_delete_file_version request.");

            file["id"] = undefined;
            return;
        } catch (error) {
            LOGGER.error(`Failed b2_delete_file_version call.`);
            throw error;
        }
    }

    async listFiles(bucket: Bucket, prefix: string = "") {
        const authResponse = await this.getAuthorization();

        try {
            let startFileName: string | null = "";
            let files: File[] = [];

            while (startFileName !== null) {
                const url: string = `${authResponse.apiInfo.storageApi.apiUrl}/b2api/v4/b2_list_file_names?bucketId=${bucket.id}${prefix ? `&prefix=${prefix}` : ""}${startFileName ? `&startFileName=${startFileName}` : ""}`;
                const headers = {
                    Authorization: authResponse.authorizationToken,
                };

                const response = await fetch(url, {
                    method: "GET",
                    headers: headers,
                });

                if (!response.ok) {
                    throw new Error(`Failed b2_list_file_names: HTTP ${response.status} ${response.statusText}`);
                }

                const filesList: { 
                    files: { fileName: string, contentType: string, fileId: string }[];
                    nextFileName: string 
                } = await response.json();

                const path = prefix.substring(0, prefix.lastIndexOf("/") + 1);
                for (const _file of filesList.files) {
                    const key = _file.fileName;
                    const fileName = key.replace(path, "");

                    const isFile = !/\//.test(fileName);

                    const contentType = _file.contentType as S3ContentType;

                    if (isFile) {
                    const file = File.fromPlain({
                        key,
                        name: fileName,
                        bucket: bucket.key,
                        id: _file.fileId,
                        contentType
                    });

                    files.push(file);
                    }
                }
                startFileName = filesList.nextFileName;
            }

            LOGGER.info("b2_list_file_names request.");

            return files;
        } catch (error) {
            LOGGER.error(`Failed b2_list_file_names call.`);
            throw error;
        }
    }

    async downloadFile(file: File) {
        const authorization = await this.getAuthorization();

        try {
            const url = `${authorization.apiInfo.storageApi.downloadUrl}/b2api/v4/b2_download_file_by_id?fileId=${file.id}`;
            const headers = {
                Authorization: authorization.authorizationToken
            };

            const response = await fetch(url, {
                method: "GET",
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`Failed b2_download_file_by_id: HTTP ${response.status} ${response.statusText}`);
            }

            LOGGER.info("b2_download_file_by_id request.");

            file.content = Buffer.from(await response.arrayBuffer());

        } catch (error) {
            LOGGER.error(`Failed b2_download_file_by_id call.`);
            throw error;
        }
    }
}

export const storage = new StorageClient();
