import {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { UnauthorizedError } from "express-jwt";
import { Prisma } from "../generated/prisma/client.ts";

// Catch-all for unmatched routes so clients get the same JSON error envelope
// as everything else rather than Express's default HTML 404.
const notFound = (req: Request, res: Response) => {
  return res.status(404).json({ status: "error", message: "Not found" });
};

// Central error handler. Express 5 forwards rejected async handlers here, so a
// thrown Prisma or auth error becomes a JSON response instead of an HTML 500.
const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Missing, expired, or invalid JWT from express-jwt.
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Record required by update/delete was not found.
    if (err.code === "P2025") {
      return res.status(404).json({ status: "error", message: "Not found" });
    }

    // Unique constraint violation.
    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ status: "error", message: "That value is already in use" });
    }
  }

  // Anything else is unexpected: log the detail server-side, return a generic
  // message so implementation details aren't leaked to the client.
  console.error("Unhandled error:", err);

  return res
    .status(500)
    .json({ status: "error", message: "Something went wrong" });
};

export { notFound, errorHandler };
