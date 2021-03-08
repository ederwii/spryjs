import BaseService from "../base/base.service";
import mongoose from "mongoose";

export default class FactoryService extends BaseService {
  constructor(entity: mongoose.Model<any>,
    entityName: string,
    keywordField: string = "") {
    super(entity, entityName, keywordField)
  }
}