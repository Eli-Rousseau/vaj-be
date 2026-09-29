import { BadRequestError, ResourceNotFoundError } from "@/src/core/errors";
import { File as B2File, B2Client } from "@/src/core/sdk/b2";
import * as gql from "@/src/be/api/service/file/gql";
import { redisClient } from "@/src/core/cache";

///////////
// TYPES //
///////////
type GetEvent = {
    sequentialId: number;
}

type GetResult = {
    content: Buffer;
    contentType: string;
    fileName: string;
}

//////////
// MAIN //
//////////
export async function get(event: GetEvent): Promise<GetResult> {
    const { sequentialId } = event;

    if (!sequentialId || typeof sequentialId !== "number") 
        throw new BadRequestError(`Invalid sequentialId: ${sequentialId}`);

    const file = await gql.getFileBySequentialId(sequentialId);
    if (!file)
        throw new ResourceNotFoundError(`No existing file with sequentialId: ${sequentialId}`);
    
    const contentType = file.contentType!.toString();
    const fileName = file.name!;

    const cachedFile = await redisClient.get(
        `file-upload:${sequentialId!}`,
        {
            returnBuffer: true
        }
    )

    let content;
    if (cachedFile) {
        content = cachedFile;

    } else {
        const b2File = B2File.fromPlain(file.toPlain());
        const b2Client = B2Client.withBaseB2Auth();
        await b2Client.downloadFile(b2File);
        content = b2File.content;

        await redisClient.set(
            `file-upload:${sequentialId}`,
            content,
            {
                expirationInSeconds: 86_400, // 1 day
                saveBuffer: true
            }
        )
    }

    return {
        content,
        contentType,
        fileName,
    };
}