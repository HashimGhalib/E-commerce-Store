import { Schema, model, Types } from "mongoose";
import { ICategory } from "shared";
import slugify from "slugify";


const categorySchema = new Schema<ICategory>(
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
            trim: true
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            default: null,
            index: true
        },
    },
    { timestamps: true }
);


// Auto-generate slug before validation if name changes or slug is missing
categorySchema.pre("validate", async function () {
    if (this.isModified("name") || !this.slug) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            trim: true,
        });
    }
});

export const Category = model<ICategory>("Category", categorySchema);