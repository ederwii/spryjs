export class service {
  private TOKEN_SECRET = '';
  private MONGO_CS = '';
  private ENTITIES: any[] = [];

  get entities() {
    return this.ENTITIES;
  }

  set entities(val) {
    this.ENTITIES = val;
  }

  addEntity(entity: any) {
    this.ENTITIES.push(entity);
  }

  get mongoCs() {
    return this.MONGO_CS;
  }

  set mongoCs(val) {
    this.MONGO_CS = val;
  }

  get tokenSecret() {
    return this.TOKEN_SECRET;
  }

  set tokenSecret(val) {
    this.TOKEN_SECRET = val;
  }
}

// Singleton class we have added below.
export default class LocalService {
  // Use the `Logger` type
  private static instance: service
  // Use a private constructor
  private constructor() { }
  // Ensure that there is only one instance created
  public static getInstance(): service {
    if (!LocalService.instance) {
      LocalService.instance = new service()
    }
    return LocalService.instance
  }
}