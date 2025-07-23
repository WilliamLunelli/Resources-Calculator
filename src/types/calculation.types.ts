import type { Recipe } from "./recipe.types";

export interface CalculationRequest {
  targetItems: Record<string, number>; // { itemId: quantity }
  modpackId?: string;
  optimizationLevel?: OptimizationLevel;
}

export interface CalculationResult {
  id?: string;
  baseResources: Record<string, ResourceInfo>;
  storageInfo: StorageInfo;
  craftingSteps: CraftingStep[];
  metadata: CalculationMetadata;
}

export interface ResourceInfo {
  needed: number;
  stacks: number;
  remainder: number;
  source: ResourceSource;
  alternativeRoutes?: Recipe[];
}

export interface StorageInfo {
  totalStacks: number;
  totalItems: number;
  containers: {
    regularChests: number;
    doubleChests: number;
    shulkerBoxes: number;
    barrels: number;
  };
  estimatedTime: string; // ex: "2-3 hours"
}

export interface CraftingStep {
  stepNumber: number;
  item: string;
  displayName: string;
  quantity: number;
  recipe: Recipe;
  requiredIngredients: Record<string, number>;
  craftingTime?: number; // em segundos
  experience?: number;
}

export interface CalculationMetadata {
  totalRecipes: number;
  optimizationRoutes: number;
  processingTime: number; // em ms
  cacheHits: number;
  warnings: string[];
}

export type ResourceSource = "base" | "crafted" | "smelted" | "brewed";
export type OptimizationLevel = "none" | "basic" | "advanced" | "maximum";
