export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DatabaseDocument {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FileUpload {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedAt: Date;
}

export interface BlockInfo {
  id: string;
  name: string;
  displayName: string;
  stackSize: number;
  category: BlockCategory;
  isObtainable: boolean;
  rarity: BlockRarity;
  mod: string;
}

export type BlockCategory =
  | "building"
  | "decoration"
  | "redstone"
  | "transportation"
  | "miscellaneous"
  | "food"
  | "tools"
  | "combat"
  | "brewing";

export type BlockRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface ErrorInfo {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}
