import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import type { User, UserRole, UserPreferences } from "../types/user.types";

export interface UserDocument extends Omit<User, "id">, Document {
  _id: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserPreferencesSchema = new Schema<UserPreferences>(
  {
    theme: {
      type: String,
      enum: ["light", "dark", "auto"],
      default: "auto",
    },
    language: {
      type: String,
      default: "en",
    },
    defaultOptimization: {
      type: String,
      enum: ["none", "basic", "advanced", "maximum"],
      default: "basic",
    },
    notifications: {
      email: { type: Boolean, default: true },
      browser: { type: Boolean, default: true },
      updates: { type: Boolean, default: true },
    },
  },
  { _id: false }
);

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      maxlength: 50,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Don't include in queries by default
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: null,
    },
    socialLinks: {
      youtube: String,
      twitch: String,
      twitter: String,
      github: String,
    },
    activeModpackId: {
      type: Schema.Types.ObjectId,
      ref: "Modpack",
      default: null,
    },
    preferences: {
      type: UserPreferencesSchema,
      default: () => ({}),
    },
    role: {
      type: String,
      enum: ["user", "verified", "moderator", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash; // Never expose password hash
        return ret;
      },
    },
  }
);

// Password comparison method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

export const UserModel = mongoose.model<UserDocument>("User", UserSchema);
export default UserModel;
