import type { DatabaseDocument } from "./common.types";
import type { OptimizationLevel } from "./calculation.types";

export interface User extends DatabaseDocument {
  email: string;
  username: string;
  displayName: string;
  passwordHash: string;
  isVerified: boolean;
  profileImage?: string;
  bio?: string;
  socialLinks?: {
    youtube?: string;
    twitch?: string;
    twitter?: string;
    github?: string;
  };
  activeModpackId?: string;
  preferences: UserPreferences;
  role: UserRole;
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: string;
  defaultOptimization: OptimizationLevel;
  notifications: {
    email: boolean;
    browser: boolean;
    updates: boolean;
  };
}

export type UserRole = "user" | "verified" | "moderator" | "admin";

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  isVerified: boolean;
  profileImage?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  role: UserRole;
  joinedAt: Date;
  stats: {
    calculationsCreated: number;
    listsCreated: number;
    recipesContributed: number;
  };
}
