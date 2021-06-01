import ConfigType from "./config-type";
import ServiceType from "./service-type";
import mongoose from "mongoose"
import CustomRoute from "./custom-route.type";

type EntityConfig = {
  name: string,
  model?: any,
  schema?: mongoose.Schema,
  path?: string,
  keyword?: string,
  service?: ServiceType<any>,
  config?: ConfigType,
  routes?: CustomRoute[]
}

export default EntityConfig;