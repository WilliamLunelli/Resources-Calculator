import { UserModel } from "./User";
import { RecipeModel } from "./Recipe";
import { CalculationModel } from "./Calculation";

// Re-export individual models
export { UserModel, type UserDocument } from "./User";
export { RecipeModel, type RecipeDocument } from "./Recipe";
export { CalculationModel, type CalculationDocument } from "./Calculation";

// Export all models as a group
export const models = {
  User: UserModel,
  Recipe: RecipeModel,
  Calculation: CalculationModel,
};

export default models;
