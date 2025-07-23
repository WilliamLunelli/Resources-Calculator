export interface Recipe {
  id: string;
  name: string; // ex: "minecraft:diamond_pickaxe"
  displayName: string; // ex: "Diamond Pickaxe"
  type: RecipeType;
  ingredients: Record<string, number>; // { itemId: quantity }
  result: {
    item: string;
    quantity: number;
  };
  modSource: string; // ex: "minecraft", "thermal_expansion"
  version: string;
  metadata?: Record<string, any>;
}

export type RecipeType =
  | "crafting"
  | "smelting"
  | "brewing"
  | "smithing"
  | "stonecutting"
  | "custom";

export interface RecipeInput {
  name: string;
  displayName?: string;
  type: RecipeType;
  ingredients: Record<string, number>;
  result: {
    item: string;
    quantity: number;
  };
  modSource?: string;
  metadata?: Record<string, any>;
}

export interface ModpackRecipes {
  modpack: {
    name: string;
    version: string;
    minecraft_version: string;
  };
  recipes: Record<string, RecipeInput>;
}
