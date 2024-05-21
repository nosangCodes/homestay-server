import bcrypt from "bcrypt";

export const hashPassword = async (plainPassword: string) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(plainPassword, salt);
  return hash;
};

export const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
