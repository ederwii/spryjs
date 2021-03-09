import IService from "./service.interface";
import { Application } from "express";
import { DoRequest, DoPrivateRequest } from "../utils";
import jwt from "jsonwebtoken";
import localService from "../services/local.service"
import { SpryConfig } from "../types/spry-config";

const service = localService.getInstance();

const TOKEN_SECRET = service.tokenSecret;

export default abstract class BaseController {

  private readonly _config: SpryConfig = {
    auth: {
      get: false,
      getById: false,
      post: false,
      patch: false,
      delete: false,
      put: false,
    }
  }

  constructor(
    private _app: Application,
    private service: IService,
    private baseApi: string,
    config?: SpryConfig
  ) {
    if (config) {
      Object.assign(this._config, config);
    }
  }

  public registerRoutes() {
    console.log('Register path ' + this.baseApi);
    this._app
      .route(this.baseApi.toLowerCase())
      .get(
        this._config.auth.get ? DoPrivateRequest : DoRequest,
        async (req, res) => {

          const sortBy = req.query.sortBy
            ? req.query.sortBy.toString().split(",")
            : [];

          const sortDesc = req.query.sortDesc
            ? req.query.sortDesc.toString().split(",")
            : [];

          const page = req.query.page ? +req.query.page : 1;

          const itemsPerPage = req.query.itemsPerPage
            ? +req.query.itemsPerPage
            : undefined;

          const search = req.query.search
            ? req.query.search.toString()
            : undefined;

          const esearch = req.query.esearch
            ? req.query.esearch.toString()
            : undefined;

          const fields = req.query.fields
            ? req.query.fields.toString().split(",").join(" ")
            : "";

          let condition: any = {};

          if (search) {
            const key = search.split("=")[0];
            const value = search.split("=")[1];
            var regex = new RegExp([value].join(""), "i");
            condition[key] = regex;
          }

          if (esearch) {
            const key = esearch.split("=")[0];
            const value = esearch.split("=")[1];
            condition[key] = value;
          }

          try {
            let sort: any = {};
            for (let i = 0; i < sortBy.length; i++) {
              sort[sortBy[i]] =
                sortDesc[i] && sortDesc[i].toLowerCase() == "true" ? -1 : 1;
            }
            let opt: any = {
              sort: sort,
            };
            if (itemsPerPage && itemsPerPage > 0) {
              opt.skip = page * itemsPerPage - itemsPerPage;
              opt.limit = itemsPerPage;
            }
            const items = await this.service.GetByQuery(condition, fields, opt);
            const total = await this.service.GetCount();
            res.status(200).send({ items, total });
          } catch (err) {
            console.log(err)
            res.status(500).send(err);
          }
        }
      )
      .post(
        this._config.auth.post ? DoPrivateRequest : DoRequest,
        async (req, res) => {
          res.send(req.body);
          try {
            const token = req.header("auth-token");
            if (token && token.length > 50) {
              const verified: any = jwt.verify(
                token ? token.toString() : "",
                TOKEN_SECRET
              );
              req.body["userId"] = verified._id;
            }
            await this.service
              .Create(req.body)
              .then((result: any) => {
                res.status(200).send(result);
              })
              .catch((err: any) => {
                res.status(500).send(err.message);
              });
          } catch (ex) { }
        }
      );

    this._app
      .route(`${this.baseApi.toLowerCase()}/:id`)
      .get(
        this._config.auth.getById ? DoPrivateRequest : DoRequest,
        async (req, res) => {
          const id = req.params.id;
          await this.service
            .GetById(id)
            .then((result: any) => {
              res.status(200).send(result);
            })
            .catch((err: any) => {
              res.status(500).send({
                error: err,
              });
            });
        }
      )
      .patch(
        this._config.auth.patch ? DoPrivateRequest : DoRequest,
        async (req, res) => {
          const token = req.header("auth-token");
          const verified: any = jwt.verify(
            token ? token.toString() : "",
            TOKEN_SECRET
          );
          req.body["userId"] = verified._id;
          const id = req.params.id;
          try {
            await this.service
              .Patch(req.body.operations, id)
              .then((result: any) => {
                res.status(200).send(result);
              })
              .catch((err: any) => {
                res.status(500).send({
                  error: err,
                });
              });
          } catch (ex) {
            console.log(ex);
            throw Error();
          }
        }
      )
      .delete(
        this._config.auth.delete ? DoPrivateRequest : DoRequest,
        async (req, res) => {
          const id = req.params.id;
          await this.service.Delete(id).then(
            (r: any) => {
              if (r.n) res.send();
              else res.status(409).send();
            },
            () => {
              res.status(500).send();
            }
          );
        }
      )
      .put(
        this._config.auth.put ? DoPrivateRequest : DoRequest,
        async (req, res) => {
          const token = req.header("auth-token");
          if (token && token.length > 50) {
            const verified: any = jwt.verify(
              token ? token.toString() : "",
              TOKEN_SECRET
            );
            req.body["userId"] = verified._id;
          }
          this.service
            .Update(req.params.id, req.body)
            .then(() => {
              res.send();
            })
            .catch((err: any) => {
              res.status(500).send(err);
            });
        }
      );
  }
}
