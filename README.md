# spryjs :rocket:
JavaScript-based framework that enables rapid development of Web API's.

### [:es: :page_facing_up: Español :point_left:](md/README_es.md)
Consulta la documentación en Español.

## Install

`npm i @codiks/spryjs`

## Description

### Register entities with a given model, full CRUD will be created
  * #### /api/entity   
    * GET 
    * POST
  * #### /api/entity/:id   
    * GET
    * DELETE
    * PUT

### Beta version. Current functionality
* Create express app listening on a given port.
* Mongoose library incoporated. Easy to configure
* Morgan middleware incorporated. 


Pending documentation.

## Basic usage

### Define a model for MongoDB
`entities/books/index.ts`
```typescript
export const Book = {
  name: String,
  description: String,
}

export default Book;
```
### Import SpryJs and initialize the server

The following code will create a full CRUD endpoint on `localhost:5000/api/bookmanagement` having the above Book model

`index.ts`
```typescript
import SpryJs from "@codiks/spryjs";
import Book from "./entities/book";
import { MONGO_CS } from "./constants"

const app = new SpryJs();

/**Initialize SpryJs */
app.init(5000).then(() => {
  /** Enable MongoDB. Need to pass connection string as a parameter*/
  app.useMongo(MONGO_CS);

  /** Enable morgan middleware */
  app.useMorgan();

  /** Register entity. This will create the CRUD endpoints for /bookmanagement 
   * using Book entity for persistance.
   */
  app.registerEntity('Book', Book, 'bookmanagement', 'name');
})
```

# :bomb: Important :bomb:
### English :us: 

This framework has been created given the repeated times this configuration was used in multiple projects for **rapid prototype development**. Even when this architecture has been used (and it's currently used) in production environments **further configuration might be required**. The intention of this framework is to allow new developers to easyly start developing Web API's without having to do a bunch of configurations.

---
### Español :es:

Este framework ha sido creado dadas las veces que esta configuración se usó en múltiples proyectos para **desarrollo rápido de prototipos**. Incluso cuando esta arquitectura se ha utilizado (y se utiliza actualmente) en entornos de producción, **es posible que se requiera una configuración adicional**. La intención de este marco es permitir que los nuevos desarrolladores comiencen a desarrollar fácilmente API web sin tener que hacer un montón de configuraciones.