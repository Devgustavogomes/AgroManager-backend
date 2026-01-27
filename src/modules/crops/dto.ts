import z from 'zod';
import { CropStatus, PestStatus } from './types';
import { createZodDto } from 'nestjs-zod';

const createCropSchema = z.object({
  name: z.string().min(3).max(64).trim(),
  status: z.enum(CropStatus),
  allocatedArea: z.number(),
  harvestDateExpected: z.string(),
  harvestDateActual: z.string(),
  pestStatus: z.enum(PestStatus),
});

const updateCropSchema = createCropSchema.partial();

const outputCropSchema = createCropSchema.extend({
  idCrop: z.uuid(),
  idCulture: z.uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});

const idSchema = z.object({
  id: z.uuid().optional(),
  id_culture: z.uuid(),
});

export class CreateCropInput extends createZodDto(createCropSchema) {}

export class UpdateCropInput extends createZodDto(updateCropSchema) {}

export class CropOutput extends createZodDto(outputCropSchema) {}

export class IdCropDto extends createZodDto(idSchema) {}
