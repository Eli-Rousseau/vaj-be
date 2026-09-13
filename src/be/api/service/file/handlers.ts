import { NextFunction, Request, Response } from "express";

import { withHandler } from "@/src/be/api/wrapper";
import * as main from "@/src/be/api/service/file"
import { BadRequestError } from "@/src/core/errors";
import { S3ContentType } from "@/src/core/sdk/b2";

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
        // req.params.sequentialId;
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

      if (!(file instanceof globalThis.File)) {
        throw new BadRequestError("Missing file.");
      }

      if (!file.size) {
        throw new BadRequestError("Uploaded file is empty.");
      }

      const fileContent = Buffer.from(await file.arrayBuffer());

      const result = await main.upload({
        fileContent,
        fileContentType: file.type as S3ContentType,
        fileName: file.name,
      });

      res.status(201).json(result);
    },
  );
}

export async function hanldeDelete(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  await withHandler(
    req,
    res,
    next,
    async (req, res, next, context) => {},
  );
}