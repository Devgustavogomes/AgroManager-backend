import { Area } from 'src/shared/value-object/Area';
import { CulturePersistence } from './contract';
import { CultureOutput } from './dto';

export function cultureMapper(data: CulturePersistence[]): CultureOutput[] {
  return data
    .values()
    .map((r) => ({
      idCulture: r.id_culture,
      idProperty: r.id_property,
      name: r.name,
      allocatedArea: Area.fromInteger(r.allocated_area).getFloatValue(),
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at ? r.updated_at.toISOString() : null,
    }))
    .toArray();
}
