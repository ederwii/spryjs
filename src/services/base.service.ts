import IService, { IPatchOperation } from "./service.interface";
import IBaseEntity from "../data/base.entity";
import mongoose from "mongoose";

export default abstract class BaseService<T> implements IService<T> {
  public _entity: any;
  public keywordField: string;
  public entityName: string;
  constructor(
    __entity: mongoose.Model<IBaseEntity>,
    entityName: string,
    keywordField: string = ""
  ) {
    this._entity = __entity;
    this.keywordField = keywordField;
    this.entityName = entityName;
  }

  async Get(): Promise<T[]> {
    return await this.GetByQuery({});
  }

  async GetByKeywordMatch(keyword: any): Promise<T[]> {
    const params = {
      [this.keywordField]: keyword,
    };
    return this.GetByQuery(params);
  }

  async GetByKeyword(keyword: any): Promise<T[]> {
    const params = {
      [this.keywordField]: { $regex: "*." + keyword + ".*", $options: "i" },
    };
    return this.GetByQuery(params);
  }

  async GetById(id: string, fields: string = ""): Promise<T | null> {
    return await this._entity.findById(id, fields).exec();
  }

  async GetCount(): Promise<number> {
    return this._entity.countDocuments().exec();
  }

  async GetByQuery(
    params: any,
    fields: string = "",
    options: any = {}
  ): Promise<T[]> {
    return await this._entity.find(params, fields, options).exec();
  }

  async Create(payload: Partial<T>): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {
      const data: any = { ...payload };
      if (!payload.hasOwnProperty("code")) {
        data.code = await this.GetCount();
        data.code++;
      }
      const newRecord = new this._entity(data);
      try {
        const created = await newRecord.save();
        resolve(created);
      } catch (err) {
        console.log(err);
        throw new Error();
      }
    });
  }
  async Delete(id: string): Promise<boolean> {
    return await this._entity.deleteOne({ _id: id }).exec();
  }
  async Patch(operations: IPatchOperation[], id: string): Promise<T> {
    const updateOps: any = {};
    for (const op of operations) {
      if (op.area) {
        if (!updateOps[op.area]) {
          await this.GetById(id).then((x: any) => {
            if (op.area) updateOps[op.area] = x[op.area];
          });
        }
        updateOps[op.area][op.fieldName] = op.value;
      } else {
        updateOps[op.fieldName] = op.value;
      }
    }

    return await this._entity
      .updateOne({ _id: id }, { $set: updateOps })
      .exec();
  }

  async Update(id: string, payload: Partial<T>) {
    const existing = await this._entity.findById(id).exec();
    let data: any = { ...payload };
    let diff: any = {};
    Object.keys(payload).forEach(k => {
      if (existing[k] !== data[k]) {
        diff[k] = data[k];
      }
    })
    return await this._entity.updateOne({ _id: id }, { $set: diff }).exec();
  }
}