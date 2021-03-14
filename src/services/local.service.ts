import UserService from "./identity.service";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class service {
  private TOKEN_SECRET = '';
  private SALT = '';
  private MONGO_CS = '';
  private ENTITIES: any[] = [];
  private USE_TIMESTAMPS: boolean = true;
  private USER_SERVICE: UserService | undefined;
  private EXPIRES_IN = 0;
  private USER_MODEL: any = undefined;

  initializeUserService() {
    const UserSchema: Schema = new Schema(
      this.USER_MODEL,
      { timestamps: true }
    );

    var model = mongoose.model("User", UserSchema);
    this.USER_SERVICE = new UserService(bcrypt, jwt, this.TOKEN_SECRET, this.SALT, this.EXPIRES_IN, model);
  }

  createUser(user: any): Promise<void> {
    return new Promise((res, rej) => {
      this.USER_SERVICE && this.USER_SERVICE.Create(user).then(() => res())
    })
  }

  authenticate(username: string, password: string): Promise<string> {
    return new Promise((res, rej) => {
      this.USER_SERVICE && this.USER_SERVICE.DoLogin(username, password).then((r) => res(r)).catch((err) => rej(err));
    })
  }

  get userModel() {
    return this.USER_MODEL;
  }
  set userModel(val) {
    this.USER_MODEL = val;
  }

  get expiresIn() {
    return this.EXPIRES_IN;
  }
  set expiresIn(val) {
    this.EXPIRES_IN = val;
  }

  get userService() {
    return this.USER_SERVICE
  }

  get canIdentityBeConfigured() {
    return this.TOKEN_SECRET.length && this.SALT && this.USER_SERVICE == undefined;
  }

  get salt() {
    return this.SALT;
  }
  set salt(val) {
    this.SALT = val;
  }

  get useTimestamps() {
    return this.USE_TIMESTAMPS;
  }
  set useTimestamps(val) {
    this.USE_TIMESTAMPS = val;
  }

  get entities() {
    return this.ENTITIES;
  }

  set entities(val) {
    this.ENTITIES = val;
  }

  addEntity(entity: any) {
    this.ENTITIES.push(entity);
  }

  get mongoCs() {
    return this.MONGO_CS;
  }

  set mongoCs(val) {
    this.MONGO_CS = val;
  }

  get tokenSecret() {
    return this.TOKEN_SECRET;
  }

  set tokenSecret(val) {
    this.TOKEN_SECRET = val;
  }
}

// Singleton class we have added below.
export default class LocalService {
  // Use the `Logger` type
  private static instance: service
  // Use a private constructor
  private constructor() { }
  // Ensure that there is only one instance created
  public static getInstance(): service {
    if (!LocalService.instance) {
      LocalService.instance = new service()
    }
    return LocalService.instance
  }
}