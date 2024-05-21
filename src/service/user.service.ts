import { User } from "@prisma/client";
import { client } from "../db/client";

const getAllUsers = async () => {
  try {
    const users = await client.user.findMany();
    return users;
  } catch (error) {
    console.error("error fetching users", error);
    throw error;
  }
};

const findByEmail = async (email: string) => {
  try {
    const found = await client.user.findUnique({ where: { email } });
    return found;
  } catch (error) {
    console.error("error fetching users", error);
    throw error;
  }
};

const findById = async (id: number) => {
  try {
    const found = await client.user.findUnique({ where: { id } });
    return found;
  } catch (error) {
    console.error("error fetching users", error);
    throw error;
  }
};

const create = async (user: User) => {
  try {
    const newUser = await client.user.create({
      data: user,
    });
    if (!newUser) {
      throw new Error("Failed to create user");
    }
    return newUser;
  } catch (error) {
    console.error("error signing up", error);
    throw error;
  }
};

export { getAllUsers, create, findByEmail, findById };
