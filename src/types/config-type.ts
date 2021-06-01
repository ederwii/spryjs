type ConfigType = {
  get?: Partial<VerbConfig>;
  getById?: Partial<VerbConfig>;
  post?: Partial<VerbConfig>;
  put?: Partial<VerbConfig>;
  delete?: Partial<VerbConfig>;
}

type VerbConfig = {
  isEnabled: boolean;
  isPrivate: boolean;
  claims: [];
}

export default ConfigType;