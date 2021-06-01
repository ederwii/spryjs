import mongoose from "mongoose";
import { ServiceType } from "../../";

export default abstract class ServiceBase<T> implements ServiceType<T> {

  constructor(
    private _entity: mongoose.Model<any>,
    private keyField = ''
  ) {
  }
  GetCount(): Promise<Number> {
    return this._entity.countDocuments().exec();
  }

  async Get(): Promise<T[]> {
    return await this.GetByQuery();
  }

  async GetFirst(params: Partial<T>): Promise<T | null> {
    return await this._entity.findOne(params).exec();
  }

  async GetByQuery(params: any = {},
    fields: string = "",
    options: any = {}): Promise<T[]> {
    return await this._entity.find(params, fields, options).exec();
  }

  async GetById(_id: string): Promise<T> {
    return await this._entity.findById(_id).exec();
  }

  async Create(payload: Partial<T>, checkKeyField = true): Promise<string> {
    if (checkKeyField && this.keyField.length > 0 && this.keyField in payload) {
      const value = (payload as any)[this.keyField];
      const existing = await this.GetByKeyword(value);
      if (existing.length > 0) {
        return Promise.reject(`There is alredy an object in the database with the same key field. Entity: ${this._entity.modelName}. Field: ${this.keyField}, Value: ${value}`);
      }
    }

    return new Promise((res, rej) => {
      const record = new this._entity(payload);

      record.save().then((c: any) => {
        res(c._id);
      }).catch((err: any) => rej(err));
    })
  }

  Delete(_id: string): Promise<boolean> {
    return new Promise((res, rej) => {
      this._entity.deleteOne({ _id }).exec().then((r) => {
        if (r.n)
          res(true);
        else {
          res(false);
        }
      }).catch(() => {
        rej();
      })
    })
  }

  async Update(_id: string, payload: Partial<T>): Promise<boolean> {
    const existing: any = await this.GetById(_id);
    if (!existing) {
      return Promise.reject('No entity found');
    }
    let diff: any = {};
    Object.keys(payload).forEach((k: string) => {
      const p = (payload as any)[k];
      if (existing[k] !== p) {
        diff[k] = p;
      }
    })

    return new Promise((res, rej) => {
      this._entity.updateOne({ _id }, { $set: diff }).exec().then(() => {
        res(true);
      }).catch((err) => {
        rej(err)
      });
    })
  }

  GetByKeyword(value: any): Promise<T[]> {
    const filter: any = {};

    filter[this.keyField] = new RegExp(value, 'i');

    return this._entity.find(filter).exec();
  }
}