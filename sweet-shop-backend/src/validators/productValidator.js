const { z } = require("zod");

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.preprocess((val) => Number(val), z.number().positive("Price must be a positive number")),
    category: z.string().min(1, "Category is required"),
    quantity: z.preprocess((val) => Number(val), z.number().int().nonnegative("Quantity cannot be negative")),
    imageUrl: z.string().url("Invalid image URL"),
    branchId: z.string().length(24, "Invalid Branch ID")
});

const productUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    price: z.preprocess((val) => Number(val), z.number().positive()).optional(),
    category: z.string().min(1).optional(),
    quantity: z.preprocess((val) => Number(val), z.number().int().nonnegative()).optional(),
    imageUrl: z.string().url().optional(),
    branchId: z.string().length(24).optional()
});

const purchaseSchema = z.object({
    quantity: z.preprocess((val) => Number(val), z.number().int().positive("Purchase quantity must be at least 1"))
});

const restockSchema = z.object({
    quantity: z.preprocess((val) => Number(val), z.number().int().positive("Restock quantity must be at least 1"))
});

module.exports = {
    productSchema,
    productUpdateSchema,
    purchaseSchema,
    restockSchema
};
