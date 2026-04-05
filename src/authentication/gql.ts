import { ShopRefreshToken, ShopUser } from "../database/classes/transformer-classes";
import { graphql } from "../utils/graphql";
import { refreshToken } from "./refresh";

export async function findUsersByEmail(email: string) {
  return await graphql.executeAndTransform(ShopUser, {
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
    const user = (await graphql.executeAndTransform(ShopUser, {
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
            user: data.toPlain({ onlyMutables: true })
        }
    }))[0];

    return user;
}

export async function createRefreshToken(data: ShopRefreshToken) {
  const refreshToken = (await graphql.executeAndTransform(ShopRefreshToken, {
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
      refreshToken: data.toPlain({ onlyMutables: true })
    }
  }))[0];

  return refreshToken
}

export async function revokeRefreshTokens(data: ShopRefreshToken[]) {
  const refreshTokens = await graphql.executeAndTransform(ShopRefreshToken, {
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
      data: data.map(record => record.toPlain({ onlyMutables: true }))
    }
  });

  return refreshTokens;
}

export async function findRefreshTokenByReference(tokenReference: string) {
  const refreshToken = (await graphql.executeAndTransform(ShopRefreshToken, {
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
      reference: tokenReference
    }
  }))[0];

  return refreshToken;
}