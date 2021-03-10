import mongoose, { Schema } from "mongoose";
import IBaseEntity from "../base/base.entity";

export interface IUser extends IBaseEntity {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

const UserSchema: Schema = new Schema(
  {
    username: String,
    password: String,
    firstName: String,
    lastName: String,
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
