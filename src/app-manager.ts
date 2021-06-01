import express, {
  Application,
} from "express";
import cors from "cors";
import { MongooseHelperConfigType } from ".";
import MongooseHelper from "./business/helpers/mongoose-helper";

class AppManager {
  private app: Application;

  get getApp() {
    return this.app;
  }
  constructor() {
    this.app = express();
    this.setConfig();
  }

  private setConfig() {
    // parse application/x-www-form-urlencoded
    this.app.use(express.urlencoded({ extended: true }))

    // parse application/json
    this.app.use(express.json())

    this.app.use(cors());

  }

  useMorgan(format: string = 'dev'): void {
    if (!format)
      throw new Error('Morgan initialization requires a format')
    const morgan = require("morgan");
    this.app.use(morgan(format));
  }

  enabbleMongoose(config: MongooseHelperConfigType): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const manager = new MongooseHelper(config);
      manager.connect().then(() => resolve(true)).catch((r) => reject(r));
    })
  }
}

export default new AppManager();