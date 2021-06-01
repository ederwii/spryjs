import { Application } from "express";
import { doRequest, doPrivateRequest, tokenCheckMap } from "../../business/helpers/request-helper";
import { ServiceType, ConfigType } from "../..";
import mergeDeep from "../../business/helpers/utils";

export default abstract class ControllerBase<T> {

  private readonly _config: ConfigType = {
    get: {
      isPrivate: false,
      isEnabled: true,
      claims: []
    },
    getById: {
      isPrivate: false,
      isEnabled: true,
      claims: []
    },
    post: {
      isPrivate: false,
      isEnabled: true,
      claims: []
    },
    delete: {
      isPrivate: false,
      isEnabled: true,
      claims: []
    },
    put: {
      isPrivate: false,
      isEnabled: true,
      claims: []
    },
  }

  constructor(
    private _app: Application,
    private _baseApi: string,
    private _service: ServiceType<T>,
    config?: ConfigType
  ) {
    if (config) {
      const merged = mergeDeep(this._config, config);
      this._config = merged;
    }
  }

  public registerRoutes() {
    // console.log('Register path ' + this._baseApi);

    this._config.get?.isEnabled && this._app
      .route(this._baseApi.toLowerCase())
      .get(
        this._config.get.isPrivate ? doPrivateRequest : doRequest,
        async (req, res) => {

          const sortBy = req.query.sortBy
            ? req.query.sortBy.toString().split(",")
            : [];

          const sortDesc = req.query.sortDesc
            ? req.query.sortDesc.toString().split(",")
            : [];

          const page = req.query.page ? +req.query.page : 1;

          const ipp = req.query.ipp
            ? +req.query.ipp
            : 5;

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
            const key = search.split(":")[0];
            const value = search.split(":")[1];
            var regex = new RegExp([value].join(""), "i");
            condition[key] = regex;
          }

          if (esearch) {
            const key = esearch.split(":")[0];
            const value = esearch.split(":")[1];
            condition[key] = value;
          }

          try {
            let sort: any = {};
            for (let i = 0; i < sortBy.length; i++) {
              sort[sortBy[i]] =
                sortDesc[i] && sortDesc[i].toLowerCase() == "true" ? -1 : 1;
            } 
            let opt: any = {};
            if (sortBy.length) {
              opt.sort = sort;
            }

            if (ipp && ipp > 0) {
              opt.skip = page * ipp - ipp;
              opt.limit = ipp;
            }
            await this._service.Get();
            const items = await this._service.GetByQuery(condition, fields, opt);
            const total = await this._service.GetCount();
            res.status(200).send({ items, total });
          } catch (err) {
            console.log(err)
            res.status(500).send(err);
          }
        }
      );

    this._config.post?.isEnabled && this._app
      .route(this._baseApi.toLowerCase())
      .post(
        this._config.post.isPrivate ? doPrivateRequest : doRequest,
        async (req, res) => {
          try {
            if (!this._config.post?.isPrivate)
              await tokenCheckMap(req);
            await this._service
              .Create(req.body, true)
              .then((result: any) => {
                res.status(200).json({ _id: result });
              })
              .catch((err: any) => {
                res.status(500).send(err.message);
              });
          } catch (ex) { }
        }
      );

    this._config.getById?.isEnabled && this._app
      .route(`${this._baseApi.toLowerCase()}/:id`)
      .get(
        this._config.getById.isPrivate ? doPrivateRequest : doRequest,
        async (req, res) => {
          const id = req.params.id;
          await this._service
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

    this._config.delete?.isEnabled && this._app
      .route(`${this._baseApi.toLowerCase()}/:id`)
      .delete(
        this._config.delete.isPrivate ? doPrivateRequest : doRequest,
        async (req, res) => {
          const id = req.params.id;
          await this._service.Delete(id).then(
            (r: any) => {
              if (r) res.send();
              else res.status(409).send();
            },
            () => {
              res.status(500).send();
            }
          );
        }
      )

    this._config.put?.isEnabled && this._app
      .route(`${this._baseApi.toLowerCase()}/:id`)
      .put(
        this._config.put.isPrivate ? doPrivateRequest : doRequest,
        async (req, res) => {
          if (!this._config.put?.isPrivate)
            await tokenCheckMap(req);
          this._service
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
