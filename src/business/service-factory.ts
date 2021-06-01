import ServiceBase from "./base/service-base";
import mongoose from "mongoose";

export default class ServiceFactory<T> extends ServiceBase<T> {
  constructor(entity: mongoose.Model<T>,
    keywordField: string = '') {
    super(entity, keywordField)
  }
}