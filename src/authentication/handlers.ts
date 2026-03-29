import { Request, Response } from "express";

import { registerUser } from "./register";
import { BadRequestError, ConfigError, DatabaseError } from "../api/error-classes";

export async function handleInternalRegister(
  req: Request, 
  res: Response
) {
  try {
    const result = await registerUser({
      user: req.body?.user,
      jwtSecret: process.env.JWT_SECRET as string
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.STAGE === "prod",
      sameSite: "strict",
      path: "/auth/refreshToken",
      maxAge: 1000 * 60 * 60 * 24 * 7 // One week
    });

    res.status(201).json({ "accessToken": result }).end();
  } catch (error) {

    if (error instanceof ConfigError) {
      res.status(500).json({
        error: "Missing configuration",
        errorMessage: error.message,
      }).end();
    }

    else if (error instanceof BadRequestError) {
      res.status(400).json({
        error: "Invalid request",
        errorMessage: error.message,
      }).end();
    }

    else if (error instanceof TypeError) {
      res.status(500).json({
        error: "Type error",
        errorMessage: error.message,
      }).end();
    }

    else if (error instanceof DatabaseError) {
      res.status(500).json({
        error: "Failed query",
        errorMessage: error.message,
      }).end();
    }

    else {
      res.status(500).json({
        error: "Unknown error",
        errorMessage: `UNKNOWN_ERROR`,
      }).end();
    }
  }
}

export async function handleInternalLogin(
  req: Request,
  res: Response
) {
  try {
    
  } catch (error) {

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