import IService from "./service.interface";
import { Application } from "express";
import { DoRequest, DoPrivateRequest, tokenCheckMap } from "../utils";
import { SpryConfig } from "../types/spry-config";

export default abstract class BaseController {

  private readonly _config: SpryConfig = {
    get: {
      isPrivate: false,
      isDisabled: false,
      permissions: []
    },
    getById: {
      isPrivate: false,
      isDisabled: false,
      permissions: []
    },
    post: {
      isPrivate: false,
      isDisabled: false,
      permissions: []
    },
    delete: {
      isPrivate: false,
      isDisabled: false,
      permissions: []
    },
    put: {
      isPrivate: false,
      isDisabled: false,
      permissions: []
    },
    patch: {
      isPrivate: false,
      isDisabled: false,
      permissions: []
    },
  }

  constructor(
    private _app: Application,
    private baseApi: string,
    private service: IService,
    config?: SpryConfig
  ) {
    if (config) {
      Object.assign(this._config, config);
    }
  }

  public registerRoutes() {
    console.log('Register path ' + this.baseApi);

    !this._config.get?.isDisabled && this._app
      .route(this.baseApi.toLowerCase())
      .get(
        this._config.get?.isPrivate ? DoPrivateRequest : DoRequest,
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
      );

    !this._config.post?.isDisabled && this._app
      .route(this.baseApi.toLowerCase())
      .post(
        this._config.post?.isPrivate ? DoPrivateRequest : DoRequest,
        async (req, res) => {
          try {
            tokenCheckMap(req);
            await this.service
              .Create(req.body)
              .then((result: any) => {
                res.status(200).json({ _id: result });
              })
              .catch((err: any) => {
                res.status(500).send(err.message);
              });
          } catch (ex) { }
        }
      );

    !this._config.getById?.isDisabled && this._app
      .route(`${this.baseApi.toLowerCase()}/:id`)
      .get(
        this._config.getById?.isPrivate ? DoPrivateRequest : DoRequest,
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

    !this._config.delete?.isDisabled && this._app
      .route(`${this.baseApi.toLowerCase()}/:id`)
      .delete(
        this._config.delete?.isPrivate ? DoPrivateRequest : DoRequest,
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

    !this._config.put?.isDisabled && this._app
      .route(`${this.baseApi.toLowerCase()}/:id`)
      .put(
        this._config.put?.isPrivate ? DoPrivateRequest : DoRequest,
        async (req, res) => {
          tokenCheckMap(req);
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
    
    !this._config.patch?.isDisabled && this._app
      .route(`${this.baseApi.toLowerCase()}/:id`)
      .patch(
        this._config.patch?.isPrivate ? DoPrivateRequest : DoRequest,
        async (req, res) => {
          tokenCheckMap(req);
          this.service
            .Patch(req.body, req.params.id)
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
