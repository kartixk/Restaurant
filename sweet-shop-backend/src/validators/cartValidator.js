const { z } = require("zod");

const cartItemSchema = z.object({
    sweetId: z.string().min(1, "Sweet ID is required"),
    quantity: z.preprocess((val) => Number(val), z.number().int().min(1, "Quantity must be at least 1"))
});

const buyNowSchema = z.object({
    sweetId: z.string().min(1, "Sweet ID is required"),
    quantity: z.preprocess((val) => Number(val), z.number().int().min(1, "Quantity must be at least 1"))
});

const updateQuantitySchema = z.object({
    quantity: z.preprocess((val) => Number(val), z.number().int().min(1, "Quantity must be at least 1"))
});

module.exports = {
    cartItemSchema,
    buyNowSchema,
    updateQuantitySchema
};
