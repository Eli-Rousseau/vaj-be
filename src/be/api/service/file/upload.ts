import { B2Error, BadRequestError, DatabaseError } from "@/src/core/errors";
import { File, B2Client, S3ContentType } from "@/src/core/sdk/b2";
import * as gql from "@/src/be/api/service/file/gql";
import { ShopFile } from "@/src/be/database/classes/transformer-classes";

///////////
// TYPES //
///////////
type UploadEvent = {
    fileContent: Buffer;
    fileContentType: string;
    fileName: string;
}

type UploadResult = {
    file: ShopFile
}

/////////////
// HELPERS //
/////////////
export function randomString(length: number = 10) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    
    for (let i = 0; i < length; i++) {
        const randomInd = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomInd);
    }
    return result;
}

//////////
// MAIN //
//////////
export async function upload(event: UploadEvent): Promise<UploadResult> {
    const { fileContent, fileContentType } = event;
    let fileName = event.fileName

    if (!fileContent) throw new BadRequestError("Missing file content.");
    if (!fileContentType) throw new BadRequestError("Missing file content type.");
    if (!fileName) fileName = randomString();

    const b2Client = B2Client.withBaseB2Auth();
    const bucket = b2Client.getBucket("public");
    const key = `file/upload/${fileName}`;
    const upload = File.fromPlain({
        bucket: bucket!.key,
        key,
        name: fileName,
        content: fileContent,
        contentType: fileContentType
    })
    try {
        await b2Client.uploadFile(upload);
    } catch (error) {
        throw new B2Error(`UPLOAD_FILE_FAILED: ${error}`);
    }

    let file;
    try {
        file =  await gql.createFile(upload);
    } catch (error) {
        throw new DatabaseError(`CREATE_FILE_FAILED: ${error}`);
    }
    
    return { file }
}