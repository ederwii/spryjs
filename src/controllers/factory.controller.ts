import { Application } from "express";
import BaseController from "./base.controller";
import IService from "../services/service.interface";

export default class FactoryController<T> extends BaseController<T> {
  constructor(app: Application, baseApi: string, service: IService, config?: any) {
    super(app, service, baseApi, config);
    this.registerRoutes();
  }
}