export type AuthConfigType = {
  tokenSecret: string,
  salt: string,
  model: any,
  expiresIn: number,
  route: string,
  enableRoutes: boolean
}