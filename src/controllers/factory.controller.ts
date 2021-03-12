import { Application } from "express";
import BaseController from "../base/base.controller";
import IService from "../base/service.interface";
import { SpryConfig } from "../types/spry-config";

export default class FactoryController extends BaseController {
  constructor(app: Application, baseApi: string, service: IService, config?: SpryConfig) {
    super(app, baseApi, service, config);
    this.registerRoutes();
  }
}