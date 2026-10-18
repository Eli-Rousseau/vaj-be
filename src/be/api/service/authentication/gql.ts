import {
  ShopRefreshToken,
  ShopUser,
} from "@/src/be/database/classes/transformer-classes";
import { GraphQLClient } from "@/src/be/sdks/graphql";

export async function findUsersByEmail(email: string) {
  const graphqlClient = new GraphQLClient();
  return await graphqlClient.executeAndTransform(ShopUser, {
    query: `
query findUsersByEmail($email: JSON) {
  getShopUsers(
    where: {
      email: { eq: $email }
    }
  ) {
    reference
    sequentialId
    name
    email
    password
    systemRole
    systemAuthentication
    nonRevokedRefreshTokens {
      reference
      sequentialId
      tokenHash
      user
      expiresAt
      revokedAt
      replacedBy
    }
  }
}
    `,
    variables: { email },
  });
}

export async function createUser(data: ShopUser) {
  const graphqlClient = new GraphQLClient();
  const user = (
    await graphqlClient.executeAndTransform(ShopUser, {
      query: `
mutation createUser($user: ShopUserMutationType!){
  insertShopUser(
    data: $user
  ) {
    reference
    sequentialId
    name
    email
    systemRole
    systemAuthentication
  }
}        
        `,
      variables: {
        user: data.toPlain({ onlyMutables: true }),
      },
    })
  )[0];

  return user;
}

export async function createRefreshToken(data: ShopRefreshToken) {
  const graphqlClient = new GraphQLClient();
  const refreshToken = (
    await graphqlClient.executeAndTransform(ShopRefreshToken, {
      query: `
mutation createRefreshToken($refreshToken: ShopRefreshTokenMutationType!) {
  insertShopRefreshToken(
    data: $refreshToken
  ) {
    reference
    sequentialId
    user
    expiresAt
    tokenHash
  }
}
    `,
      variables: {
        refreshToken: data.toPlain({ onlyMutables: true }),
      },
    })
  )[0];

  return refreshToken;
}

export async function revokeRefreshTokens(data: ShopRefreshToken[]) {
  const graphqlClient = new GraphQLClient();
  const refreshTokens = await graphqlClient.executeAndTransform(ShopRefreshToken, {
    query: `
mutation revokeRefreshToken($data: [ShopRefreshTokenMutationType!]!) {
  updateShopRefreshTokens(
    data: $data
    set: ["revokedAt", "replacedBy"]
  ) {
    reference
  }
}
    `,
    variables: {
      data: data.map((record) => record.toPlain({ onlyMutables: true })),
    },
  });

  return refreshTokens;
}

export async function findRefreshTokenByReference(tokenReference: string) {
  const graphqlClient = new GraphQLClient();
  const refreshToken = (
    await graphqlClient.executeAndTransform(ShopRefreshToken, {
      query: `
query getRefreshTokenByReference($reference: ID!) {
  getShopRefreshTokenByReference(
    reference: $reference
  ) {
    reference
    sequentialId
    tokenHash
    expiresAt
    revokedAt
    replacedBy
    userByReference {
      reference
      sequentialId
      email
      systemRole
      systemAuthentication
      nonRevokedRefreshTokens {
        reference
        sequentialId
        tokenHash
        expiresAt
        revokedAt
        replacedBy
      }
    }
  }
}
    `,
      variables: {
        reference: tokenReference,
      },
    })
  )[0];

  return refreshToken;
}
