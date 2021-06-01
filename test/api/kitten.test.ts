import { initMongo, removeAllCollections } from "../setup";
import Spry from "../../src/index";
import { Application } from "express-serve-static-core";
import request from 'supertest';
import { GetResponseType } from "../../src";
import userTest from "../resources/user-test";
import { kittySchema, IKitten, IKittenDTO } from "../resources/kitten";

let cats: IKittenDTO[] = [
  { name: 'B' },
  { name: 'C', age: 10 },
  { name: 'A', age: 20 },
  { name: 'D', age: 20 },
  { name: 'F', age: 20 },
  { name: 'G', age: 20 },
  { name: 'H', age: 20 },
  { name: 'I', age: 20 },
  { name: 'J', age: 20 },
  { name: 'K', age: 20 },
  { name: 'L', age: 20 },
  { name: 'M', age: 20 },
  { name: 'N', age: 20 },
  { name: 'O', age: 20 },
  { name: 'P', age: 20 },
  { name: 'Q', age: 20 },
  { name: 'R', age: 20 },
  { name: 'S', age: 20 },
  { name: 'T', age: 20 },
  { name: 'U', age: 20 },
  { name: 'V', age: 20 },
  { name: 'W', age: 20 },
  { name: 'X', age: 20 },
  { name: 'Y', age: 20 },
  { name: 'Z', age: 20 },
]

let complexCats: IKittenDTO[] = [
  {
    name: 'Fernando',
    hobbies: ['play', 'eat'],
    age: 5
  }, {
    name: 'Felix',
    hobbies: ['play', 'eat'],
    age: 5
  }, {
    name: 'Ted',
    hobbies: ['play', 'eat'],
    age: 5
  }, {
    name: 'Jaina',
    hobbies: ['play', 'eat'],
    age: 5
  }, {
    name: 'Roberto',
    hobbies: ['play', 'eat'],
    age: 5
  }, {
    name: 'Mauricio',
    hobbies: ['play', 'eat'],
    age: 5
  }, {
    name: 'Ernesto',
    hobbies: ['play', 'eat'],
    age: 5
  }, {
    name: 'Juan',
    hobbies: ['play', 'eat'],
    age: 5
  }
]

let app: Application;



beforeAll(async () => {
  await initMongo();
  app = await Spry.initTest().then(async (app) => {
    return app;
  })

  await Spry.useAuthentication({
    tokenSecret: 'test',
    salt: 'test',
    model: userTest
  });

  /* {
  name: string,
  model?: any,
  path?: string,
  keyword?: string,
  service?: ServiceType<any>,
  config: ConfigType,
  routes?: any[]
} */

  await Spry.registerEntity({
    name: 'kitten',
    schema: kittySchema,
    keyword: 'name'
  })

  await removeAllCollections();
})

afterAll(async () => {
  await removeAllCollections();
})


describe('Kitten integration test', () => {
  test('Meow', () => {
    expect('meow').toEqual('meow');
  })

  test('Api endpoint exists', async () => {
    await request(app)
      .get('/api/kitten')
      .expect(200)
      .then(res => {
        const body = res.body as GetResponseType;
        expect(body.items.length).toEqual(0);
        expect(body.total).toEqual(0);
      })
  })

  test('POST', async () => {
    const id = await postCat({ name: 'Ted', age: 100 });

    expect(id).not.toBeUndefined()

    const kitten = await request(app)
      .get(`/api/kitten/${id}`)
      .expect(200)
      .then(res => res.body);

    const schema: any = {
      age: 'number',
      _id: 'string',
      name: 'string',
      __v: 'number'
    }
    Object.keys(schema).forEach(k => {
      expect(kitten).toHaveProperty(k);
      expect(typeof kitten[k]).toEqual(schema[k]);
    })
  })

  test('Smart query: Sort & items per page', async () => {
    await removeAllCollections();

    cats.forEach(async c => await postCat(c));

    const kittens: GetResponseType = await request(app)
      .get('/api/kitten')
      .expect(200)
      .then(response => {
        return response.body;
      })

    expect(kittens.total).toEqual(25);
    expect(kittens.items.length).toEqual(5);
    expect(kittens.items[0].name).toEqual('B');
    expect(kittens.items[1].name).toEqual('C');
    expect(kittens.items[2].name).toEqual('A');

    const sorted: GetResponseType = await request(app)
      .get('/api/kitten?sortBy=name&ipp=10')
      .expect(200)
      .then(response => {
        return response.body;
      })
    expect(sorted.items.length).toEqual(10);
    expect(sorted.items[0].name).toEqual('A');
    expect(sorted.items[1].name).toEqual('B');
    expect(sorted.items[2].name).toEqual('C');

    const ageSorted: GetResponseType = await request(app)
      .get('/api/kitten?sortBy=age')
      .expect(200)
      .then(response => {
        return response.body;
      })

    expect(ageSorted.items[0].age).toEqual(0);
    expect(ageSorted.items[1].age).toEqual(10);
    expect(ageSorted.items[2].age).toEqual(20);

    const descSorted: GetResponseType = await request(app)
      .get('/api/kitten?sortBy=name,age&sortDesc=true')
      .expect(200)
      .then(response => {
        return response.body;
      })

    expect(descSorted.items[0].name).toEqual('Z');
    expect(descSorted.items[1].name).toEqual('Y');
    expect(descSorted.items[2].name).toEqual('X');

    const ipp: GetResponseType = await request(app)
      .get('/api/kitten?sortBy=name&sortDesc=true&ipp=10&page=3')
      .expect(200)
      .then(response => {
        return response.body;
      })

    expect(ipp.items.length).toEqual(5); // last 5 items because we are looking for page 3
    expect(ipp.items.find(x => x.name === 'Z')).toBeUndefined();
    expect(ipp.items.find(x => x.name === 'A')).not.toBeUndefined();
  })

  test('Smart query: Fields', async () => {
    await removeAllCollections();

    complexCats.forEach(async c => await postCat(c));

    const partialKittens: GetResponseType = await request(app)
      .get('/api/kitten?fields=name,age')
      .expect(200)
      .then(response => {
        return response.body;
      })

    partialKittens.items.forEach((k: Partial<IKitten>) => {
      expect(k).not.toHaveProperty('hobbies');
      expect(k).not.toHaveProperty('updatedAt');
      expect(k).not.toHaveProperty('createdAt');
    })

    const kittens: GetResponseType = await request(app)
      .get('/api/kitten')
      .expect(200)
      .then(response => {
        return response.body;
      })

    kittens.items.forEach((k: Partial<IKitten>) => {
      expect(k).toHaveProperty('hobbies');
      expect(k).toHaveProperty('updatedAt');
      expect(k).toHaveProperty('createdAt');
    })
  })

  test('Smart query: Search', async () => {
    await removeAllCollections();

    complexCats.forEach(async c => await postCat(c));

    const kitten: GetResponseType = await request(app)
      .get('/api/kitten?search=name:ed&fields=name')
      .expect(200)
      .then(response => {
        return response.body;
      })

    expect(kitten.items.length).toEqual(1);
    expect(kitten.total).toEqual(8);
    const ted = kitten.items[0];
    expect(ted).not.toHaveProperty('age');
    expect(ted).toHaveProperty('name');
    expect(ted.name).toEqual('Ted');

    const kittens: GetResponseType = await request(app)
      .get('/api/kitten?search=name:fe&fields=name&sortBy=name&sortDesc=true')
      .expect(200)
      .then(response => {
        return response.body;
      })

    expect(kittens.items.length).toEqual(2);
    expect(kittens.items[0].name).toEqual('Fernando');
    expect(kittens.items[1].name).toEqual('Felix');

    const exactSearch: GetResponseType = await request(app)
      .get('/api/kitten?esearch=name:fe&fields=name&sortBy=name&sortDesc=true')
      .expect(200)
      .then(response => {
        return response.body;
      })

    expect(exactSearch.items.length).toEqual(0);

    const exactSearch2: GetResponseType = await request(app)
      .get('/api/kitten?esearch=name:ted&fields=name&sortBy=name&sortDesc=true')
      .expect(200)
      .then(response => {
        return response.body;
      })

    expect(exactSearch2.items.length).toEqual(0);
  })
})

async function postCat(cat: any) {
  return await request(app)
    .post('/api/kitten')
    .send(cat)
    .expect(200)
    .then(res => {
      expect(res.body).toHaveProperty('_id');
      expect(res.body._id).not.toBeNull();
      return res.body._id;
    })
}