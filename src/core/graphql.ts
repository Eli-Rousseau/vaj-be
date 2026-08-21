import { logger } from "@/src/core/logger";
import { TransformerClass } from "@/src/be/database/classes/transformers";
import { AuthVAJ } from "@/src/be/api/auth";
import { HTTPError } from "./errors";

const LOGGER = logger.get();

type GraphQLParams = {
  query: string;
  variables?: any;
};

class GraphQLClient {
  private async findAuthorization(): Promise<string> {
    return (await AuthVAJ.connectAPIUser())?.accessToken || "";
  }

  async execute(params: GraphQLParams) {
    const baseUrl = process.env.APPLICATION_URL;

    if (!baseUrl) {
      throw new Error(
        "Missing required environmental variable: APPLICATION_URL.",
      );
    }

    const query = params.query.trim();
    const variables = params?.variables ? params.variables : {};

    const url = `${baseUrl}/api/v1/graphql`;
    const request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: await this.findAuthorization(),
      },
      body: JSON.stringify({ query, variables }),
    };

    LOGGER.request({url, request});
    const response = await fetch(url, request);
    LOGGER.response({response});

    if (!response.ok) {
      const text = await response.text();
      let errorsStr = text;

      const body = JSON.parse(text);
      if (body.errors) {
        errorsStr = body.errors.map((e: any) => JSON.stringify(e)).join("\n");
      }

      throw new HTTPError(response.status, response.statusText);
    }

    const body = await response.json();

    if (body?.errors) {
      const errorsStr = body.errors
        .map((e: any) => JSON.stringify(e))
        .join("\n");
      
      throw new Error(
        `Failed GraphQL request: ${errorsStr}`,
      );
    }

    const result = body["data"][Object.keys(body["data"])[0]];
    return result;
  }

  async executeAndTransform<T extends typeof TransformerClass>(
    transformer: T,
    params: GraphQLParams,
  ): Promise<InstanceType<T>[]> {
    const result = await this.execute(params);
    return result.map((item: unknown) => transformer.fromPlain(item));
  }
}

export const graphql = new GraphQLClient();
