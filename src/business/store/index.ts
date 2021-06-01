import IdentityService from "../identity";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userDefault from "../identity/user-default";

export class StoreService {
  private TOKEN_SECRET = '';
  private SALT = '';
  private MONGO_CS = '';
  private ENTITIES: any[] = [];
  private USE_TIMESTAMPS: boolean = true;
  private IDENTITY_SERVICE: IdentityService | undefined;
  private EXPIRES_IN = 0;
  private USER_MODEL: any = userDefault;
  private MAPPED_FIELDS: Map<string, any> = new Map<string, any>();

  initializeIdentityService() {
    if (!this.TOKEN_SECRET || !this.SALT)
      throw new Error('Invalid Identity Service configuration');

    const UserSchema: Schema = new Schema(
      this.userModel,
      { timestamps: true }
    );

    var model = mongoose.model("User", UserSchema);
    this.IDENTITY_SERVICE = new IdentityService(bcrypt, jwt, this.TOKEN_SECRET, this.SALT, this.EXPIRES_IN, model);
  }

  get mappedFields() {
    return this.MAPPED_FIELDS;
  }

  set mappedFields(val) {
    this.MAPPED_FIELDS = val;
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

  get identityService() {
    return this.IDENTITY_SERVICE
  }

  get canIdentityBeConfigured() {
    return this.TOKEN_SECRET.length && this.SALT && this.IDENTITY_SERVICE == undefined;
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

  mapField(field: string, targetField: string = field, required: boolean = false) {
    this.mappedFields.set(field, { targetField, required });
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
class State {
  // Use the `Logger` type
  private static instance: StoreService
  // Use a private constructor
  private constructor() { }
  // Ensure that there is only one instance created
  public static getInstance(): StoreService {
    if (!State.instance) {
      State.instance = new StoreService()
    }
    return State.instance
  }
}

export default State.getInstance();