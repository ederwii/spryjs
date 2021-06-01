import { initMongo, removeAllCollections } from "../setup";
import Spry from "../../src/index";
import { Application } from "express-serve-static-core";
import request from 'supertest';
import { GetResponseType } from "../../src";
import userTest from "../resources/user-test";
import Kitten, { kittySchema } from "../resources/kitten";
import KittenCustomService from "../resources/kitten.custom.service";

const service = new KittenCustomService(Kitten);



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
    keyword: 'name',
    service,
    routes: [{
      route: 'custom',
      cb: () => {
        return { message: 'Hello world' }
      },
      verb: "GET"
    }]
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

  test('Custom service', async () => {
    const id = await postCat({ name: 'Ted', age: 100 });

    expect(id).not.toBeUndefined()

    const kitten = await request(app)
      .get(`/api/kitten/${id}`)
      .expect(200)
      .then(res => res.body);

    expect(kitten.name).toEqual('Ted spry');
  })

  test('Custom service: custom route', async () => {
    const response = await request(app)
      .get(`/api/kitten/custom`)
      .expect(200)
      .then(res => res.body);

    expect(response).toHaveProperty('message');
    expect(response.message).toEqual('Hello world');
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