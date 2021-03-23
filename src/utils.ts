import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import localService from "./services/local.service"

const service = localService.getInstance();

/** Token Secret string for JWT validation */
let TOKEN_SECRET = service.tokenSecret;

/**
 * Request handler for non-protected endpoints
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export const DoRequest = (req: Request, res: Response, next: NextFunction) => {
  next();
}

/**
 * Request handler for protected endpoints
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export const DoPrivateRequest = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.sendStatus(401);
  } else {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, service.tokenSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.body.user = user;
      next();
    });
  }
}

/**
 * Creates a new UUID v4 string
 * @returns {string} UUID v4 string
 */
export const uuidv4 = (): string => {
  return "xx5xxxxx-xxxx-4xxx-yxxx-xxxxxxxxx5xx".replace(/[xy]/g, function (
    c
  ) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


export const tokenCheckMap = (req: Request) => {
  const token = req.header("auth-token");
  if (token && token.length > 50) {
    const verified: any = jwt.verify(
      token ? token.toString() : "",
      TOKEN_SECRET
    );
    req.body._user = verified;
  }
}