export type SpryConfig = {
  auth: SpryConfigAuth;
  noGet?: boolean;
  noGetById?: boolean;
  noPost?: boolean;
  noDelete?: boolean;
  noPut?: boolean;
  noPatch?: boolean
}

export type SpryConfigAuth = {
  get?: boolean,
  getById?: boolean,
  post?: boolean,
  delete?: boolean,
  put?: boolean,
  patch?: boolean
}