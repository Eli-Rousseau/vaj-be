import { AbstractGraphQLClient } from "@/core/sdk/graphql";

import VAJClient from "@/core/sdk/vaj";

export class GraphQLClient extends AbstractGraphQLClient {
    protected async findAuthorization(): Promise<string> {
        const vajClient = await VAJClient.withAPIUserAuth();
        return (await vajClient.auth.connect())?.accessToken || "";
    }
}