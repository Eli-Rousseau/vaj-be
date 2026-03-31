import { Request, Response } from "express";

import { registerUser } from "./register";
import { handleAPIError } from "../api/error-classes";
import { loginUser } from "./login";

export async function handleInternalRegister(
  req: Request, 
  res: Response
) {
  try {
    const result = await registerUser({
      user: req.body?.user,
      jwtSecret: process.env.JWT_SECRET as string
    });

    const maxAge = result.refreshToken.expiresAt!.getTime() - Date.now();
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.STAGE === "prod",
      sameSite: "strict",
      path: "/auth/refreshToken",
      maxAge: maxAge
    });

    res.status(201).json({ "accessToken": result }).end();
  } catch (error) {
    handleAPIError(res, error);
  }
}

export async function handleInternalLogin(
  req: Request,
  res: Response
) {
  try {
    const result = await loginUser({
      user: req.body?.user,
      jwtSecret: process.env.JWT_SECRET as string
    });

    const maxAge = result.refreshToken.expiresAt!.getTime() - Date.now();
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.STAGE === "prod",
      sameSite: "strict",
      path: "/auth/refreshToken",
      maxAge: maxAge
    });

    res.status(201).json({ "accessToken": result }).end();
  } catch (error) {
    handleAPIError(res, error);
  }
}

export async function handleRefreshToken(
  req: Request,
  res: Response
) {
  try {
    
  } catch (error) {

  }
}