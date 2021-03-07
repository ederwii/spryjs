import mongoose, { Schema } from "mongoose";
import IBaseEntity from "../data/base.entity";

export interface ITest extends IBaseEntity {
  username: string;
}

const schema: Schema = new Schema({
  username: String
},
  { timestamps: true })

export default mongoose.model("Test", schema);