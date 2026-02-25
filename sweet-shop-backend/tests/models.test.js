const { sweetSchema } = require('../src/validators/sweetValidator');
const { registerSchema } = require('../src/validators/authValidator');

describe('Schema validation (Zod replacing Mongoose)', () => {

  test('User missing name is valid, but missing email fails', () => {
    const result = registerSchema.safeParse({ password: '123' });
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors).toHaveProperty('email');
  });

  test('Sweet negative price fails', () => {
    const s = {
      name: 'Bad Sweet',
      category: 'Milk',
      price: -10,
      quantity: 5,
      imageUrl: 'http://example.com/bad.jpg'
    };

    const result = sweetSchema.safeParse(s);
    expect(result.success).toBe(false);
    expect(result.error.flatten().fieldErrors).toHaveProperty('price');
  });

  test('Sweet valid data passes', () => {
    const s = {
      name: 'Ladoo',
      category: 'Milk',
      price: 20,
      quantity: 3,
      imageUrl: 'http://example.com/ladoo.jpg'
    };

    const result = sweetSchema.safeParse(s);
    expect(result.success).toBe(true);
  });
});
