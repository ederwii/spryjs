export type SpryConfig = {
  auth: SpryConfigAuth;
}

export type SpryConfigAuth = {
  get: boolean,
  getById: boolean,
  post: boolean,
  patch: boolean,
  delete: boolean,
  put: boolean,
}