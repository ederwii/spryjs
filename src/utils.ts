import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import localService from "./services/local.service"

const service = localService.getInstance();

const TOKEN_SECRET = service.tokenSecret;

export const DoRequest = (req: Request, res: Response, next: NextFunction) => {
  next();
}
export const DoPrivateRequest = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).send();
  }
  try {
    const verified = jwt.verify(token, TOKEN_SECRET);
    if (verified) {
      next();
    } else {
      res.status(401).send();
    }
  } catch (error) {
    res.status(401).send();
  }
}

export const uuidv4 = () => {
  return "xx5xxxxx-xxxx-4xxx-yxxx-xxxxxxxxx5xx".replace(/[xy]/g, function (
    c
  ) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
