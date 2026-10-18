import { AbstractGraphQLClient } from "@/src/core/sdk/graphql";

import VAJClient from "@/src/core/sdk/vaj";

export class GraphQLClient extends AbstractGraphQLClient {
    protected async findAuthorization(): Promise<string> {
        const vajClient = await VAJClient.withAPIUserAuth();
        return (await vajClient.auth.connect())?.accessToken || "";
    }
}