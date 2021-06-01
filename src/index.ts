import ServiceFactory from "./business/service-factory";
import EntityBase from "./types/entity-base-type";
import ServiceType from "./types/service-type";
import ConfigType from "./types/config-type";
import MongooseHelperConfigType from "./types/mongoose-helper-config";
import { Application } from "express";
import Manager from "./manager";
import { AuthConfigType } from "./types/auth-config-type";
import IIdentity from "./types/identity-interface";
import store from "./business/store";
import userDefault from "./business/identity/user-default";
import UserController from "./api/identity-controller"
import EntityConfig from "./types/entity-type";
import mongoose, { model, Schema } from "mongoose";
import ControllerFactory from "./api/controller-factory";
import GetResponseType from "./types/get-response-type";
import mergeDeep from "./business/helpers/utils";
import ServiceBase from "./business/base/service-base";
import CustomRoute from "./types/custom-route.type";

export {
  ServiceFactory,
  ServiceBase,
  EntityBase,
  ServiceType,
  ConfigType,
  MongooseHelperConfigType,
  IIdentity,
  GetResponseType,
  CustomRoute
}

let app: Manager;

const DEFAULT_AUTH_CONFIG: Partial<AuthConfigType> = {
  model: userDefault,
  expiresIn: 86400,
  route: '/user',
  enableRoutes: true
}

class SpryJs {
  constructor() {
  }

  /**
   * Initialize Spry instance
   * @param {number} port Port to listen 
   * @returns {Promise<Application>} Express application object
   */
  init(port?: number | string): Promise<Application> {
    return new Promise((resolve, _reject) => {
      app = new Manager(port, () => {
        resolve(app.app);
      });
    })
  }

  /**
   * Initialize Spry instance for testing
   * @returns {Promise<Application>} Express application object
   */
  initTest(): Promise<Application> {
    return new Promise((resolve, _reject) => {
      app = new Manager(undefined, () => { }, true);
      resolve(app.app);
    })
  }

  /**
   * Enable JWT authentication.
   * @param {Partial<AuthConfig>} config - Partial config to be used
   * @param {string} config.tokenSecret - String to be used for token security 
   * @param {string} config.salt - String to be used for user password encryption
   * @param {number} config.expiresIn - In seconds: Time for token to expire. Defaults to 24 hours
   * @param {any} config.model - user model to be used. Must include username and password
   * @returns {Promise} Void promise
   */
  useAuthentication(config: Partial<AuthConfigType>): Promise<void> {
    return new Promise((res, _rej) => {
      let c = { ...DEFAULT_AUTH_CONFIG };
      const merged = mergeDeep(c, config);

      c = merged;

      if ((c.tokenSecret && c.tokenSecret.length < 1) || (c.salt && c.salt.length < 1)) {
        throw new Error('Invalid authentication configuration')
      }
      c.tokenSecret &&
        (store.tokenSecret = c.tokenSecret);
      c.salt &&
        (store.salt = c.salt);
      c.expiresIn &&
        (store.expiresIn = c.expiresIn);
      store.userModel = c.model;
      store.initializeIdentityService();

      let service = store.identityService;
      if (c.route && c.route[0] === '/') {
        c.route = `/api${c.route}`;
      } else {
        c.route = `/api/${c.route}`;
      }
      service && c.enableRoutes && new UserController(app.app, service, c.route);

      // console.log(`Authentication enabled. Endpoint created: ${c.route}`);
      res();
    })
  }

  /**
   * Enable morgan HTTP request logger middleware.
   * https://github.com/expressjs/morgan#readme
   * @param {string} format - pre-defined formats. Defaults to 'dev'
   */
  useMorgan(format?: string) {
    this.app.useMorgan(format);
  }

  /** Enable MongoDB initialization for data storage layer
   * @param {string} connectionString - MongoDB Connection string
   * @param {boolean} useTimestamps - Enable timestamps on database entities
   * @returns {Promise<boolean>} Promise with status of connection initialization
   */
  useMongo(config: MongooseHelperConfigType): Promise<boolean> {
    return this.app.useMongo(config);
  }

  /**
   * Register new entity in the application
   * @param {EntityConfig} config - Entity configuration related
   * @param {string} config.name - Name of the entity.
   * @param {any} config.model - Model for the entity. Required if no schema is provided
   * @param {mongoose.Schema} config.schema - Mongoose schema. Required if model is not provided
   * @param {string} config.path - Path for the API endpoint. Defaults to the name of the entity
   * @param {string} config.keyword - Property name to be used with searchByKeyword method
   * @param {SpryConfig} config.config - Configuration object
   * @param {IService} config.service - Service class for API logic. If no service is provided, default service will be created
   */
  registerEntity(config: EntityConfig): Promise<void> {
    return new Promise((res, _rej) => {
      if (!config.path) {
        config.path = config.name;
      }
      const m = config.schema ?? new Schema(config.model, {
        timestamps: store.useTimestamps
      });

      if (!config.service) {
        const mm = model(config.name, m);
        config.service = new ServiceFactory(mm, config.keyword)
      }
      var fixedPath = `/api/${config.path}`;

      const controller = new ControllerFactory(app.app, fixedPath, config.service, config.config, config.routes);

      this.addEntity({
        controller,
        config: config,
        dbmodel: m
      })

      // console.log(`Entity ${config.name} registered correctly. Full CRUD enabled on ${fixedPath}`);
      res();
    })
  }

  /** Create new model for MongoDB */
  createModel(name: string, schema: Schema): mongoose.Model<any, {}> {
    return mongoose.model(name, schema);
  }

  /**
   * Maps an user property to a specific entity. Mapped propertis will be filled automatically
   * when creating a new record of the entity
   * @param {string} property User property to be mapped
   * @param {string} entity Entity to be mapped with
   */
  mapUserProperty(property: string, entity: string, targetProperty: string = property, required: boolean = false) {
    // Check if entity is registered
    const existing = store.entities.find(x => x.config && x.config.name && x.config.name.toLowerCase() == entity.toLowerCase());
    if (!existing)
      throw new Error(`Entity ${entity} is not registered`);

    store.mapField(property, targetProperty, required);
    store.identityService?.MapUserField(property);
  }

  private addEntity(entity: any): void {
    store.addEntity(entity);
  }

  private get app() {
    return app as any as Manager;
  }
}

class Singleton {
  // Use the `Logger` type
  private static instance: SpryJs
  // Use a private constructor
  private constructor() { }
  // Ensure that there is only one instance created
  public static getInstance(): SpryJs {
    if (!Singleton.instance) {
      Singleton.instance = new SpryJs()
    }
    return Singleton.instance
  }
}

export default Singleton.getInstance();

if (typeof module !== 'undefined') {
  module.exports = Object.assign(Singleton.getInstance(), module.exports);
}