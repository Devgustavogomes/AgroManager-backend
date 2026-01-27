import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/infra/database/service';
import { CropContract } from './contract';
import { CreateCropInput, CropOutput, UpdateCropInput } from './dto';
import { cropMapper, CropPersistence } from './mapper';
import { PoolClient } from 'pg';

@Injectable()
export class CropRepository implements CropContract {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(id: string): Promise<CropOutput | undefined> {
    const sql = `SELECT *
                FROM crops
                WHERE id_crop = $1`;

    const params = [id];

    const crop = await this.databaseService.query<CropPersistence>(sql, params);

    return cropMapper(crop)[0];
  }

  async findByCulture(idCulture: string): Promise<CropOutput[]> {
    const sql = `SELECT *
                   FROM crops
                   WHERE id_culture = $1`;

    const params = [idCulture];

    const crops = await this.databaseService.query<CropPersistence>(
      sql,
      params,
    );

    return cropMapper(crops);
  }

  async create(
    idCulture: string,
    dto: CreateCropInput,
    cliente: PoolClient,
  ): Promise<CropOutput> {
    const sql = `INSERT INTO crops (
                id_culture,
                name,
                status, 
                allocated_area, 
                harvest_date_expected, 
                harvest_date_actual, 
                pest_status
                ) VALUES (
                 $1, 
                 $2, 
                 $3, 
                 $4, 
                 $5, 
                 $6, 
                 $7, 
                 $8)
                RETURNING *
                  `;

    const params = [
      idCulture,
      dto.name,
      dto.status,
      dto.allocatedArea,
      dto.harvestDateExpected,
      dto.harvestDateActual,
      dto.pestStatus,
    ];

    const result = await this.databaseService.query<CropPersistence>(
      sql,
      params,
      cliente,
    );

    return cropMapper(result)[0];
  }

  async update(id: string, dto: UpdateCropInput): Promise<CropOutput> {
    const sql = `UPDATE crops
                SET 
                name = $1, 
                status = $2, 
                allocated_area = $3, 
                harvest_date_expected = $4, 
                harvest_date_actual = $5, 
                pest_status = $6
                WHERE id_crop = $7
                RETURNING *
    `;

    const params = [
      dto.name,
      dto.status,
      dto.allocatedArea,
      dto.harvestDateExpected,
      dto.harvestDateActual,
      dto.pestStatus,
      id,
    ];

    const result = await this.databaseService.query<CropPersistence>(
      sql,
      params,
    );

    return cropMapper(result)[0];
  }

  async deleteById(id: string): Promise<void> {
    const sql = `DELETE FROM crops
                WHERE id_crop = $1`;

    const params = [id];

    await this.databaseService.query(sql, params);
  }

  async deleteByCulture(idCulture: string): Promise<void> {
    const sql = `DELETE FROM crops
                WHERE id_culture = $1`;

    const params = [idCulture];
    await this.databaseService.query(sql, params);
  }

  async isOwner(
    idProducer: string,
    idCrop: string,
  ): Promise<{ '1': number } | undefined> {
    const sql = `SELECT 1
                FROM crops AS cr
                INNER JOIN cultures AS cult 
                    ON cult.id_culture = cr.id_culture
                INNER JOIN properties AS pr 
                    ON pr.id_property = cult.id_property
                WHERE cr.id_crop = $1
                AND pr.id_producer = $2`;

    const params = [idCrop, idProducer];

    const result = await this.databaseService.query<{ '1': number }>(
      sql,
      params,
    );

    return result[0];
  }

  async getArableAreaAndLockProperty(
    idCulture: string,
    cliente: PoolClient,
  ): Promise<{ arableArea: number; updatedAt: Date }> {
    const sql = `
      SELECT arable_area, updated_at FROM properties p
      INNER JOIN cultures c ON p.id_property = c.id_property
      WHERE c.id_culture = $1
      FOR UPDATE
    `;
    const params = [idCulture];

    const result = await this.databaseService.query<{
      arable_area: number;
      updated_at: Date;
    }>(sql, params, cliente);

    return {
      arableArea: result[0].arable_area,
      updatedAt: result[0].updated_at,
    };
  }

  async getSumCropAreas(
    idCulture: string,
    cliente: PoolClient,
  ): Promise<number> {
    const sql = `
    SELECT COALESCE(SUM(allocated_area), 0) AS total_area
    FROM crops
    WHERE id_culture = $1
    AND status <> 'HARVESTED';
    `;
    const params = [idCulture];

    const result = await this.databaseService.query<{ total_area: number }>(
      sql,
      params,
      cliente,
    );

    return result[0].total_area;
  }

  async getAreaCulture(idCulture: string, client: PoolClient): Promise<number> {
    const sql = `
    SELECT allocated_area
    FROM cultures
    WHERE id_culture = $1;
    `;

    const params = [idCulture];

    const result = await this.databaseService.query<{
      allocated_area: number;
    }>(sql, params, client);

    return result[0].allocated_area;
  }

  async getAreaAndLockCultures(
    idCulture: string,
    client: PoolClient,
  ): Promise<number> {
    const sql = `
    SELECT allocated_area
    FROM cultures
    WHERE id_culture = $1
    FOR UPDATE;
    `;

    const params = [idCulture];

    const result = await this.databaseService.query<{
      allocated_area: number;
    }>(sql, params, client);

    return result[0].allocated_area;
  }

  async updateAreaCulture(
    idCulture: string,
    allocatedArea: number,
  ): Promise<void> {
    const sql = `
    UPDATE cultures
    SET allocated_area = $1
    WHERE id_culture = $2;
    `;

    const params = [allocatedArea, idCulture];

    await this.databaseService.query(sql, params);
  }
}
