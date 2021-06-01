type ServiceType<T> = {
  Get(): Promise<T[]>;
  GetById(id: string): Promise<T | null>;
  GetFirst(params: Partial<T>): Promise<T | null>
  Create(payload: Partial<T>, checkKeyField: boolean): Promise<string>;
  Delete(id: string): Promise<boolean>;
  GetByKeyword(keyword: any): Promise<T[]>;
  GetByQuery(params?: any, fields?: string, options?: any): Promise<T[]>;
  GetCount(): Promise<Number>;
  Update(id: string, payload: Partial<T>): Promise<boolean>;
}

export default ServiceType;