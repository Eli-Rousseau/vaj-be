import { ShopUser } from "../database/classes/transformer-classes";
import { graphql } from "../utils/graphql";

export async function findUsersByEmail(email: string): Promise<ShopUser[]> {
  // @ts-ignore
  return await graphql.executeAndTransform(ShopUser, {
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
    // @ts-ignore
    const user = (await graphql.executeAndTransform(ShopUser, {
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
            user: input.toPlain()
        }
    }));

    return user;
}