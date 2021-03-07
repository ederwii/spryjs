import application from "./app";
import _http from "http";

class SpryJs {
  _port: number | string;
  _server: any;
  _initialized = false;

  constructor(cs: string, port?: string | number, callback = () => { }) {
    this._port = port ? this.normalizePort(port) : this.defaultPort;
    this.initialize(cs, callback);
  }

  enableMorgan() {
    application.enableMorgan();
  }

  private initialize(cs: string, callback = () => { }) {
    application.getApp.set("port", this._port);
    application.enabbleMongoose(cs).then(() => {
      this._server = _http.createServer(application.getApp);

      this._server.listen(this._port);
      this._server.on("error", this.onError);
      this._server.on("listening", this.onListening(this, callback));
    })


  }

  get server() {
    return this._server;
  }
  set server(val) {
    this._server = val;
  }

  get defaultPort() {
    return process.env.PORT || '3000';
  }

  get isInitialized() {
    return this._initialized;
  }

  get app() {
    if (!this._initialized) {
      throw new Error('SpryJs not initialized yet.');
    } else
      return application.getApp;
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

  private onListening(scope: any, callback = () => { }) {
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

export default SpryJs;