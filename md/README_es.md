[:arrow_backward: Atrás](..//README.md)

# spryjs :rocket:
Framework basado en JavaScript que permite el desarrollo rápido de API web.

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
}

export default Libro;
```
### Importar SpryJs e inicializar el servidor

El siguiente código creará los endpoints necesarios para las operaciones CRUD en `localhost:5000/api/manejolibros` teniendo el modelo `Libro` definido anteriormente

`index.ts`
```typescript
import SpryJs from "@codiks/spryjs";
import Libro from "./entidades/libros";
import { MONGO_CS } from "./constantes"

const app = new SpryJs();

/**Inizializar SpryJs */
app.init(5000).then(() => {
  /** Habilitar MongoDB. Se necesita enviar como parámetro la cadena de conexión de MongoDB */
  app.useMongo(MONGO_CS);

  /** Habilita el middleware Morgan */
  app.useMorgan();

  /** Registra una entidad. Esto creará los endpoints CRUD para la ruta /api/manejolibros
   * utilizando la entidad Libro para la persistencia de la información
   */
  
  app.registerEntity('Libro', Libro, 'manejolibros', 'nombre');
})
```
