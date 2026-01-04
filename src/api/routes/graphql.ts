import { Router } from "express";
import { createYoga } from "graphql-yoga";
import { createSchema } from "graphql-yoga";

import { buildSchemaOptions } from "../../database/schema/options";

async function getGraphQlRouter() {
    const options = await buildSchemaOptions();
    const schema = createSchema(options);
    const yoga = createYoga({ schema });

    const router = Router();
    router.use(yoga);

    return router;
}

export default getGraphQlRouter;
