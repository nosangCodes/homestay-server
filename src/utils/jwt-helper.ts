import jwt, { JwtPayload } from "jsonwebtoken";

const generateToken = (email: string, userId: number) => {
  if (!process.env.JWT_SECRET) {
    throw Error("jwt secret  is missing");
  }
  return jwt.sign({ email, userId }, process.env.JWT_SECRET, {
    expiresIn: "4h",
  });
};

const verifyjwtToken = async (token: string) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw Error("jwt secret  is missing");
    }
    const result = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded as JwtPayload);
        }
      });
    });
    return result
  } catch (error) {
    throw error;
  }
};

export { generateToken, verifyjwtToken };
