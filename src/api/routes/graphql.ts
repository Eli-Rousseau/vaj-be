import { Router } from "express";
import { createYoga } from "graphql-yoga";

import { buildSchema } from "../../database/schema";

async function getGraphQlRouter() {
    const schema = await buildSchema();
    const yoga = createYoga({ schema });

    const router = Router();
    router.use(yoga);

    return router;
}

export default getGraphQlRouter;
