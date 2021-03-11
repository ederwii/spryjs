[:arrow_backward: Atrás](..//README.md)

# spryjs :rocket:
Framework basado en JavaScript que permite el desarrollo rápido de API web.

## Ejemplo
Echa un vistazo al repositorio [spryjs-example](https://github.com/ederwii/spryjs-example) para un ejemplo completo.

## Instalación

`npm i @codiks/spryjs`

## Descripción

### Registra una entidad con un modelo dado. Se crearán todas las operaciones CRUD

  * #### /api/entidad   
    * GET 
    * POST
  * #### /api/entidad/:id   
    * GET
    * DELETE
    * PUT

### Versión beta. Funcionalidad actual
* Crear aplicaciones express escuchando en el puerto configurado
* Librería mongoose incorporada. Fácil de configurar
* Middleware Morgan incorporado.

Documentación pendiente

## Uso básico

### Define un modelo a usar
`entidades/libros/index.ts`
```typescript
export const Libro = {
  nombre: String,
  descripcion: String,
  code: String
}

export default Libro;
```
### Importar SpryJs e inicializar el servidor

El siguiente código creará los endpoints necesarios para las operaciones CRUD en `localhost:5000/api/manejolibros` teniendo el modelo `Libro` definido anteriormente

`index.ts`
```typescript
import SpryJs from "@codiks/spryjs";
import Libro from "./entidades/libros";
import { MONGO_CS, TOKEN_SECRET, SALT, PORT } from "./constants"

const app = new SpryJs();

/**Inizializar SpryJs */
app.init(5000).then(() => {
  /** Habilitar MongoDB. Se necesita enviar como parámetro la cadena de conexión de MongoDB */
  app.useMongo(MONGO_CS);

  /** Habilita el middleware Morgan */
  app.useMorgan();

  /** Enable authentication. This will create the /api/user endpoint with the default user schema
   * (username, password). POST action will act as the register endpoint. The body must contain a JSON object
   * with username and password variables. Once registered, 
   */
  spryjs.useAuthentication(`${TOKEN_SECRET}`, `${SALT}`);

  /** Registra una entidad. Esto creará los endpoints CRUD para la ruta /api/bm
   * utilizando la entidad Libro para la persistencia de la información
   */
  
   let bookConfig: EntityConfig = {
    name: 'Book',
    model: Book,
    path: 'bm',
    keyword: 'code',
    config: {
      /** Let's protect some endpoints to only authorized users.
       * All other endpoints not mentioned in auth object will be non-protected
       * and will not require a token in the authorization header
      */
      auth: {
        post: true,
        delete: true,
        put: true
      }
    }
  }
  spryjs.registerEntity(bookConfig).then(() => {
  })
})
```
