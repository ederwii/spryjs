import appManager from "./app-manager";
import _http from "http";
import MongooseHelperConfigType from "./types/mongoose-helper-config";

class Manager {
  _port: number | string;
  _server: any;
  _initialized = false;

  constructor(port?: string | number, callback: Function = () => { }, skipInit = false) {
    this._port = port ? this.normalizePort(port) : this.defaultPort;
    !skipInit && this.initialize(callback);
    skipInit && (this._initialized = true) && callback();
  }

  /** Enable morgan HTTP request logger middleware*/
  useMorgan(format?: string) {
    appManager.useMorgan(format);
  }

  /** Enable MongoDB initialization for data storage layer
   * @param {string} connectionString - MongoDB Connection string
   */
  useMongo(config: MongooseHelperConfigType): Promise<boolean> {
    return new Promise((resolve, reject) => {
      appManager.enabbleMongoose(config).then(() => {
        resolve(true);
      }).catch((err) => reject(err))
    })
  }

  /**
   * Initialize Spry
   * @param {Function} callback - Will be called when server is initialized
   */
  private initialize(callback: Function = () => { }) {
    appManager.getApp.set("port", this._port);
    this._server = _http.createServer(appManager.getApp);
    this._server.listen(this._port);
    this._server.on("error", this.onError);
    this._server.on("listening", this.onListening(this, callback));
  }

  /** Server instance */
  get server() {
    return this._server;
  }
  set server(val) {
    this._server = val;
  }


  get defaultPort() {
    return process.env.PORT || '3000';
  }

  /** Get initialized state
   * @returns {boolean} initialized state
   */
  get isInitialized(): boolean {
    return this._initialized;
  }

  /** Get express application instance */
  get app() {
    if (!this._initialized) {
      throw new Error('SpryJs not initialized yet.');
    } else
      return appManager.getApp;
  }

  private onError(error: any) {
    if (error.syscall !== "listen") {
      throw error;
    }

    var bind = typeof this._port === "string" ? "Pipe " + this._port : "Port " + this._port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case "EACCES":
        console.error(bind + " requires elevated privileges");
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(bind + " is already in use");
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  private onListening(scope: any, callback: Function = () => { }) {
    return () => {
      var addr = scope._server.address();
      var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
      console.log("Listening on " + bind);
      scope._initialized = true;
      callback();
    }
  }

  private normalizePort(val: any): number {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
      // named pipe
      return val;
    }

    if (port >= 0) {
      // port number
      return port;
    }

    return NaN;
  }
}

export default Manager;