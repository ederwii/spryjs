export default interface IService {
  Get(): Promise<any[]>;
  GetById(id: string): Promise<any | null>;
  Create(payload: Partial<any>): Promise<any>;
  Delete(id: string): Promise<boolean>;
  Patch(operations: IPatchOperation[], id: string): Promise<any>;
  GetByKeyword(keyword: any): Promise<any[]>;
  GetByKeywordMatch(keyword: any): Promise<any[]>;
  GetByQuery(params: any, fields: string, options: any): Promise<any[]>;
  GetCount(): Promise<Number>;
  Update(id: string, payload: Partial<any>): Promise<any>;
}

export interface IPatchOperation {
  fieldName: string;
  value: any;
  area?: string;
}