import BaseService from "./base.service";
import mongoose from "mongoose";
import IBaseEntity from "../data/base.entity";

export default class FactoryService<T> extends BaseService<T> {
  constructor(entity: mongoose.Model<IBaseEntity>,
    entityName: string,
    keywordField: string = "") {
    super(entity, entityName, keywordField)
  }
}