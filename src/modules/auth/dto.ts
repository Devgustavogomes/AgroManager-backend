import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const loginSchema = z.object({
  email: z.email().trim(),
  password: z
    .string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,36}$/)
    .trim(),
});

export class loginInputDto extends createZodDto(loginSchema) {}
