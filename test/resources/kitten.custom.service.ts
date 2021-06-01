
import { ServiceBase } from "../../src";
import { IKitten } from "./kitten";
export default class KittenCustomService extends ServiceBase<IKitten> {
  GetCount(): Promise<Number> {
    return super.GetCount();
  }
  Get(): Promise<IKitten[]> {
    return super.Get();
  }
  GetFirst(params: Partial<IKitten>): Promise<IKitten | null> {
    return super.GetFirst(params);
  }
  GetByQuery(params?: any, fields?: string, options?: any): Promise<IKitten[]> {
    return super.GetByQuery(params, fields, options);
  }
  GetById(_id: string): Promise<IKitten> {
    return super.GetById(_id);
  }
  Create(payload: Partial<IKitten>, checkKeyField: boolean = true): Promise<string> {
    if('name' in payload){
      payload.name = `${payload.name} spry`
    }
    return super.Create(payload, checkKeyField);
  }
  Delete(_id: string): Promise<boolean> {
    return super.Delete(_id);
  }
  Update(_id: string, payload: Partial<IKitten>): Promise<boolean> {
    return super.Update(_id, payload);
  }
  GetByKeyword(value: any): Promise<IKitten[]> {
    return super.GetByKeyword(value);
  }

}