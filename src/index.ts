import service from "./spryjs";
import lservice from "./services/local.service";
import FactoryController from "./controllers/factory.controller";
import FactoryService from "./services/factory.service";
import IService from "./services/service.interface";
import mongoose from "mongoose";
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

  get app() {
    return app as any as SpryJs;
  }

  registerEntity<T>(name: string, model: mongoose.Model<any>, path?: string, keyword?: string, service?: IService<any>) {
    if (!path) {
      path = name;
    }

    if (!service) {
      service = new FactoryService<T>(model, name, keyword)
    }
    var fixedPath = `/api/${path}`;
    console.log(app.app);
    const controller = new FactoryController<T>(app.app, fixedPath, service);
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