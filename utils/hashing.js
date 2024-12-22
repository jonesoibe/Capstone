const { hash } = require("bcrypt");
const bcrypt = require("bcrypt");

exports.doHash = async (password, saltRounds) => {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error("Error during password hashing:", error);
    throw new Error("Password hashing failed");
  }
};

exports.doHashvalidation = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Error during password validation:", error);
    throw new Error("Password validation failed");
  }
};
