import { PoolClient } from 'pg';
import { CreateCropInput, CropOutput, UpdateCropInput } from './dto';

export abstract class CropContract {
  abstract findById(id: string): Promise<CropOutput | undefined>;
  abstract findByCulture(idCulture: string): Promise<CropOutput[]>;
  abstract create(
    idCulture: string,
    dto: CreateCropInput,
    cliente: PoolClient,
  ): Promise<CropOutput>;
  abstract update(id: string, dto: UpdateCropInput): Promise<CropOutput>;
  abstract deleteById(id: string): Promise<void>;
  abstract deleteByCulture(idCulture: string): Promise<void>;
  abstract isOwner(
    idProducer: string,
    idCrop: string,
  ): Promise<{ 1: number } | undefined>;
  abstract getArableAreaAndLockProperty(
    idCulture: string,
    cliente: PoolClient,
  ): Promise<{ arableArea: number; updatedAt: Date }>;

  abstract getSumCropAreas(
    idCulture: string,
    cliente: PoolClient,
  ): Promise<number>;

  abstract getAreaCulture(
    idCulture: string,
    client: PoolClient,
  ): Promise<number>;

  abstract getAreaAndLockCultures(
    idCulture: string,
    client: PoolClient,
  ): Promise<number>;

  abstract updateAreaCulture(
    idCulture: string,
    allocatedArea: number,
  ): Promise<void>;
}
