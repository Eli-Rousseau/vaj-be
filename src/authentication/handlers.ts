import { ServerRequest, ServerResponse } from "../api/server";

import { registerUser } from "./register";
import { handleAPIError } from "../api/error-classes";
import { loginUser } from "./login";
import { refreshToken } from "./refresh";

export async function handleInternalRegister(
  req: ServerRequest, 
  res: ServerResponse
) {
  try {
    const result = await registerUser({
      user: req.body?.user,
      jwtSecret: process.env.JWT_SECRET as string
    });

    res.status(201).json({ 
      "accessToken": result.accessToken,
      "refreshToken": `${result.refreshToken!.reference}.${result.refreshToken.tokenHash}`
    });
  } catch (error) {
    handleAPIError(res, error);
  }
}

export async function handleInternalLogin(
  req: ServerRequest,
  res: ServerResponse
) {
  try {
    const result = await loginUser({
      user: req.body?.user,
      jwtSecret: process.env.JWT_SECRET as string
    });

    res.status(201).json({ 
      "accessToken": result.accessToken,
      "refreshToken": `${result.refreshToken!.reference}.${result.refreshToken.tokenHash}`
    });
  } catch (error) {
    handleAPIError(res, error);
  }
}

export async function handleRefreshToken(
  req: ServerRequest,
  res: ServerResponse
) {
  try {
    const result = await refreshToken({
      tokenReferenceAndHash: req.body?.refreshToken,
      jwtSecret: process.env.JWT_SECRET as string
    });

    res.status(201).json({
      "accessToken": result.accessToken,
      "refreshToken": `${result.refreshToken!.reference}.${result.refreshToken.tokenHash}`
    })
  } catch (error) {
    handleAPIError(res, error);
  }
}