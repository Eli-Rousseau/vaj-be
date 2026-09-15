import { NextFunction, Request, Response } from "express";

import { withHandler } from "@/src/be/api/wrapper";
import * as main from "@/src/be/api/service/file"

export async function handleGet(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    async (req, res, next, context) => {
      const { content, contentType, fileName } = await main.get({
        sequentialId: Number(req.params.sequentialId),
      });

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Length", content.length);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${fileName}"`,
      );

      res.send(content);
    },
  );
}

export async function handleUpload(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    async (req, res, next, context) => {
      const request = new globalThis.Request(
        `http://${req.headers.host}${req.originalUrl}`,
        {
          method: req.method,
          headers: req.headers as HeadersInit,
          body: req as unknown as BodyInit,
          // @ts-expect-error: 'duplex' is a Node.js-specific option
          duplex: "half",
        },
      );

      const formData = await request.formData();

      const file = formData.get("file");

      const result = await main.upload({ 
        file: file as File
      });

      res.status(201).json(result);
    },
  );
}

export async function handleDelete(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    async (req, res, next, context) => {
      const { file } = await main.delete({
        sequentialId: Number(req.params.sequentialId)
      });

      res.status(201).send();
    },
  );
}