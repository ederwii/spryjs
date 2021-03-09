import express, {
  Application,
} from "express";
import mongoose from "mongoose";
import cors from "cors";


class App {
  private app: Application;

  get getApp() {
    return this.app;
  }
  constructor() {
    this.app = express();
    this.setConfig();
  }

  private setConfig() {
    var bodyParser = require('body-parser');
    // parse application/x-www-form-urlencoded
    this.app.use(bodyParser.urlencoded({ extended: false }))

    // parse application/json
    this.app.use(bodyParser.json())

    this.app.use(cors());
    
  }

  useMorgan(format: string) {
    if (!format)
      throw new Error('Morgan initialization requires a format')
    const morgan = require("morgan");
    this.app.use(morgan(format));
  }

  enabbleMongoose(cs: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      mongoose.set("useCreateIndex", true);

      mongoose.connect(cs, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }).then((r) => {
        resolve(true);
      })
        .catch((r) => {
          reject(r);
        })
    })
  }

}

export default new App();