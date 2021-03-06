import express, {
  Application,
} from "express";
import mongoose from "mongoose";

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

  enabbleMongoose(cs: string) {
    mongoose.set("useCreateIndex", true);

    mongoose.connect(cs, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  
}

export default new App();