import mongoose, { Schema, Document } from "mongoose";
import type { Recipe, RecipeType } from "../types/recipe.types";

export interface RecipeDocument extends Omit<Recipe, "id">, Document {
  _id: string;
}

const RecipeSchema = new Schema<RecipeDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "crafting",
        "smelting",
        "brewing",
        "smithing",
        "stonecutting",
        "custom",
      ],
      required: true,
      index: true,
    },
    ingredients: {
      type: Map,
      of: Number,
      required: true,
    },
    result: {
      item: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
    modSource: {
      type: String,
      required: true,
      default: "minecraft",
      index: true,
    },
    version: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        // Convert Map to Object for JSON
        if (ret.ingredients instanceof Map) {
          ret.ingredients = Object.fromEntries(ret.ingredients);
        }
        return ret;
      },
    },
  }
);

// Indexes for performance
RecipeSchema.index({ name: 1, modSource: 1 });
RecipeSchema.index({ "result.item": 1 });
RecipeSchema.index({ type: 1, modSource: 1 });

export const RecipeModel = mongoose.model<RecipeDocument>(
  "Recipe",
  RecipeSchema
);
export default RecipeModel;
