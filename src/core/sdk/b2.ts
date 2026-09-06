import crypto from "crypto";
import { Readable } from "stream";
import { readFileSync } from "fs";
import { Exclude, Expose, Transform } from "class-transformer";

import { logger } from "@/src/core/logger";
import { findEnumsValue, S3ContentType } from "@/src/core/enums";
import { ShopFile } from "@/src/be/database/classes/transformer-classes";
import { HTTPError } from "@/src/core/errors";

const LOGGER = logger.get();

let baseB2Auth: B2Auth | null = null;
let baseB2Client: B2Client | null = null;

export class Bucket {
  key!: string;
  id!: string;
  name!: string;
  region!: string;
  endpoint!: string;
  isPublic!: boolean;

  constructor(init: {
    key: string;
    id: string;
    name: string;
    region: string;
    endpoint: string;
    isPublic: boolean;
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
  @Exclude({ toPlainOnly: true })
  @Expose()
  content: Buffer | null = null;

  @Transform(
    ({ value }) => {
      const contentType = findEnumsValue(value, S3ContentType);
      if (!contentType) {
        throw new Error(`Unrecognized S3ContentType: ${contentType}`);
      }
      return contentType;
    },
    { toClassOnly: true },
  )
  @Transform(
    ({ value }) => {
      return value;
    },
    { toPlainOnly: true },
  )
  @Expose()
  override contentType: S3ContentType | null = null;

  get bucketObj(): Bucket | null {
    const b2Client = B2Client.withBaseB2Auth();
    return this.bucket ? b2Client.getBucket(this.bucket) : null;
  }

  set bucketObj(value: Bucket | null) {
    this.bucket = value?.name ?? null;
  }
}

type B2AuthOptions = {};

type B2Token = {
    applicationKeyExpirationTimestamp: number;
    authorizationToken: string;
    apiInfo: B2TokenAPIInfo;
}

type B2TokenAPIInfo = {
    storageApi: B2TokenStorageApi;
}

type B2TokenStorageApi = {
    apiUrl: string; 
    downloadUrl: string;
}

class B2Auth {
    private readonly applicationUrl: string;
    private readonly applicationKey: string;
    private readonly applicationKeyId: string;
    private token: B2Token | null = null; 

    constructor(options?: B2AuthOptions) {
        const applicationUrl = process.env.B2_BASE_URL;
        const applicationKey = process.env.B2_APPLICATION_KEY;
        const applicationKeyId = process.env.B2_KEY_ID;
        if (!applicationKey || !applicationKeyId || !applicationUrl) {
            throw new Error(
                "Missing required environmental variable: B2_BASE_URL, B2_APPLICATION_KEY, or B2_KEY_ID.",
            );
        }
        this.applicationUrl = applicationUrl;
        this.applicationKey = applicationKey;
        this.applicationKeyId = applicationKeyId;
    }

    private async authorize() {
        const url = `${this.applicationUrl}/b2api/v4/b2_authorize_account`;
        const authHeader = "Basic " + Buffer.from(`${this.applicationKeyId}:${this.applicationKey}`).toString("base64");
        const request = {
            method: "GET",
            headers: { Authorization: authHeader }
        }

        LOGGER.request({ url, request});
        const response = await fetch(url, request);
        LOGGER.response({ response });

        if (!response.ok) {
            throw new HTTPError(response.status, response.statusText);
        }

        this.token = (await response.json());
        return this.token!;
    }

    private tokenIsValid() {
        const expirationTimestamp = this.token?.applicationKeyExpirationTimestamp;
        const expirationDate = (expirationTimestamp)
            ? new Date(expirationTimestamp * 1000)
            : new Date("2000-01-01T00:00:00Z");
        return Date.now() < expirationDate.getTime() - 10_000; // 10 seconds buffer
    }

    async connect() {
        if (!this.tokenIsValid()) return (await this.authorize());
        else return this.token!;
    }
}

type B2ClientOptions = {
    auth?: B2Auth;
};

type B2ClientBucketUploadUrl = {
    authorizationTokenExpirationTimestamp: number;
    authorizationToken: string;
    uploadUrl: string;
}

export class B2Client {
    auth: B2Auth;
    private buckets: Record<string, Bucket>;
    private bucketUploadUrls: Map<Bucket, B2ClientBucketUploadUrl>;

    constructor(options?: B2ClientOptions) {
        const stage = process.env.STAGE;
        if (!stage) throw new Error("Missing required environmental variable: STAGE.");

        const auth = options?.auth;
        if (auth && auth instanceof B2Auth) this.auth = auth;
        else this.auth = new B2Auth();

        const filePath = `${process.cwd()}/src/core/buckets-config.json`;
        const config = JSON.parse(readFileSync(filePath, { encoding: "utf-8" }))[stage];
        const buckets = Object.fromEntries(
            Object.entries(config).map(([key, value]: [string, any]) => {
                const bucket = new Bucket({
                    key: value.key,
                    id: value.id,
                    name: value.name,
                    region: value.region,
                    endpoint: value.endpoint,
                    isPublic: value.isPublic,
                });
                return [key, bucket]
            })
        )
        this.buckets = buckets;

        this.bucketUploadUrls = new Map();
    }

    getBucket(bucketKey: string) {
        return this.buckets[bucketKey]
    }

    private async getBucketUploadUrl(bucket: Bucket) {

        function uploadUrlIsValid(bucketUploadUrl: B2ClientBucketUploadUrl) {
            const expirationTimestamp = bucketUploadUrl?.authorizationTokenExpirationTimestamp || 0;
            return Date.now() < expirationTimestamp - 10_000; // 10 seconds buffer
        }

        let bucketUploadUrl = this.bucketUploadUrls.get(bucket);
        if (bucketUploadUrl && uploadUrlIsValid(bucketUploadUrl)) return bucketUploadUrl;
        
        const url = `${((await this.auth.connect()).apiInfo.storageApi.apiUrl)}/b2api/v4/b2_get_upload_url?bucketId=${bucket.id}`;
        const request = { 
            method: "GET",
            headers: { 
                Authorization: (await this.auth.connect()).authorizationToken 
            }
        };

        LOGGER.request({url, request});
        const response = await fetch(url, request);
        LOGGER.response({ response });

        if (!response.ok) throw new HTTPError(response.status, response.statusText);

        bucketUploadUrl = await response.json();
        this.bucketUploadUrls.set(bucket, bucketUploadUrl!);

        return bucketUploadUrl;
    }

    async uploadFile(file: File) {
        if (!file.content) throw Error("Unable upload file without content");

        const bucketUploadUrl = await this.getBucketUploadUrl(file.bucketObj!);

        const url = bucketUploadUrl!.uploadUrl;
        const sha1 = crypto.createHash("sha1").update(file.content).digest("hex");
        const stream = Readable.from(file.content);
        const request = {
            method: "POST",
            headers: {
                Authorization: bucketUploadUrl!.authorizationToken,
                "X-Bz-File-Name": encodeURIComponent(file.key!),
                "Content-Type": file.contentType!,
                "Content-Length": file.content.length.toString(),
                "X-Bz-Content-Sha1": sha1,
                "X-Bz-Server-Side-Encryption": "AES256",
            },
            body: stream as unknown as BodyInit,
            duplex: "half"
        }

        LOGGER.request({url, request});
        const response = await fetch(url, request);
        LOGGER.response({response});

        if (!response.ok) throw new HTTPError(response.status, response.statusText);

        const upload: { fileId: string } = await response.json();

        if (file.bucketObj!.isPublic) {
            const publicUrl: string = `https://f${file.bucketObj!.region.match(/\d{3}/)![0]}.backblazeb2.com/file/${file.bucketObj!.name}/${file.key}`;
            file["publicUrl"] = publicUrl;
        }
        file["id"] = upload.fileId;
    }

    async fileExists(file: File) {
        const url = `${(await this.auth.connect()).apiInfo.storageApi.apiUrl}/b2api/v4/b2_get_file_info?fileId=${file.id}`;
        const request = {
            method: "GET",
            headers: {
                Authorization: (await this.auth.connect()).authorizationToken
            }
        }

        LOGGER.request({url, request});
        const response = await fetch(url, request);
        LOGGER.response({response});

        return response.ok;
    }

    async deleteFile(file: File) {
        const url: string = `${(await this.auth.connect()).apiInfo.storageApi.apiUrl}/b2api/v2/b2_delete_file_version`;
        const request = {
            method: "POST",
            headers: {
                Authorization: (await this.auth.connect()).authorizationToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fileName: file.key,
                fileId: file.id
            })            
        }

        LOGGER.request({url, request});
        const response = await fetch(url, request);
        LOGGER.response({response});

        if (!response.ok) throw new HTTPError(response.status, response.statusText);

        await response.json();
        file["id"] = null;
    }

    async downloadFile(file: File) {
        const url = `${(await this.auth.connect()).apiInfo.storageApi.downloadUrl}/b2api/v4/b2_download_file_by_id?fileId=${file.id}`;
        const request = {
            method: "GET",
            headers : {
                Authorization: (await this.auth.connect()).authorizationToken,
            }
        }
        
        LOGGER.request({url, request});
        const response = await fetch(url, request);
        LOGGER.response({response});

        if (!response.ok) throw new HTTPError(response.status, response.statusText);

        return Buffer.from(await response.arrayBuffer());
    }

    async listFiles(bucket: Bucket, prefix?: string) {

        prefix = prefix || "";
        let startFileName: string | null = "";
        const files: File[] = [];

        while (startFileName !== null) {
            const url: string = `${(await this.auth.connect()).apiInfo.storageApi.apiUrl}/b2api/v4/b2_list_file_names?bucketId=${bucket.id}${prefix ? `&prefix=${prefix}` : ""}${startFileName ? `&startFileName=${startFileName}` : ""}`;
            const request = {
                method: "GET",
                headers: {
                    Authorization: (await this.auth.connect()).authorizationToken
                }
            }

            LOGGER.request({url, request});
            const response = await fetch(url, request);
            LOGGER.response({response});

            if (!response.ok) throw new HTTPError(response.status, response.statusText);

            const filesList: {
            files: { fileName: string; contentType: string; fileId: string }[];
            nextFileName: string;
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
                        contentType,
                    });

                    files.push(file);
                }
            }
            startFileName = filesList.nextFileName;
        }

        return files;
    }

    static withBaseB2Auth() {
        if (baseB2Client) return baseB2Client

        const auth = new B2Auth();
        baseB2Auth = auth;

        const client = new B2Client({auth});
        baseB2Client = client;

        return baseB2Client!;
    }
}