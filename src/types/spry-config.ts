export type SpryConfig = {
  get?: Partial<VerbConfig>,
  getById?: Partial<VerbConfig>,
  post?: Partial<VerbConfig>,
  delete?: Partial<VerbConfig>,
  put?: Partial<VerbConfig>,
  patch?: Partial<VerbConfig>
}

export type VerbConfig = {
  isPrivate: boolean,
  isDisabled: boolean,
  permissions?: string[]
}