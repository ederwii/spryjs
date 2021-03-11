import _ from "./main";
import lservice from "./services/local.service";
import FactoryController from "./controllers/factory.controller";
import FactoryService from "./services/factory.service";
import IService from "./base/service.interface";
import mongoose, { Schema } from "mongoose";
import { DEFAULT_MORGAN_FORMAT } from "./constants"
import { SpryConfig } from "./types/spry-config";
import { Application } from "express";
import { UserController } from "./controllers/identity.controller";
let app: any;

export default class SpryJs {
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

  useAuthentication(token_secret: string, salt: string, expiresIn: number = 86400):Promise<void> {
    return new Promise((res, rej) => {
      lservice.getInstance().tokenSecret = token_secret;
      lservice.getInstance().salt = salt;
      lservice.getInstance().expiresIn = expiresIn;
      lservice.getInstance().initializeUserService();

      var fixedPath = `/api/user`;

      new UserController(app.app);
      
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
   * @param {string} name - Name of the entity. 
   * @param {any} model - Model for the entity  
   * @param {string} path - Path for the API endpoint. Defaults to the name of the entity 
   * @param {string} keyword - Property name to be used with searchByKeyword method 
   * @param {SpryConfig} config - Configuration object 
   * @param {IService} service - Service class for API logic 
   */
  registerEntity(name: string, model: any, path?: string, keyword?: string, config?: SpryConfig, service?: IService): Promise<void> {
    return new Promise((res, rej) => {
      if (!path) {
        path = name;
      }
      const m = new Schema(model, {
        timestamps: lservice.getInstance().useTimestamps
      });
      const mm = mongoose.model(name, m);
      if (!service) {
        service = new FactoryService(mm, name, keyword)
      }
      var fixedPath = `/api/${path}`;

      const controller = new FactoryController(app.app, fixedPath, service, config);
      lservice.getInstance().addEntity({
        name, path, service, controller
      })
      console.log(`Entity ${name} registered correctly. Full CRUD enabled on ${fixedPath}`);
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

  private get app() {
    return app as any as _;
  }
}
export {
  SpryConfig
}

if (typeof module !== 'undefined') {
  module.exports = Object.assign(SpryJs, module.exports);
}