process.env.JWT_SECRET = 'test-secret-key';

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const prisma = require('../src/prismaClient');

let adminToken;
let userToken;

beforeAll(async () => {
    await prisma.sales.deleteMany({});
    await prisma.user.deleteMany({});

    // Admin Setup
    const adminHashed = await bcrypt.hash('adminpass', 10);
    const admin = await prisma.user.create({
        data: { email: 'admin_reports@test.com', password: adminHashed, name: 'Admin', role: 'ADMIN' }
    });
    const adminLogin = await request(app).post('/api/auth/login').send({ email: 'admin_reports@test.com', password: 'adminpass' });
    adminToken = adminLogin.headers['set-cookie'][0].split(';')[0].split('=')[1];

    // Regular User Setup
    const userHashed = await bcrypt.hash('userpass', 10);
    const user = await prisma.user.create({
        data: { email: 'user_reports@test.com', password: userHashed, name: 'User', role: 'USER' }
    });
    const userLogin = await request(app).post('/api/auth/login').send({ email: 'user_reports@test.com', password: 'userpass' });
    userToken = userLogin.headers['set-cookie'][0].split(';')[0].split('=')[1];

    // Create Mock Sales Data
    await prisma.sales.create({
        data: {
            userId: user.id,
            orderTotal: 100,
            status: 'PLACED',
            items: [{ sweetName: 'Ladoo', sweet: '67bcb22c4a91ac1d39b83bde', price: 10, quantity: 10, totalPrice: 100 }],
            createdAt: new Date() // Today
        }
    });

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 2); // Definitely past month (let's say 2 months to be safe)

    await prisma.sales.create({
        data: {
            userId: user.id,
            orderTotal: 50,
            status: 'PLACED',
            items: [{ sweetName: 'Barfi', sweet: '67bcb22c4a91ac1d39b83bde', price: 50, quantity: 1, totalPrice: 50 }],
            createdAt: lastMonth // 2 months ago
        }
    });

});

afterAll(async () => {
    await prisma.sales.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
});

describe('📊 Reports API', () => {

    test('NON-ADMIN GET /api/reports/sales - access denied', async () => {
        const res = await request(app)
            .get('/api/reports/sales')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/Admins only/i);
    });

    test('ADMIN GET /api/reports/sales?type=all - fetches all sales', async () => {
        const res = await request(app)
            .get('/api/reports/sales?type=all')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(2);
        expect(res.body.totalAmount).toBe(150); // 100 + 50
        expect(res.body.sales.length).toBe(2);
    });

    test('ADMIN GET /api/reports/sales?type=day - fetches only today sales', async () => {
        const res = await request(app)
            .get('/api/reports/sales?type=day')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        // Should only grab the 1 sale from today (100 total)
        expect(res.body.count).toBe(1);
        expect(res.body.totalAmount).toBe(100);
    });

});
