import { z } from 'zod';

export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters' })
    .max(100, { message: 'Full name must not exceed 100 characters' })
    .trim(),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .min(7, { message: 'Please enter a valid phone number' })
    .max(20, { message: 'Phone number is too long' })
    .regex(/^[+0-9\s\-()]+$/, { message: 'Invalid characters in phone number' })
    .trim(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(128, { message: 'Password must not exceed 128 characters' }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
});

export type SignInInput = z.infer<typeof signInSchema>;

