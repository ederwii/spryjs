import BaseService from "../base/base.service";

export default class IdentityService extends BaseService {
  constructor(private bcrypt: any, private jwt: any, private TOKEN_SECRET: string, private SALT: string, private EXPIRES_IN: number, private USER: any) {
    super(USER, "User", 'username');
  }

  private userMappedFields: string[] = [];

  MapUserField(field: string) {
    this.userMappedFields.push(field);
  }

  async Create(payload: any): Promise<any> {
    const existingUser = await this.USER.findOne({ username: payload.username });
    if (!existingUser) {
      payload.password = await this.GeneratePassword(payload.password);
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
            this.userMappedFields.forEach(mf => {
              validUser[mf] && (info[mf] = validUser[mf])
            })
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

  GeneratePassword = async (password: string) => {
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
        validUser.password = await this.GeneratePassword(newPassword);
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
