import { Application } from "express";
import BaseController from "../base/base.controller";
import IService from "../base/service.interface";
import { SpryConfig } from "../types/spry-config";
import { DoPrivateRequest, DoRequest, tokenCheckMap } from "../utils";
import { Request, Response } from "express";

export default class FactoryController extends BaseController {
  constructor(private app: Application, private _baseApi: string, service: IService, config?: SpryConfig, routes?: any[]) {
    super(app, _baseApi, service, config);
    routes && this.overrideRoutes(routes);
    this.registerRoutes();
  }

  private overrideRoutes(routes: any[]) {
    routes.forEach(r => {
      const verb = r.verb;
      const cb = r.cb;
      const ispv = r.ispv;
      const route = `${this._baseApi.toLowerCase()}/${r.route}`;

      console.log(`Configure ${route}`);
      verb == "post" && (
        this.app
          .route(route)
          .post(
            ispv ? DoPrivateRequest : DoRequest,
            async (req, res) => {
              this.handleRequest(req, res, cb)
            }
          )
      );

      verb == "get" && (
        this.app
          .route(route)
          .get(
            ispv ? DoPrivateRequest : DoRequest,
            async (req, res) => {
              this.handleRequest(req, res, cb)
            }
          )
      );

      verb == "patch" && (
        this.app
          .route(route)
          .patch(
            ispv ? DoPrivateRequest : DoRequest,
            async (req, res) => {
              this.handleRequest(req, res, cb)
            }
          )
      );

      verb == "put" && (
        this.app
          .route(route)
          .put(
            ispv ? DoPrivateRequest : DoRequest,
            async (req, res) => {
              this.handleRequest(req, res, cb)
            }
          )
      );

      verb == "delete" && (
        this.app
          .route(route)
          .delete(
            ispv ? DoPrivateRequest : DoRequest,
            async (req, res) => {
              this.handleRequest(req, res, cb)
            }
          )
      );
    })
  }

  private async handleRequest(req: Request, res: Response, cb: Function) {
    try {
      tokenCheckMap(req);
      const r = await cb(req.body, req.params, req.query);
      res.status(200).send({ ...r });
    } catch (err) {
      console.log(err)
      res.status(500).send(err);
    }
  }
}