import { type Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";

const generateToken = (res: Response, id: string) => {
  const payload = { id };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.ENVIRONMENT === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

const clearToken = (res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: process.env.ENVIRONMENT === "production",
    sameSite: "lax",
    maxAge: 0,
  });
};

export { generateToken, clearToken };
