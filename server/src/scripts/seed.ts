// server/src/scripts/seed.ts
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import slugify from "slugify";
import { Product } from "../models/Product.model";
import { Category } from "../models/Category.model";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

const seedDatabase = async (): Promise<void> => {
    try {
        console.log("⏳ Connecting to Database...");
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to Database.");

        // 1. Clear existing collections
        console.log("🧹 Clearing existing data...");
        await Product.deleteMany({});
        await Category.deleteMany({});

        // 2. Create Top-Level Categories
        console.log("🌱 Seeding Categories...");
        const topCategoryNames = ["Electronics", "Clothing", "Home & Kitchen", "Books"];
        const createdTopCategories: any[] = [];

        for (const name of topCategoryNames) {
            const category = await Category.create({
                name,
                slug: slugify(name, { lower: true, strict: true }),
                description: faker.commerce.productDescription(),
                parent: null,
            });
            createdTopCategories.push(category);
        }

        // 3. Create Sub-Categories
        const subCategoryNames = [
            { name: "Smartphones", parentIdx: 0 },
            { name: "Laptops", parentIdx: 0 },
            { name: "Men's Apparel", parentIdx: 1 },
            { name: "Women's Apparel", parentIdx: 1 },
            { name: "Kitchen Appliances", parentIdx: 2 },
            { name: "Furniture", parentIdx: 2 },
        ];

        const allCategories = [...createdTopCategories];

        for (const sub of subCategoryNames) {
            const parentCat = createdTopCategories[sub.parentIdx];
            const category = await Category.create({
                name: sub.name,
                slug: slugify(sub.name, { lower: true, strict: true }),
                description: faker.commerce.productDescription(),
                parent: parentCat._id,
            });
            allCategories.push(category);
        }

        console.log(`✅ Seeded ${allCategories.length} categories.`);

        // 4. Create ~40 Products
        console.log("🌱 Seeding Products...");
        const products = [];

        for (let i = 0; i < 40; i++) {
            const name = faker.commerce.productName();
            const category = faker.helpers.arrayElement(allCategories);

            products.push({
                name,
                slug: slugify(`${name}-${faker.string.alphanumeric(4)}`, { lower: true, strict: true }),
                description: faker.commerce.productDescription(),
                price: parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })),
                stock: faker.number.int({ min: 0, max: 150 }),
                category: category._id,
                image: faker.image.url(),
                variants: [
                    { name: "Color", value: faker.color.human() },
                    { name: "Size", value: faker.helpers.arrayElement(["S", "M", "L", "XL"]) },
                ],
            });
        }

        await Product.insertMany(products);
        console.log(`✅ Seeded ${products.length} products successfully!`);

        await mongoose.connection.close();
        console.log("👋 Disconnected from DB. Seeding complete.");
        process.exit(0);
    } catch (error) {
        console.error("💥 Error during seeding:", error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

seedDatabase();