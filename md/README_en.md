[:arrow_backward: Go Back](..//README.md)

# spryjs :rocket:
JavaScript-based framework that enables rapid development of Web API's.

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
