import { ShopUser } from "../database/classes/transformer-classes";
import { graphql } from "../utils/graphql";

export async function findUsersByEmail(email: string): Promise<ShopUser[]> {
  return await graphql.executeAndTransform(new ShopUser, {
    query: `
      query findUsersByEmail($email: JSON) {
        result: getShopUsers(
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
    const user = (await graphql.execute({
        query: `
mutation createUser($user: ShopUserMutationType!){
  result: insertShopUser(
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
            user: input
        }
    }))[0];

    return ShopUser.fromPlain(user);
}