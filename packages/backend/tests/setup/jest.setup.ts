import '@jest/globals';
import { connectTestDatabase, clearTestDatabase, closeTestDatabase } from './testDatabase';

// Connect to the test database before all tests
beforeAll(async () => {
  await connectTestDatabase();
});

// Clear the database before each test (isolated tests)
beforeEach(async () => {
  await clearTestDatabase();
});

// Close database connection after all tests
afterAll(async () => {
  await closeTestDatabase();
});
