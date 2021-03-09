import _ from "./main";
import lservice from "./services/local.service";
import FactoryController from "./controllers/factory.controller";
import FactoryService from "./services/factory.service";
import IService from "./base/service.interface";
import mongoose, { Schema } from "mongoose";
import { DEFAULT_MORGAN_FORMAT } from "./constants"
let app: any;

export default class SpryJs {
  constructor() {

  }

  /**
   * Initialize Spry instance
   * @param {number} port Port to listen 
   * @returns {Promise<boolean>} Promise object 
   */
  init(port?: number | string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      app = new _(port, () => {
        resolve(true);
      });
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
   * @returns {Promise<boolean>} Promise with status of connection initialization
   */
  useMongo(connectionString: string): Promise<boolean> {
    return this.app.useMongo(connectionString);
  }

  private get app() {
    return app as any as _;
  }

  registerEntity(name: string, model: Schema, path?: string, keyword?: string, service?: IService, config?: any) {
    if (!path) {
      path = name;
    }
    const mm = mongoose.model(name, model);
    if (!service) {
      service = new FactoryService(mm, name, keyword)
    }
    var fixedPath = `/api/${path}`;

    const controller = new FactoryController(app.app, fixedPath, service, config);
    lservice.getInstance().addEntity({
      name, path, service, controller
    })
    console.log(`Entity ${name} registered correctly. Full CRUD enabled on ${fixedPath}`);
  }

  info() {
    // Entities
    lservice.getInstance().entities.forEach(e => {
      console.log(e);
    })
  }
}


if (typeof module !== 'undefined') {
  module.exports = Object.assign(SpryJs, module.exports);
}