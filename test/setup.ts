import mongoose from 'mongoose';
const databaseName = 'mongoose-test-jest'
const url = `mongodb://127.0.0.1/${databaseName}`

export const initMongo = async () => {
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => await removeAllCollections())
}

export const removeAllCollections = async () => {
  const collections = Object.keys(mongoose.connection.collections)
  for (const collectionName of collections) {
    const collection: any = mongoose.connection.collections[collectionName]
    await collection.deleteMany()
  }
}