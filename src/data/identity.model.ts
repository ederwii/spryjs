import mongoose, { Schema } from "mongoose";
import IBaseEntity from "../base/base.entity";

export interface IUser extends IBaseEntity {
  username: string;
  password: string;
}

const UserSchema: Schema = new Schema(
  {
    username: String,
    password: String,
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
