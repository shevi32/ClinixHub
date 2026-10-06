import mongoose from "mongoose";

export const isValidObjectId = (value: unknown): value is string =>
  typeof value === "string" && mongoose.isObjectIdOrHexString(value);