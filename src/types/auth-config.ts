export type AuthConfig = {
  tokenSecret: string,
  salt: string,
  model: any,
  expiresIn: number,
  route: string
}