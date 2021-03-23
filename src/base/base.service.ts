import IService, { IPatchOperation } from "./service.interface";
import mongoose from "mongoose";
import LocalService from "../services/local.service";

export default class BaseService implements IService {
  public _entity: any;
  public keywordField: string;
  public entityName: string;
  private mappedFields: Map<string, any>;
  constructor(
    __entity: mongoose.Model<any>,
    entityName: string,
    keywordField: string = ""
  ) {
    this._entity = __entity;
    this.keywordField = keywordField;
    this.entityName = entityName;
    this.mappedFields = LocalService.getInstance().mappedFields;
  }

  async Get(): Promise<any[]> {
    return await this.GetByQuery({});
  }

  async GetByKeywordMatch(keyword: any): Promise<any[]> {
    const params = {
      [this.keywordField]: keyword,
    };
    return this.GetByQuery(params);
  }

  async GetByKeyword(keyword: any): Promise<any[]> {
    const params = {
      [this.keywordField]: { $regex: "*." + keyword + ".*", $options: "i" },
    };
    return this.GetByQuery(params);
  }

  async GetById(id: string, fields: string = ""): Promise<any | null> {
    return await this._entity.findById(id, fields).exec();
  }

  async GetCount(): Promise<number> {
    return this._entity.countDocuments().exec();
  }

  async GetByQuery(
    params: any,
    fields: string = "",
    options: any = {}
  ): Promise<any[]> {
    return await this._entity.find(params, fields, options).exec();
  }

  async Create(payload: Partial<any>): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      let data: any = { ...payload };
      const user = payload._user;
      let keys = this.mappedFields.keys();
      for (let i = 0; i < this.mappedFields.size; i++) {
        const key = keys.next().value;
        const v = this.mappedFields.get(key);
        let fieldFromUser = '';
        if (payload.user) {
          fieldFromUser = payload.user[key];
        }
        if ('required' in v && v.required && fieldFromUser.length < 1) {
          throw new Error(`Required mapped field ${key} not found in token`)
        }
        data[v.targetField] = fieldFromUser;
      }
      const newRecord = new this._entity(data);
      try {
        const created = await newRecord.save();
        resolve(created._id);
      } catch (err) {
        console.log(err);
        throw new Error();
      }
    });
  }

  async Delete(id: string): Promise<boolean> {
    return await this._entity.deleteOne({ _id: id }).exec();
  }

  async Patch(operations: IPatchOperation[], id: string): Promise<any> {
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

  async Update(id: string, payload: Partial<any>) {
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