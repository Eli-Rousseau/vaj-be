import { BadRequestError, ResourceNotFoundError } from "@/src/core/errors";
import { File as B2File, B2Client } from "@/src/core/sdk/b2";
import * as gql from "@/src/be/api/service/file/gql";

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

    const base = await gql.getFileBySequentialId(sequentialId);
    if (!base)
        throw new ResourceNotFoundError(`No existing file with sequentialId: ${sequentialId}`);

    const b2File = B2File.fromPlain(base.toPlain());
    const b2Client = B2Client.withBaseB2Auth();
    await b2Client.downloadFile(b2File);

    return {
        content: b2File.content!,
        contentType: b2File.contentType!.toString(),
        fileName: b2File.name!,
    };
}