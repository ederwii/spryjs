import _ from "./main";
import lservice from "./services/local.service";
import FactoryController from "./controllers/factory.controller";
import FactoryService from "./services/factory.service";
import BaseService from "./base/base.service";
import IService from "./base/service.interface";
import mongoose, { Schema } from "mongoose";
import { DEFAULT_MORGAN_FORMAT } from "./constants"
import { SpryConfig } from "./types/spry-config";
import { EntityConfig } from "./types/entity-config";
import { Application } from "express";
import { UserController } from "./controllers/identity.controller";
import { IPatchOperation } from "./base/service.interface";
let app: any;

export class SpryJs {
  constructor() {
  }

  /**
   * Initialize Spry instance
   * @param {number} port Port to listen 
   * @returns {Promise<Application>} Express application object
   */
  init(port?: number | string): Promise<Application> {
    return new Promise((resolve, reject) => {
      app = new _(port, () => {
        resolve(app.app);
      });
    })
  }

  /**
   * Enable JWT authentication.
   * @param {string} token_secret - String to be used for token security 
   * @param {string} salt - String to be used for user password encryption
   * @param {number} expiresIn - In seconds: Time for token to expire. Defaults to 24 hours 
   * @param {any} model - user model to be used. Must include username and password
   * @returns {Promise} Void promise
   */
  useAuthentication(token_secret: string, salt: string, model: any = { username: String, password: String }, expiresIn: number = 86400): Promise<void> {
    return new Promise((res, rej) => {
      lservice.getInstance().tokenSecret = token_secret;
      lservice.getInstance().salt = salt;
      lservice.getInstance().expiresIn = expiresIn;
      lservice.getInstance().userModel = model;
      lservice.getInstance().initializeUserService();

      var fixedPath = `/api/user`;

      let service = lservice.getInstance().userService;
      service && new UserController(app.app, service);

      console.log(`Authentication enabled. Endpoint created: ${fixedPath}`);
      res();
    })
  }

  /**
   * Enable morgan HTTP request logger middleware.
   * https://github.com/expressjs/morgan#readme
   * @param {string} format - pre-defined formats. Defaults to 'dev'
   */
  useMorgan(format: string = DEFAULT_MORGAN_FORMAT) {
    this.app.useMorgan(format);
  }

  /** Enable MongoDB initialization for data storage layer
   * @param {string} connectionString - MongoDB Connection string
   * @param {boolean} useTimestamps - Enable timestamps on database entities
   * @returns {Promise<boolean>} Promise with status of connection initialization
   */
  useMongo(connectionString: string, useTimestamps: boolean = false): Promise<boolean> {
    lservice.getInstance().mongoCs = connectionString;
    lservice.getInstance().useTimestamps = useTimestamps;
    return this.app.useMongo(connectionString);
  }

  /**
   * Register new entity in the application
   * @param {EntityConfig} config - Entity configuration related
   * @param {string} config.name - Name of the entity.
   * @param {any} config.model - Model for the entity
   * @param {string} config.path - Path for the API endpoint. Defaults to the name of the entity
   * @param {string} config.keyword - Property name to be used with searchByKeyword method
   * @param {SpryConfig} config.config - Configuration object
   * @param {IService} config.service - Service class for API logic. If no service is provided, default service will be created
   */
  registerEntity(config: EntityConfig): Promise<void> {
    return new Promise((res, rej) => {
      if (!config.path) {
        config.path = config.name;
      }
      const m = new Schema(config.model, {
        timestamps: lservice.getInstance().useTimestamps
      });

      if (!config.service) {
        const mm = mongoose.model(config.name, m);
        config.service = new FactoryService(mm, config.name, config.keyword)
      }
      var fixedPath = `/api/${config.path}`;

      const controller = new FactoryController(app.app, fixedPath, config.service, config.config, config.routes);

      this.addEntity({
        name: config.name,
        path: config.path,
        service: config.service,
        controller,
        config: config.config,
        dbmodel: m
      })

      console.log(`Entity ${config.name} registered correctly. Full CRUD enabled on ${fixedPath}`);
      res();
    })
  }

  /** Print SpryJs configuration */
  info() {
    // Entities
    lservice.getInstance().entities.forEach(e => {
      console.log(e);
    })
  }

  /** Create new model for MongoDB */
  createModel(name: string, schema: Schema): mongoose.Model<any, {}> {
    return mongoose.model(name, schema);
  }

  private addEntity(entity: any): void {
    lservice.getInstance().addEntity(entity);
  }

  private get app() {
    return app as any as _;
  }
}
export {
  SpryConfig,
  EntityConfig,
  BaseService,
  IService,
  IPatchOperation
}

class Singleton {
  // Use the `Logger` type
  private static instance: SpryJs
  // Use a private constructor
  private constructor() { }
  // Ensure that there is only one instance created
  public static getInstance(): SpryJs {
    if (!Singleton.instance) {
      Singleton.instance = new SpryJs()
    }
    return Singleton.instance
  }
}

export default Singleton.getInstance();

if (typeof module !== 'undefined') {
  module.exports = Object.assign(Singleton.getInstance(), module.exports);
}