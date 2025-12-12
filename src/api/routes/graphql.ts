import { Router } from "express";
import { ruruHTML } from "ruru/server";
import { serveStatic } from "ruru/static";
import { buildSchema } from "../../database/schema";
import { createHandler } from 'graphql-http/lib/use/express';

async function getGraphQlRouter() {
    const schema = await buildSchema();
    const router = Router();

    router.post("/", createHandler({ schema }));

    router.get('/', (_req, res) => {
        res.type('html')
        res.end(ruruHTML({ endpoint: '/graphql' }))
    })

    return router;
}

export default getGraphQlRouter;
