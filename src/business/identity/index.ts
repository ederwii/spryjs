import { IIdentity } from "../../";
import ServiceBase from "../base/service-base";

export default class IdentityService extends ServiceBase<IIdentity> {
  constructor(private bcrypt: any, private jwt: any, private TOKEN_SECRET: string, private SALT: string, private EXPIRES_IN: number, USER: any) {
    super(USER, 'username');
  }

  private userMappedFields: string[] = [];

  MapUserField(field: string) {
    this.userMappedFields.push(field);
  }

  async Create(payload: any): Promise<string> {
    const existing = await this.GetFirst({ username: payload.username });
    if (!existing) {
      payload.password = await this.GeneratePassword(payload.password);
      return await super.Create(payload);
    } else throw new TypeError("User already registered");
  }

  /**
   * Attempts to login with username and password
   * @param username 
   * @param password 
   * @returns JWT (bearer token)
   */
  async DoLogin(username: string, password: string): Promise<string> {
    return new Promise((res, rej) => {
      this.GetFirst({ username }).then(async (validUser: any) => {
        if (!validUser) {
          rej();
        } else {
          const validPass = await this.bcrypt.compare(
            password,
            validUser.password
          );
          if (validUser.isLocked) {
            rej();
          }
          else if (!validPass) {
            if (validUser.failedAttempts === undefined)
              validUser.failedAttempts = 0;
            validUser.failedAttempts++;
            if (validUser.failedAttempts == 5) {
              validUser.isLocked = true;
            }
            validUser.save();
            rej();
          } else {
            let info: any = {
              id: validUser._id,
              claims: validUser.claims
            };
            this.userMappedFields.forEach(mf => {
              validUser[mf] && (info[mf] = validUser[mf])
            })
            let token = this.jwt.sign(info, this.TOKEN_SECRET, {
              expiresIn: this.EXPIRES_IN
            });
            validUser.failedAttempts = 0;
            validUser.lastSignIn = new Date();
            validUser.save();
            res(token)
          }
        }
      })

    })
  }

  /**
   * Generates a encrypted password 
   * @param password Password to be encrypted
   * @returns Encrypted password
   */
  GeneratePassword = async (password: string) => {
    await this.bcrypt.genSalt(10).then((result: any) => (this.SALT = result));
    return await this.bcrypt.hash(password, this.SALT);
  };

  /**
   * Attempts to change user password
   * @param userId - User Identifier to be updated
   * @param password - Old Password
   * @param newPassword - New Password
   * @returns true if modified, otherwise false
   */
  ChangePassword = async (userId: string, oldPassword: string, newPassword: string) => {
    const validUser = await this.GetById(userId);
    if (!validUser) {
      return Promise.reject('Invalid data');
    } else {
      const validPass = await this.bcrypt.compare(
        oldPassword,
        validUser.password
      );
      if (!validPass) {
        return Promise.reject('Invalid password');
      }
      return new Promise((res, rej) => {
        this.GeneratePassword(newPassword).then((cnewPassword) => {
          this.Update(userId, { password: cnewPassword }).then(() => {
            res(true);
          }).catch((err) => rej(err));
        })
      })
    }
  };
}
