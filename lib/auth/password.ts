import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Must be at least 8 characters")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/[^A-Za-z0-9]/, "Must include a special character");

export interface PasswordRule {
  label: string;
  test: (value: string) => boolean;
}

export const passwordRules: PasswordRule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function passwordStrength(value: string) {
  const passed = passwordRules.filter((rule) => rule.test(value)).length;
  return { passed, total: passwordRules.length, isValid: passed === passwordRules.length };
}

export const emailSchema = z
  .string()
  .min(1, "User ID or email is required")
  .transform((v) => v.trim().toLowerCase());

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(1, "Name is required"),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
