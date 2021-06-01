import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import state from "../store";

/**
 * Request handler for non-protected endpoints
 * @param _req Request object
 * @param _res Response object
 * @param next Next function
 */
export const doRequest = (_req: Request, _res: Response, next: NextFunction) => {
  next();
}

/**
 * Request handler for protected endpoints
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export const doPrivateRequest = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.sendStatus(401);
  } else {
    tokenCheckMap(req).then(() => next()).catch((_err) => res.sendStatus(403));
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

/**
 * Verify if auth-token header exists. If so, the token will be decoded and 
 * assigned to req.body.user
 * @param req 
 */
export const tokenCheckMap = (req: Request): Promise<void> => {
  return new Promise((res, rej) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) res();
    const token = authHeader && authHeader.split(' ')[1];
    token && jwt.verify(token, state.tokenSecret, (err: any, user: any) => {
      if (err) {
        rej(err);
      }
      req.body.user = user;
      res();
    });
  })
}