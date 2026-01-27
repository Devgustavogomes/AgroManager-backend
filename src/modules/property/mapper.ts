import { Area } from 'src/shared/value-object/Area';
import { PropertyPersistence } from './contract';
import { PropertyOutputDto } from './dto';

export function propertyMapper(
  data: PropertyPersistence[],
): PropertyOutputDto[] {
  return data.map((r) => ({
    idProperty: r.id_property,
    idProducer: r.id_producer,
    name: r.name,
    city: r.city,
    state: r.state,
    totalArea: Area.fromInteger(r.total_area).getFloatValue(),
    arableArea: Area.fromInteger(r.arable_area).getFloatValue(),
    vegetationArea: Area.fromInteger(r.vegetation_area).getFloatValue(),
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at ? r.updated_at.toISOString() : null,
  }));
}
