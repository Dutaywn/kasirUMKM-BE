import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "../../lib/jwt";
import { RegisterDTO, LoginDTO } from "../types/auth.dto";

export const registerUser = async (data: RegisterDTO) => {
  const { email, password, userName } = data;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { userName }],
    },
  });

  if (existingUser) {
    throw new Error("User with this email or username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      userName,
      role: "USER",
    },
  });

  return { id: user.id, email: user.email, userName: user.userName };
};

export const loginUser = async (data: LoginDTO) => {
  const { email, password } = data;

  const user = await prisma.user.findFirst({
    where: { email: email || undefined },
  });

  if (!user || !user.password) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = await signToken({
    userId: user.id,
    email: user.email || "",
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role,
    },
  };
};

export const logoutUser = async () => {
  return { success: true };
};


