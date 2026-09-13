import { graphql } from "@/src/core/graphql";
import { ShopFile } from "@/src/be/database/classes/transformer-classes";

export async function createFile(data: ShopFile) {
  const file = (
    await graphql.executeAndTransform(ShopFile, {
      query: `
mutation createRefreshToken($file: ShopFileMutationType!) {
  insertShopFile(
    data: $file
  ) {
    reference
    sequentialId
    key
    name
    bucket
    contentType
    isPublic
    publicUrl
    id
    createdAt
    updatedAt
    
  }
}
    `,
      variables: {
        file: data.toPlain({ onlyMutables: true }),
      },
    })
  )[0];

  return file;
}