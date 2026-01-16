import path from "path";
import getLogger from "./logger";

const logger = getLogger({
    source: "utils",
    module: path.basename(__filename)
});

/**
 * 
 * @description Can be used to request the graphql server with queries and variables.
 */
export const graphql = async function(query: string, variables?: any) {
    const basesUrl = process.env.APPLICATION_URL;

    if (!basesUrl) {
        throw Error("Missing required environmental variable: APPLICATION_URL.");
    }
    
    const url = `${basesUrl}/api/graphql`;
    
    const response = await fetch(url,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables })
    })

    if (!response.ok) {
        const text = await response.text();
        let errorsStr = text;

        try {
            const body = JSON.parse(text);
            if (body.errors) {
            errorsStr = body.errors.map((e: any) => JSON.stringify(e, null, 2)).join("\n");
            }
        } catch {
            // If not JSON, keep raw text
        }

        throw new Error(
            `Failed GraphQL request: HTTP ${response.status} ${response.statusText}\n${errorsStr}`
        );
        }

    const body = await response.json();
    logger.info(`Suceeded graphql request.`);

    return body;
}