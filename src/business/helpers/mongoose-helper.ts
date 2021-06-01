import { MongooseHelperConfigType } from "../..";

import mongoose from 'mongoose';
import mergeDeep from "./utils";

export default class MongooseHelper {
  private _config: MongooseHelperConfigType = {
    username: '',
    password: '',
    dbName: '',
    host: '',
    cs: `mongodb+srv://<username>:<password>@<host>/<dbName>?retryWrites=true&w=majority`
  }
  private _state = {
    isConnected: false
  }

  constructor(config: MongooseHelperConfigType) {
    const merged = mergeDeep(this._config, config);
    this._config = merged;
    this.prepareCs();
  }

  private prepareCs() {
    this._config.cs = this._config.cs?.replace('<username>', this._config.username);
    this._config.cs = this._config.cs?.replace('<password>', this._config.password);
    this._config.cs = this._config.cs?.replace('<dbName>', this._config.dbName);
    this._config.cs = this._config.cs?.replace('<host>', this._config.host )
  }

  connect() {
    return new Promise((res, rej) => {
      mongoose.set("useCreateIndex", true);
      this._config.cs && mongoose.connect(this._config.cs, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = mongoose.connection;
      db.on('error', (err: any) => rej(err));
      db.once('open', () => {
        this._state.isConnected = true;
        res(mongoose);
      })
    })
  }
}

