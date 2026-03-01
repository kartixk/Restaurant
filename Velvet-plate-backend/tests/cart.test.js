process.env.JWT_SECRET = 'test-secret-key';

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const prisma = require('../src/prismaClient');

let userToken;
let sweetId;

beforeAll(async () => {
    await prisma.sales.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.sweet.deleteMany({});
    await prisma.user.deleteMany({});

    const hashed = await bcrypt.hash('userpass', 10);
    await prisma.user.create({
        data: { email: 'cartuser@test.com', password: hashed, name: 'Cart User', role: 'USER' }
    });

    const login = await request(app).post('/api/auth/login').send({ email: 'cartuser@test.com', password: 'userpass' });
    userToken = login.headers['set-cookie'][0].split(';')[0].split('=')[1];

    // Create sweet directly in DB for cart tests
    const sweet = await prisma.sweet.create({
        data: {
            name: 'Rasgulla',
            category: 'Milk',
            price: 15,
            quantity: 50,
            imageUrl: 'http://example.com/rasgulla.jpg'
        }
    });
    sweetId = sweet.id;
});

afterAll(async () => {
    await prisma.sales.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.sweet.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
});

describe('🛒 Cart API', () => {

    test('GET /api/cart - fetches empty cart initially', async () => {
        const res = await request(app)
            .get('/api/cart')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.items).toEqual([]);
        expect(res.body.total).toBe(0);
    });

    test('POST /api/cart/items - adds new item to cart', async () => {
        const res = await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ sweetId, quantity: 5 });

        expect(res.status).toBe(200);
        expect(res.body.items.length).toBe(1);
        expect(res.body.items[0].sweet).toBe(sweetId);
        expect(res.body.items[0].selectedQuantity).toBe(5);
        expect(res.body.total).toBe(15 * 5); // 75
    });

    test('POST /api/cart/items - adding duplicate item updates quantity in cart (upsert)', async () => {
        // In our service logic, we defined addOrUpdateItem to REPLACE selectedQuantity if it exists
        const res = await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ sweetId, quantity: 10 });

        expect(res.status).toBe(200);
        expect(res.body.items.length).toBe(1); // Still 1 item
        expect(res.body.items[0].selectedQuantity).toBe(10); // Replaced, not added
        expect(res.body.total).toBe(15 * 10); // 150
    });

    test('PUT /api/cart/items/:id - explicitly updates quantity', async () => {
        const res = await request(app)
            .put(`/api/cart/items/${sweetId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ quantity: 20 });

        expect(res.status).toBe(200);
        expect(res.body.items[0].selectedQuantity).toBe(20);
        expect(res.body.total).toBe(15 * 20); // 300
    });

    test('PUT /api/cart/items/:id - fails if quantity > stock', async () => {
        const res = await request(app)
            .put(`/api/cart/items/${sweetId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ quantity: 60 }); // Only 50 in stock

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Insufficient stock/i);
    });

    test('DELETE /api/cart/items/:id - removes item from cart', async () => {
        const res = await request(app)
            .delete(`/api/cart/items/${sweetId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.items.length).toBe(0);
        expect(res.body.total).toBe(0);
    });

    test('POST /api/cart/confirm - fails on empty cart', async () => {
        const res = await request(app)
            .post('/api/cart/confirm')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Cart is empty/i);
    });

    test('POST /api/cart/confirm - successfully processes cart to sale', async () => {
        // 1. Add item to cart
        await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ sweetId, quantity: 10 });

        // 2. Confirm order
        const res = await request(app)
            .post('/api/cart/confirm')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/Order confirmed/i);

        // 3. Verify Sweet Stock is decremented
        const sweet = await prisma.sweet.findUnique({ where: { id: sweetId } });
        expect(sweet.quantity).toBe(40); // 50 - 10

        // 4. Verify Cart is Empty
        const cart = await prisma.cart.findFirst({ where: { user: { email: 'cartuser@test.com' } } });
        expect(cart.items.length).toBe(0);

        // 5. Verify Sales Record Created
        const sale = await prisma.sales.findFirst({ where: { user: { email: 'cartuser@test.com' } } });
        expect(sale).toBeTruthy();
        expect(sale.orderTotal).toBe(150); // 10 * 15
    });

});
