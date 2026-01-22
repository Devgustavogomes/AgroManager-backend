import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const createCultureSchema = z.object({
  name: z.string().min(3).max(64).trim(),
});

const outputCultureSchema = createCultureSchema.extend({
  idCulture: z.uuid(),
  idProperty: z.uuid(),
  allocatedArea: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});

export class CreateCultureInput extends createZodDto(createCultureSchema) {}

export class UpdateCultureInput extends createZodDto(createCultureSchema) {}

export class CultureOutput extends createZodDto(outputCultureSchema) {}
