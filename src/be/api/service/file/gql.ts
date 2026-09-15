import { graphql } from "@/src/core/graphql";
import { ShopFile } from "@/src/be/database/classes/transformer-classes";

export async function createFile(data: ShopFile) {
  const file = (
    await graphql.executeAndTransform(ShopFile, {
      query: `
mutation createRefreshToken($file: ShopFileMutationType!) {
  insertShopFile(
    data: $file
    onConflict:  {
       constraint: "fileBucketKeyKey"
       columns: ["id", "contentType", "isPublic", "publicUrl",]
    }
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

export async function getFileBySequentialId(sequentialId: number) {
  const file = (
    await graphql.executeAndTransform(ShopFile, {
      query: `
query getFileBySequentialId($sequentialId: JSON) {
  getShopFiles(
    where:  {
       sequentialId:  {
          eq: $sequentialId
       }
    }
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
        sequentialId
      }
    })
  )?.[0];

  return file;
}