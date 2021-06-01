import { initMongo, removeAllCollections } from "../setup";
import Spry from "../../src/index";
import { Application } from "express-serve-static-core";
import request from 'supertest';
import { GetResponseType, IIdentity } from "../../src";
import userTest from "../resources/user-test";

let app: Application;

const userData = {
  username: 'test',
  password: 'test'
}

let token: string | undefined = undefined;
let userId: string | undefined = undefined;

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

  await removeAllCollections();
})

afterAll(async () => {
  await removeAllCollections();
})

describe('ControllerFactory', () => {
  test('Application', () => {
    app.get('/user', function (_req, res) {
      res.status(200).json({ name: 'john' });
    });

    request(app)
      .get('/user')
      .expect('Content-Type', /json/)
      .expect('Content-Length', '15')
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
        expect(res.body).toEqual({ name: 'john' })
      });
  })
})

describe('Identity', () => {
  test('Endpoint exists', async () => {
    await request(app)
      .get('/api/user')
      .expect(200)
      .then(res => {
        const body = res.body as GetResponseType;
        expect(body.items.length).toEqual(0);
        expect(body.total).toEqual(0);
      })
  })

  test('Create user', async () => {
    const user = await postUser(userData);
    expect(user).toHaveProperty('_id');
    expect(user._id).not.toBeNull();
    userId = user._id;
    await request(app)
      .get('/api/user')
      .expect(200)
      .then(res => {
        const body = res.body as GetResponseType;
        expect(body.items.length).toEqual(1);
        expect(body.total).toEqual(1);
        const user = body.items[0] as IIdentity;
        expect(user.username).toEqual(userData.username);
        expect(user.password).not.toEqual(userData.password);
      })
  })

  test('Login', async () => {
    expect(token).toBeUndefined();
    await login(userData.username, userData.password);
    expect(token).not.toBeUndefined();
  })

  test('Change password', async () => {
    expect(token).not.toBeUndefined();
    token && await request(app)
      .post('/api/user/password')
      .set('Authorization', 'bearer ' + token)
      .send({ password: userData.password, newPassword: 'test2' })
      .expect(200)
      .then(() => {
        userData.password = 'test2'
      })

    const fail = await login(userData.username, 'test', false);
    expect(fail).toBeUndefined();
    const success = await login(userData.username, userData.password);
    expect(success).not.toBeUndefined();
  })

  test('Update user', async () => {
    let user = await request(app)
      .get(`/api/user/${userId}`)
      .set('Authorization', 'bearer ' + token)
      .expect(200)
      .then(response => response.body);

    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('password');
    expect(user).toHaveProperty('failedAttempts');
    expect(user).toHaveProperty('lastSignIn');

    expect(user).not.toHaveProperty('meta');

    await request(app)
      .put(`/api/user/${userId}`)
      .set('Authorization', 'bearer ' + token)
      .send({
        username: 'newUsername',
        name: 'alan',
        lastName: 'martinez',
        'meta.checked': true,
        invalidField: 'invalidValue'
      })
      .expect(200)
      .then(response => response.body);

    user = await request(app)
      .get(`/api/user/${userId}`)
      .set('Authorization', 'bearer ' + token)
      .expect(200)
      .then(response => response.body);

    expect(user.username).toEqual('test');
    expect(user).toHaveProperty('meta');
    expect(user).toHaveProperty('lastName');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('meta.checked');
    expect(user).not.toHaveProperty('meta.age');
    expect(user).not.toHaveProperty('invalidField');
  })

  test('User should block after failed attempts', async () => {
    const userToBlock = await postUser({ username: 'userToBlock', password: 'password' });
    await login('userToBlock', 'password');
    await login('userToBlock', '', false);
    await login('userToBlock', '', false);
    await login('userToBlock', '', false);
    await login('userToBlock', '', false);
    await login('userToBlock', '', false);
    await login('userToBlock', '', false);
    await login('userToBlock', '', false);
    await login('userToBlock', 'password', false);

    await login(userData.username, userData.password);
    let user = await request(app)
      .get(`/api/user/${userToBlock._id}`)
      .set('Authorization', 'bearer ' + token)
      .expect(200)
      .then(response => response.body);

    expect(user).toHaveProperty('isLocked');
    expect(user.isLocked).toEqual(true);
  })

  test('Delete user', async () => {
    await login(userData.username, userData.password);
    expect(token).not.toBeUndefined();

    await request(app)
      .delete(`/api/user/${userId}`)
      .set('Authorization', 'bearer ' + token)
      .expect(200)
      .then(response => response.body);

    await login(userData.username, userData.password, false);
    expect(token).toBeUndefined();
  })

  function postUser(payload: Partial<IIdentity>): Promise<any> {
    return new Promise((resolve, _rej) => {
      request(app)
        .post('/api/user')
        .send(payload)
        .expect(200)
        .then(res => {
          const body = res.body as any;
          resolve(body);
        })
    })
  }

  async function login(username: string, password: string, expectedResult = true) {
    token = await request(app)
      .post('/api/user/login')
      .send({ username, password })
      .expect(expectedResult ? 200 : 401)
      .then(res => {
        expectedResult && expect(res.body).toHaveProperty('token');
        expectedResult && expect(res.body.token).not.toBeNull();
        return expectedResult ? res.body.token : undefined;
      })

    return token;
  }
})