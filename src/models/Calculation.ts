import mongoose, { Schema, Document } from "mongoose";
import type {
  CalculationResult,
  ResourceInfo,
  StorageInfo,
  CraftingStep,
  CalculationMetadata,
} from "../types/calculation.types";

export interface CalculationDocument
  extends Omit<CalculationResult, "id">,
    Document {
  _id: string;
  userId: Schema.Types.ObjectId;
  name: string;
  targetItems: Record<string, number>;
}

const ResourceInfoSchema = new Schema<ResourceInfo>(
  {
    needed: { type: Number, required: true },
    stacks: { type: Number, required: true },
    remainder: { type: Number, required: true },
    source: {
      type: String,
      enum: ["base", "crafted", "smelted", "brewed"],
      required: true,
    },
    alternativeRoutes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Recipe",
      },
    ],
  },
  { _id: false }
);

const StorageInfoSchema = new Schema<StorageInfo>(
  {
    totalStacks: { type: Number, required: true },
    totalItems: { type: Number, required: true },
    containers: {
      regularChests: { type: Number, required: true },
      doubleChests: { type: Number, required: true },
      shulkerBoxes: { type: Number, required: true },
      barrels: { type: Number, required: true },
    },
    estimatedTime: { type: String, required: true },
  },
  { _id: false }
);

const CraftingStepSchema = new Schema<CraftingStep>(
  {
    stepNumber: { type: Number, required: true },
    item: { type: String, required: true },
    displayName: { type: String, required: true },
    quantity: { type: Number, required: true },
    recipe: {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    requiredIngredients: {
      type: Map,
      of: Number,
      required: true,
    },
    craftingTime: { type: Number },
    experience: { type: Number },
  },
  { _id: false }
);

const CalculationMetadataSchema = new Schema<CalculationMetadata>(
  {
    totalRecipes: { type: Number, required: true },
    optimizationRoutes: { type: Number, required: true },
    processingTime: { type: Number, required: true },
    cacheHits: { type: Number, required: true },
    warnings: [String],
  },
  { _id: false }
);

const CalculationSchema = new Schema<CalculationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    targetItems: {
      type: Map,
      of: Number,
      required: true,
    },
    baseResources: {
      type: Map,
      of: ResourceInfoSchema,
      required: true,
    },
    storageInfo: {
      type: StorageInfoSchema,
      required: true,
    },
    craftingSteps: [CraftingStepSchema],
    metadata: {
      type: CalculationMetadataSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        // Convert Maps to Objects for JSON
        if (ret.targetItems instanceof Map) {
          ret.targetItems = Object.fromEntries(ret.targetItems);
        }
        if (ret.baseResources instanceof Map) {
          ret.baseResources = Object.fromEntries(ret.baseResources);
        }
        return ret;
      },
    },
  }
);

// Indexes
CalculationSchema.index({ userId: 1, createdAt: -1 });
CalculationSchema.index({ name: 1, userId: 1 });

export const CalculationModel = mongoose.model<CalculationDocument>(
  "Calculation",
  CalculationSchema
);
export default CalculationModel;
