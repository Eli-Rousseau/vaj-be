import { ShopFile } from "@/src/be/database/classes/transformer-classes"
import { BadRequestError, ResourceNotFoundError } from "@/src/core/errors";
import * as gql from "@/src/be/api/service/file/gql";
import { File as B2File, B2Client } from "@/src/core/sdk/b2";

///////////
// TYPES //
///////////
type DeleteEvent = {
    sequentialId: number
}

type DeleteResult = {
    file: ShopFile;
}

//////////
// MAIN //
//////////
export async function delete_(event: DeleteEvent): Promise<DeleteResult> {
    const { sequentialId } = event;

    if (!sequentialId || typeof sequentialId !== "number") 
        throw new BadRequestError(`Invalid sequentialId: ${sequentialId}`);

    const file = await gql.getFileBySequentialId(sequentialId);
    if (!file)
        throw new ResourceNotFoundError(`No existing file with sequentialId: ${sequentialId}`);

    const b2File = B2File.fromPlain(file.toPlain());

    const b2Client = B2Client.withBaseB2Auth();
    const filesToDelete = await b2Client.listFiles(b2File.bucketObj!, b2File.key!);
    filesToDelete.forEach(async (_file) => (await b2Client.deleteFile(b2File)));

    await gql.deleteFile(file);

    return { file };
}