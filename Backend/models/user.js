const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["ROLE_ADMIN", "ROLE_MEMBER"],
      default: "ROLE_MEMBER"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
