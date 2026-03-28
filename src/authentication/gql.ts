import { ShopUser } from "../database/classes/transformer-classes";
import { graphql } from "../utils/graphql";

export async function findUsersByEmail(email: string): Promise<ShopUser[]> {
  return await graphql.executeAndTransform(ShopUser, {
    query: `
query findUsersByEmail($email: JSON) {
  getShopUsers(
    where: {
      email: { eq: $email }
    }
  ) {
    reference
  }
}
    `,
    variables: { email },
  });
}

export async function createUser(input: ShopUser) {
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
            user: input.toPlain({ onlyMutables: true })
        }
    }))[0];

    return user;
}