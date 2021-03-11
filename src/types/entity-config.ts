import { SpryConfig } from "./spry-config";
import IService from "../base/service.interface";

export type EntityConfig = {
  name: string,
  model: any,
  path?: string,
  keyword?: string,
  service?: IService,
  config: SpryConfig,
}