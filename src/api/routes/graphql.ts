import { Router } from "express";
import { createYoga } from "graphql-yoga";

import { buildGraphQLSchema } from "../../graphql/build-schema";

async function getGraphQlRouter() {
    const schema = await buildGraphQLSchema();
    const yoga = createYoga({ schema });

    const router = Router();
    router.use(yoga);

    return router;
}

export default getGraphQlRouter;
