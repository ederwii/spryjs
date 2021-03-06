import express, {
  Application,
} from "express";

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

  
}

export default new App();