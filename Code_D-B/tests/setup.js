const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  process.env.JWT_SECRET = 'test-jwt-secret-key-1234567890';
  process.env.JWT_EXPIRE = '1h';
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-12345';
  process.env.JWT_REFRESH_EXPIRE = '7d';

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});
