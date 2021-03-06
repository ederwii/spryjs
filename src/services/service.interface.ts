export default interface IService<T> {
  Get(): Promise<T[]>;
  GetById(id: string): Promise<T | null>;
  Create(payload: Partial<T>): Promise<T>;
  Delete(id: string): Promise<boolean>;
  Patch(operations: IPatchOperation[], id: string): Promise<T>;
  GetByKeyword(keyword: any): Promise<T[]>;
  GetByKeywordMatch(keyword: any): Promise<T[]>;
  GetByQuery(params: any, fields: string, options: any): Promise<T[]>;
  GetCount(): Promise<Number>;
  Update(id: string, payload: Partial<T>): Promise<T>;
}

export interface IPatchOperation {
  fieldName: string;
  value: any;
  area?: string;
}