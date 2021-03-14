import BaseService from "../base/base.service";

export default class IdentityService extends BaseService {
  constructor(private bcrypt: any, private jwt: any, private TOKEN_SECRET: string, private SALT: string, private EXPIRES_IN: number, private USER: any) {
    super(USER, "User", 'username');
  }

  async Create(payload: any): Promise<any> {
    const existingUser = await this.USER.findOne({ username: payload.username });
    if (!existingUser) {
      payload.password = await this.generatePassword(payload.password);
      return await super.Create(payload);
    } else throw new TypeError("User already registered");
  }

  async DoLogin(username: string, password: string): Promise<string> {
    return new Promise((res, rej) => {
      this.USER.findOne({ username }).then(async (validUser: any) => {
        if (!validUser) {
          rej();
        } else {
          const validPass = await this.bcrypt.compare(
            password,
            validUser.password
          );
          if (!validPass) {
            rej();
          } else {
            let info: any = {
              id: validUser._id
            };
            let token = this.jwt.sign(info, this.TOKEN_SECRET, {
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
    await this.bcrypt.genSalt(10).then((result: any) => (this.SALT = result));
    return await this.bcrypt.hash(password, this.SALT);
  };

  ChangePassword = async (user: any, password: string, newPassword: string) => {
    const validUser = await this.USER.findById(this.USER._id);
    if (!validUser) {
      return false;
    } else {
      const validPass = await this.bcrypt.compare(
        password,
        validUser.password
      );
      if (!validPass) {
        false;
      } else {
        validUser.password = await this.generatePassword(newPassword);
        validUser.save().then((result: any) => {
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
