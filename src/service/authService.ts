import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcryptjs";
import { signToken } from "../../lib/jwt.js";
import { RegisterDTO, LoginDTO } from "../types/auth.dto.js";

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

export const findOrCreateGoogleUser = async (profile: any) => {
  const email = profile.emails?.[0].value;
  const googleId = profile.id;
  const userName = profile.displayName || profile.name?.givenName;
  const image = profile.photos?.[0].value;

  // 1. Try to find user by providerId
  let user = await prisma.user.findFirst({
    where: { providerId: googleId, provider: "google" },
  });

  if (user) {
    return user;
  }

  // 2. Try to find by email if not found by providerId
  if (email) {
    user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Update existing user with Google info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          providerId: googleId,
          provider: "google",
          image: image || user.image,
        },
      });
      return user;
    }
  }

  // 3. Create new user
  user = await prisma.user.create({
    data: {
      email,
      userName: userName || email?.split("@")[0] || "User",
      provider: "google",
      providerId: googleId,
      image,
      role: "USER",
    },
  });

  return user;
};

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      userName: true,
      email: true,
      role: true,
      image: true,
      provider: true,
      createdAt: true,
    },
  });
  return user;
};

export const logoutUser = async () => {
  return { success: true };
};


