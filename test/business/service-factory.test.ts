import { ServiceFactory } from "../../src";
import { initMongo, removeAllCollections } from "../setup";
import Kitten, { IKitten } from "../resources/kitten";

beforeAll(async () => {  
  await initMongo();
  await removeAllCollections();
})

afterEach(async () => {
  await removeAllCollections();
})

describe('ServiceFactory', () => {
  let service = new ServiceFactory<IKitten>(Kitten, 'name');
  test('Saves a entity and validate GetCount', async () => {
    await saveCat().then((id) => {
      expect(id).not.toBeNull();
    })

    const count = await service.GetCount();
    expect(count).toBe(1);
  })

  test('Should fail creating a duplicated entity', async () => {
    expect.assertions(3);
    await saveCat().then((id) => {
      expect(id).not.toBeNull();
    })

    await saveCat().then((id) => {
      expect(id).not.toBeNull();
    }).catch((err) => {
      expect(err).toBe('There is alredy an object in the database with the same key field. Entity: Kitten. Field: name, Value: ted');
    })

    const count = await service.GetCount();
    expect(count).toBe(1);
  })

  test('Should create more than 1 entity', async () => {
    await saveCat();
    await saveCat('ted 2');
    const count = await service.GetCount();
    expect(count).toBe(2);
  })

  test('Update an entity', async () => {
    expect.assertions(2);
    const id = await saveCat();
    let cat = await service.GetById(id);
    expect(cat.name).toBe('ted');

    await service.Update(id, { name: 'jaina' });

    cat = await service.GetById(id);
    expect(cat.name).toBe('jaina');
  })

  test('Delete an entity', async () => {
    expect.assertions(3);
    const id = await saveCat();
    let cat = await service.GetById(id);
    expect(cat).not.toBeNull();
    const deleted = await service.Delete(id);
    expect(deleted).toBeTruthy();
    cat = await service.GetById(id);
    expect(cat).toBeNull();
  })

  test('Get entity by keyword', async() => {
    expect.assertions(2);
    await saveCat();
    let res = await service.GetByKeyword('e');
    expect(res.length).toBe(1);
    res = await service.GetByKeyword('a');
    expect(res.length).toBe(0);
  })

  function saveCat(name = 'ted'): Promise<string> {
    return service.Create({
      name
    })
  }
})

