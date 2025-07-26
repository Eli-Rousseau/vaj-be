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
};

// Define global variables
let authResponse: AccountAuthorizationUrlResponse | null;

export const getAccountAuthorization = async function (): Promise<
  AccountAuthorizationUrlResponse | null | undefined
> {
  // Check whether an authResponse is already defined
  if (authResponse) {
    const expirationSeconds = authResponse.applicationKeyExpirationTimestamp;
    const expirationDate =
      expirationSeconds != null
        ? new Date(expirationSeconds * 1000)
        : new Date("5000-01-01T00:00:00Z");
    if (Date.now() < expirationDate.getTime()) {
      return authResponse;
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

    authResponse = await response.json();
    Logger.info(`Succeeded b2_authorize_account request.`);
  } catch (error) {
    Logger.error(`Failed b2_authorize_account request: ${error}.`);
    return;
  }

  return authResponse;
};

export const uploadFile = async function () {
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
  const authorizationResponse = await getAccountAuthorization();
  if (!authorizationResponse) {
    throw Error("Unable to retrieve account authorization.");
  }

  // Peform b2_get_upload_url request
  let uploadUrlResponse: UploadUrlResponse;
  try {
    const url: string = `${baseUrl}/b2api/v4/b2_get_upload_url?bucketId=${bucketId}`;
    const headers = {
      Authorization: authorizationResponse.authorizationToken,
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

    uploadUrlResponse = await response.json();
  } catch (error) {
    Logger.error(`Failed b2_get_upload_url request: ${error}.`);
    return;
  }

  return uploadUrlResponse;
};

export const fileExists = async function () {};

export const deleteFile = async function () {};
