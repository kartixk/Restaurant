// Tests will run with a test generated JWT Secret and point to the generated URIs
process.env.JWT_SECRET = 'test-secret-key';

// Mock Prisma Client to enforce using the dynamic in-memory URL
jest.mock('../src/prismaClient', () => {
    const { PrismaClient } = require('@prisma/client');
    return new PrismaClient({
        datasources: {
            db: {
                // Must pull from what globalSetup sets on process env
                url: process.env.DATABASE_URL
            }
        }
    });
});
