import { BadRequestError } from "@/core/errors";
import { File as B2File, B2Client } from "@/be/sdks/b2";
import * as gql from "@/be/api/service/file/gql";
import { ShopFile } from "@/be/database/classes/transformer-classes";
import { findEnumsValue, S3ContentType } from "@/core/enums";
import { RedisClient } from "@/be/sdks/redis";

//////////
// VARS //
//////////
const FILE_SIZE_LIMIT = 1024 * 1024 * 50 // 50GB

///////////
// TYPES //
///////////
type UploadEvent = {
    file: File
}

type UploadResult = {
    file: ShopFile
}

/////////////
// HELPERS //
/////////////
function sanitizeFileName(fileName: string) {
    return (fileName || "").replace(/[^\w\-. ]/, "");
}

function isValidFileName(fileName: string) {
    return fileName ? /^[\w\-. ]+\.[\dA-Za-z]+$/.test(fileName) : false;
}

//////////
// MAIN //
//////////
export async function upload(event: UploadEvent): Promise<UploadResult> {
    const { file: requestFile } = event;

    if (!(requestFile instanceof globalThis.File)) 
        throw new BadRequestError("Missing file.");
    if (!requestFile.size) 
        throw new BadRequestError("Uploaded file is empty.");
    if (requestFile.size > FILE_SIZE_LIMIT)
        throw new BadRequestError(`File of ${requestFile.size} bytes exceeds max limit of ${FILE_SIZE_LIMIT} bytes.`);

    const fileName = sanitizeFileName(requestFile.name);
    const fileContentType = requestFile.type;
    const fileContent = Buffer.from(await requestFile.arrayBuffer());

    if (!fileContent) 
        throw new BadRequestError("Missing file content.");
    if (!fileContentType) 
        throw new BadRequestError("Missing file content type.");
    if (!findEnumsValue(fileContentType, S3ContentType)) 
        throw new BadRequestError(`Unrecognized content type: ${fileContentType}`)
    if (!fileName) 
        throw new BadRequestError("Missing file name.");
    if (!isValidFileName(fileName))
        throw new BadRequestError(`Invalid file name "${fileName}"`);

    const b2Client = B2Client.withBaseB2Auth();
    const bucket = b2Client.getBucket("private");
    const key = `file/upload/${fileName}`;
    const upload = B2File.fromPlain({
        bucket: bucket!.key,
        key,
        name: fileName,
        content: fileContent,
        contentType: fileContentType
    })
    await b2Client.uploadFile(upload);

    const resultFile =  await gql.createFile(upload);

    const redisClient = RedisClient.withDefaultPool();
    await redisClient.set(
        `file-upload:${resultFile.sequentialId!}`,
        upload.content,
        {
            expirationInSeconds: 86_400, // 1 day
            saveBuffer: true
        }
    )

    return { file: resultFile }
}