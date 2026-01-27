import { CropOutput } from './dto';
import { CropStatus, PestStatus } from './types';

export interface CropPersistence {
  id_crop: string;
  id_culture: string;
  name: string;
  status: CropStatus;
  allocated_area: number;
  harvest_date_expected: string;
  harvest_date_actual: string;
  pest_status: PestStatus;
  created_at: Date;
  updated_at: Date | null;
}

export function cropMapper(data: CropPersistence[]): CropOutput[] {
  return data
    .values()
    .map((r) => ({
      idCrop: r.id_crop,
      idCulture: r.id_culture,
      name: r.name,
      status: r.status,
      allocatedArea: r.allocated_area,
      harvestDateExpected: r.harvest_date_expected,
      harvestDateActual: r.harvest_date_actual,
      pestStatus: r.pest_status,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at ? r.updated_at.toISOString() : null,
    }))
    .toArray();
}
