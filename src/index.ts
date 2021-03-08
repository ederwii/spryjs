import service from "./spryjs";
import lservice from "./services/local.service";
import FactoryController from "./controllers/factory.controller";
import FactoryService from "./services/factory.service";
import IService from "./base/service.interface";
import mongoose, { Schema } from "mongoose";
let app: any;

export default class SpryJs {
  constructor() {

  }

  init(mongo_cs: string, port?: number | string) {
    return new Promise((resolve, reject) => {
      app = new service(mongo_cs, port, () => {
        resolve(true);
      });
    })
  }

  enableMorgan() {
    this.app.enableMorgan();
  }

  get app() {
    return app as any as SpryJs;
  }

  registerEntity(name: string, model: Schema, path?: string, keyword?: string, service?: IService) {
    if (!path) {
      path = name;
    }
    const mm = mongoose.model(name, model);
    if (!service) {
      service = new FactoryService(mm, name, keyword)
    }
    var fixedPath = `/api/${path}`;

    const controller = new FactoryController(app.app, fixedPath, service);
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

  useMorgan() {
    
  }
}


if (typeof module !== 'undefined') {
  module.exports = Object.assign(SpryJs, module.exports);
}