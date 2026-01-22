import { CreateCultureInput, CultureOutput, UpdateCultureInput } from './dto';

export interface CulturePersistence {
  id_culture: string;
  id_property: string;
  name: string;
  allocated_area: number;
  created_at: Date;
  updated_at: Date | null;
}

export abstract class CultureContract {
  abstract findById(id: string): Promise<CultureOutput | undefined>;

  abstract create(
    idProperty: string,
    dto: CreateCultureInput,
  ): Promise<CultureOutput>;

  abstract update(id: string, dto: UpdateCultureInput): Promise<CultureOutput>;

  abstract delete(id: string): Promise<void>;

  abstract isOwner(
    idProducer: string,
    idCulture: string,
  ): Promise<{ id_producer: string; id_property: string } | undefined>;
}
