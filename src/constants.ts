import { AuthConfig } from "./types/auth-config";

export const DEFAULT_MORGAN_FORMAT = 'dev';

export const DEFAULT_AUTH_CONFIG: Partial<AuthConfig> = {
  model: { username: String, password: String }
  , expiresIn: 86400
}