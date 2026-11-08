import { z } from 'zod';

export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters' })
    .max(100, { message: 'Full name must not exceed 100 characters' })
    .refine(
      (val) => val.trim().length >= 2,
      { message: 'Full name must be at least 2 characters' }
    )
    .refine(
      (val) => val.trim().split(/\s+/).filter(Boolean).length >= 2,
      { message: 'Please enter at least 2 names separated by a space' }
    )
    .transform((val) => val.trim()),
  email: z
    .string()
    .email({ message: 'Enter a valid email address' })
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/\s+/g, ''))
    .refine(
      (val) => {
        if (/^0\d{10}$/.test(val)) return true;
        if (/^\+234\d{10}$/.test(val)) return true;
        if (/^234\d{10}$/.test(val)) return true;
        return false;
      },
      {
        message: 'Phone number must be an 11-digit Nigerian number (e.g., 0908 116 6271)',
      }
    )
    .transform((val) => {
      if (/^0\d{10}$/.test(val)) {
        return `+234${val.slice(1)}`;
      }
      if (/^234\d{10}$/.test(val)) {
        return `+${val}`;
      }
      return val;
    }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(128, { message: 'Password must not exceed 128 characters' }),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms & Conditions to create an account' }),
  }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z
    .string()
    .email({ message: 'Enter a valid email address' })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
});

export type SignInInput = z.infer<typeof signInSchema>;

