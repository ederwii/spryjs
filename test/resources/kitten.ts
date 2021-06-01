import mongoose from 'mongoose';
import { EntityBase } from '../../src';

const schema = {
  name: String,
  age: {
    type: Number,
    required: true,
    default: 0
  },
  hobbies: {
    type: [String],
    required: true,
  }
}
export const kittySchema = new mongoose.Schema(schema, { timestamps: true });

interface IKittenBase {
  name: string;
  age?: number;
  hobbies?: string[];
}

export interface IKitten extends IKittenBase, EntityBase {
}

export interface IKittenDTO extends IKittenBase {
}

export default mongoose.model<IKitten>('Kitten', kittySchema);