import User, { IUser } from "../data/identity.model";
import BaseService from "../base/base.service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default class UserService extends BaseService {
  constructor(private TOKEN_SECRET: string, private SALT: string, private EXPIRES_IN: number) {
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
            let token = jwt.sign(info, this.TOKEN_SECRET, {
              expiresIn: this.EXPIRES_IN
            });

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

  generatePassword = async (password: string) => {
    await bcrypt.genSalt(10).then((result) => (this.SALT = result));
    return await bcrypt.hash(password, this.SALT);
  };

  ChangePassword = async (user: any, password: string, newPassword: string) => {
    const validUser = await User.findById(user._id);
    if (!validUser) {
      return false;
    } else {
      const validPass = await bcrypt.compare(
        password,
        validUser.password
      );
      if (!validPass) {
        false;
      } else {
        validUser.password = await this.generatePassword(newPassword);
        validUser.save().then((result) => {
          if (result) {
            return true;
          } else {
            return false;
          }
        });
      }
    }
  };
}
