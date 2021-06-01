import { Application } from "express";
import ControllerBase from "./base/controller-base";
import { ServiceType } from "../";
import { ConfigType } from "../";
import { doPrivateRequest, doRequest, tokenCheckMap } from "../business/helpers/request-helper";
import { Request, Response } from "express";
import CustomRoute from "../types/custom-route.type";

export default class ControllerFactory<T> extends ControllerBase<T> {
  constructor(private app: Application, private baseApi: string, service: ServiceType<T>, config?: ConfigType, routes?: CustomRoute[]) {
    super(app, baseApi, service, config);
    routes && this.overrideRoutes(routes);
    this.registerRoutes();
  }

  private overrideRoutes(routes: any[]) {
    routes.forEach(r => {
      const verb = r.verb.toLowerCase();
      const cb = r.cb;
      const ispv = r.ispv;
      const route = `${this.baseApi.toLowerCase()}/${r.route}`;

      // console.log(`Configure ${route}`);
      verb == "post" && (
        this.app
          .route(route)
          .post(
            ispv ? doPrivateRequest : doRequest,
            async (req, res) => {
              this.handleRequest(req, res, cb)
            }
          )
      );

      verb == "get" && (
        this.app
          .route(route)
          .get(
            ispv ? doPrivateRequest : doRequest,
            async (req, res) => {
              this.handleRequest(req, res, cb)
            }
          )
      );

      verb == "patch" && (
        this.app
          .route(route)
          .patch(
            ispv ? doPrivateRequest : doRequest,
            async (req, res) => {
              this.handleRequest(req, res, cb)
            }
          )
      );

      verb == "put" && (
        this.app
          .route(route)
          .put(
            ispv ? doPrivateRequest : doRequest,
            async (req, res) => {
              this.handleRequest(req, res, cb)
            }
          )
      );

      verb == "delete" && (
        this.app
          .route(route)
          .delete(
            ispv ? doPrivateRequest : doRequest,
            async (req, res) => {
              this.handleRequest(req, res, cb)
            }
          )
      );
    })
  }

  private async handleRequest(req: Request, res: Response, cb: Function) {
    try {
      await tokenCheckMap(req);
      const r = await cb(req.body, req.params, req.query);
      res.status(200).send({ ...r });
    } catch (err) {
      console.log(err)
      res.status(500).send(err);
    }
  }
}