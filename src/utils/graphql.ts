import path from "path";
import { logger } from "./logger";

const LOGGER = logger.get({
    source: "utils",
    module: path.basename(__filename)
});

type GraphQLParams = {
    query: string,
    variables?: any
}

class GraphQLClient {

    async execute(params: GraphQLParams) {
        const baseUrl = process.env.APPLICATION_URL;

        if (!baseUrl) {
            throw new Error("Missing required environmental variable: APPLICATION_URL.");
        }

        const query = params.query.trim();
        const variables = params?.variables ? params.variables : {};

        const url = `${baseUrl}/api/graphql`;
        
        try {
            const response = await fetch(url,{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, variables })
            })

            if (!response.ok) {
                const text = await response.text();
                let errorsStr = text;

                const body = JSON.parse(text);
                if (body.errors) {
                    errorsStr = body.errors.map((e: any) => JSON.stringify(e, null, 2)).join("\n");
                }

                throw new Error(`Failed GraphQL request: HTTP ${response.status} ${response.statusText}\n${errorsStr}`);
            }

            const body = await response.json();
            LOGGER.info(`Suceeded graphql request.`);

            return body["data"]["result"];
        } catch (error) {
            LOGGER.error("Failed graphql query.", query, variables);
            throw error;
        }
    }
}

export const graphql = new GraphQLClient();