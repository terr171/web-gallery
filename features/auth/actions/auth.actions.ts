"use server";

import { signIn } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema/schema";
import { hash } from "bcryptjs";
import { eq, or } from "drizzle-orm";
import {
  LoginInput,
  loginSchema,
  RegisterInput,
  registerSchema,
} from "@/features/auth/lib/validations";
import { validateInput } from "@/lib/actions-utility";

/**
 * Attempts to log in a user using provided credentials.
 * Uses the 'credentials' provider from the authentication library (e.g., NextAuth.js).
 * @param {LoginInput} input - The user's email and password.
 * @returns {Promise<ActionResult>} ActionResult indicating success or failure. No data is returned on success.
 */
export const login = async (input: LoginInput): Promise<ActionResult> => {
  // #1. Input Validation
  const validationResult = validateInput(loginSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }
  const { email, password } = validationResult.response;

  // #1. Sign In Logic
  try {
    const result = await signIn("credentials", {
      email: email,
      password: password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: "Failed to Login, please try again" };
    }

    return { success: true, response: null };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to Login, please try again" };
  }
};

/**
 * Registers a new user with the provided email, username, and password.
 * Checks for existing users with the same email or username.
 * Hashes the password before storing it.
 * Attempts to log the user in immediately after successful registration.
 * @param {RegisterInput} input - The user's email, username, and password.
 * @returns {Promise<ActionResult>} ActionResult indicating success or failure. No data is returned on success.
 */
export const register = async (input: RegisterInput): Promise<ActionResult> => {
  // #1. Input Validation
  const validationResult = validateInput(registerSchema, input);
  if (!validationResult.success) {
    return validationResult;
  }
  const { email, username, password } = validationResult.response;

  // #2. Insert data into database
  try {
    // Check if email or username exists
    const alreadyExists = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);

    if (alreadyExists.length > 0) {
      const existingUser = alreadyExists[0];

      if (existingUser.email === email) {
        return { success: false, error: "Email already exists" };
      }
      if (existingUser.username === username) {
        return { success: false, error: "Username already exists" };
      }
    }
    const hashedPassword = await hash(password, 10);

    await db.insert(users).values({
      username: username,
      email: email,
      passwordHash: hashedPassword,
    });
    await login({ email: email, password: password });
    return { success: true, response: null };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: "Sign Up Failed",
    };
  }
};
