import { Application } from "express";
import BaseController from "../base/base.controller";
import IService from "../base/service.interface";

export default class FactoryController extends BaseController {
  constructor(app: Application, baseApi: string, service: IService, config?: any) {
    super(app, service, baseApi, config);
    this.registerRoutes();
  }
}