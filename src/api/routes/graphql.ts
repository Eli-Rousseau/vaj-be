import { Router } from "express";
import { createYoga } from "graphql-yoga";

import { buildSchema } from "../../utils/database";

async function setupRouter() {
    const router = Router();

    const schema = await buildSchema();
    const yoga = createYoga({ schema });

    router.use('/', yoga);

    return router
}

export default setupRouter;
