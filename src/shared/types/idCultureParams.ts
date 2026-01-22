import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const idSchema = z.object({
  id: z.uuid().optional(),
  id_property: z.uuid(),
});

export class IdCultureDto extends createZodDto(idSchema) {}
