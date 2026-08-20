import { expressjwt } from "express-jwt";

// req.auth is set by the express-jwt middleware
// contains req.auth.id, req.auth.iat, req.auth.exp
const requireAuth = expressjwt({
  secret: process.env.JWT_SECRET as string,
  algorithms: ["HS256"],
  // jwt is a cookie
  getToken: (req) => req.cookies?.jwt,
});

export { requireAuth };
