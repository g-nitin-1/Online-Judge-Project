require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const validator = require("validator");
const User = require("../models/user");

async function main() {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");
  const name = String(process.env.ADMIN_NAME || "Administrator").trim();

  if (!validator.isEmail(email)) throw new Error("ADMIN_EMAIL must be a valid email");
  if (password.length < 12 || password.length > 72) {
    throw new Error("ADMIN_PASSWORD must be 12 to 72 characters");
  }

  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/onlineJudge");
  const passwordHash = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { email },
    { $set: { name, passwordHash, role: "ROLE_ADMIN" } },
    { upsert: true, runValidators: true }
  );
  console.log(`Administrator account is ready for ${email}`);
}

main()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
