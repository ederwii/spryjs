import express, {
  Application,
} from "express";
import mongoose from "mongoose";
import morgan from "morgan";

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
  }

  enableMorgan() {
    this.app.use(morgan("tiny"));
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