process.env.JWT_SECRET = 'test-secret-key';

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const prisma = require('../src/prismaClient');

let adminToken;
let userToken;
let sweetId;

beforeAll(async () => {
  await prisma.sales.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.sweet.deleteMany({});
  await prisma.user.deleteMany({});

  // Setup Admin
  const adminHashed = await bcrypt.hash('adminpass', 10);
  await prisma.user.create({
    data: { email: 'admin@test.com', password: adminHashed, name: 'Admin', role: 'ADMIN' }
  });

  const adminLogin = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'adminpass' });
  adminToken = adminLogin.headers['set-cookie'][0].split(';')[0].split('=')[1];

  // Setup Regular User
  const userHashed = await bcrypt.hash('userpass', 10);
  await prisma.user.create({
    data: { email: 'user@test.com', password: userHashed, name: 'User', role: 'USER' }
  });

  const userLogin = await request(app).post('/api/auth/login').send({ email: 'user@test.com', password: 'userpass' });
  userToken = userLogin.headers['set-cookie'][0].split(';')[0].split('=')[1];
});

afterAll(async () => {
  await prisma.sales.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.sweet.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
});

describe('🍬 Sweets API - Comprehensive', () => {

  test('Regular USER cannot create a sweet', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Illegal Sweet',
        category: 'Milk',
        price: 50,
        quantity: 10,
        imageUrl: 'http://example.com/sweet.jpg'
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Admin required/i);
  });

  test('ADMIN POST /api/sweets - create sweet', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Gulab Jamun',
        category: 'Milk',
        price: 50,
        quantity: 10,
        imageUrl: 'http://example.com/gulab.jpg'
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Gulab Jamun');
    sweetId = res.body._id || res.body.id;
  });

  test('ADMIN POST /api/sweets - upsert existing sweet updates it', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Gulab Jamun', // Same name
        category: 'Milk',
        price: 60, // Changed
        quantity: 20, // Changed
        imageUrl: 'http://example.com/gulab.jpg'
      });

    expect(res.status).toBe(201);
    expect(res.body.price).toBe(60);
    expect(res.body.quantity).toBe(20);
  });

  test('GET /api/sweets - list sweets', async () => {
    const res = await request(app).get('/api/sweets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  test('ADMIN PUT /api/sweets/:id - edit sweet', async () => {
    const res = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 70 });

    expect(res.status).toBe(200);

    // N-tier update returns the updated object directly
    expect(res.body.price).toBe(70);
  });

  test('POST /api/sweets/:id/purchase - purchase sweet successfully', async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(200);

    const updated = await prisma.sweet.findUnique({ where: { id: sweetId } });
    expect(updated.quantity).toBe(15); // 20 - 5
  });

  test('POST /api/sweets/:id/purchase - insufficient stock returns 400', async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 50 }); // Only 15 left

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/insufficient stock/i);
  });

  test('ADMIN POST /api/sweets/:id/restock', async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(200);
    const updated = await prisma.sweet.findUnique({ where: { id: sweetId } });
    expect(updated.quantity).toBe(25); // 15 + 10
  });

  test('USER POST /api/sweets/:id/restock - access denied', async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(403);
  });

  test('USER DELETE /api/sweets/:id - access denied', async () => {
    const res = await request(app)
      .delete(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  test('ADMIN DELETE /api/sweets/:id - works', async () => {
    const res = await request(app)
      .delete(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const check = await prisma.sweet.findUnique({ where: { id: sweetId } });
    expect(check).toBeNull();
  });
});
