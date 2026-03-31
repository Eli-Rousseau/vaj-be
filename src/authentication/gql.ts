import { ShopRefreshToken, ShopUser } from "../database/classes/transformer-classes";
import { graphql } from "../utils/graphql";

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