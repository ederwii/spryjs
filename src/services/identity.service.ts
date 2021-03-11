import User, { IUser } from "../data/identity.model";
import BaseService from "../base/base.service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export default class UserService extends BaseService {
  constructor(private TOKEN_SECRET: string, private SALT: string) {
    super(User, "User", 'username');
  }

  async Create(payload: IUser): Promise<IUser> {
    const existingUser = await User.findOne({ username: payload.username });
    if (!existingUser) {
      payload.password = await this.generatePassword(payload.password);
      return await super.Create(payload);
    } else throw new TypeError("User already registered");
  }

  async DoLogin(username: string, password: string): Promise<string> {
    return new Promise((res, rej) => {
      User.findOne({ username }).then(async (validUser) => {
        if (!validUser) {
          rej();
        } else {
          const validPass = await bcrypt.compare(
            password,
            validUser.password
          );
          if (!validPass) {
            rej();
          } else {
            let info: any = {
              id: validUser._id
            };
            let token = jwt.sign(info, this.TOKEN_SECRET);

            let response: any;
            response = {
              token
            };
            res(token)
          }
        }
      })
      
   })
  }

  /**
 * Request handler for non-protected endpoints
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
  doRequest = (req: Request, res: Response, next: NextFunction) => {
    next();
  }

  /**
 * Request handler for protected endpoints
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
  doPrivateRequest = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.sendStatus(401);
    } else {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, this.TOKEN_SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
        req.body.user = user;
        next();
      });
    }
  }

  generatePassword = async (password: string) => {
    await bcrypt.genSalt(10).then((result) => (this.SALT = result));
    return await bcrypt.hash(password, this.SALT);
  };
}
