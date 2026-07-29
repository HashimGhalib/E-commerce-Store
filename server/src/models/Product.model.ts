import { Schema, model } from "mongoose";
import { IProduct, IProductVariant } from "shared";
import slugify from "slugify";

const variantSchema = new Schema<IProductVariant>(
    {
        name: { type: String, required: true },
        value: [{ type: String, required: true }],
        stock: { type: Number, required: true, min: 0, default: 0 }
    },
    { _id: false }
);



const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        images: [{
            type: String,
            required: true
        }],
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            index: true
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        variants: [variantSchema]
    },
    { timestamps: true }
);

// Auto-generate slug before validation if name changes or slug is missing
productSchema.pre("validate", async function () {
    if (this.isModified("name") || !this.slug) {
        this.slug = slugify(this.name, { lower: true, strict: true, trim: true });
    }
});

// Early text index for search support
productSchema.index({ name: "text", description: "text" });

export const Product = model<IProduct>("Product", productSchema);