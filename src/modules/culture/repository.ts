import { Injectable } from '@nestjs/common';
import { CultureContract, CulturePersistence } from './contract';
import { DatabaseService } from 'src/infra/database/service';
import { CreateCultureInput, CultureOutput, UpdateCultureInput } from './dto';
import { cultureMapper } from './mapper';

@Injectable()
export class CultureRepository implements CultureContract {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(id: string): Promise<CultureOutput | undefined> {
    const sql = `SELECT *
                FROM cultures
                WHERE id_culture = $1`;

    const params = [id];

    const culture = await this.databaseService.query<CulturePersistence>(
      sql,
      params,
    );

    return cultureMapper(culture)[0];
  }

  async create(
    idProperty: string,
    dto: CreateCultureInput,
  ): Promise<CultureOutput> {
    const sql = `INSERT INTO cultures (
                    id_property
                    name
                ) VALUES (
                    $1,
                    $2 
                ) 
                RETURNING *`;

    const params = [idProperty, dto];

    const culture = await this.databaseService.query<CulturePersistence>(
      sql,
      params,
    );

    return cultureMapper(culture)[0];
  }

  async update(id: string, dto: UpdateCultureInput): Promise<CultureOutput> {
    const sql = `UPDATE cultures
                SET
                name = $1
                WHERE id_culture = $2`;

    const params = [dto.name, id];

    const culture = await this.databaseService.query<CulturePersistence>(
      sql,
      params,
    );

    return cultureMapper(culture)[0];
  }

  async delete(id: string): Promise<void> {
    const sql = `DELETE FROM cultures
                WHERE id_culture = $1`;

    const params = [id];

    await this.databaseService.query(sql, params);
  }

  async isOwner(
    idProducer: string,
    idCulture: string,
  ): Promise<{ id_producer: string; id_property: string } | undefined> {
    const sql = `SELECT
                    cult.ID_PROPERTY,
                    prop.ID_PRODUCER
                FROM cultures AS cult
                INNER JOIN properties AS prop 
                    ON cult.ID_PROPERTY = prop.ID_PROPERTY
                WHERE cult.id_culture = $1
                AND prop.ID_PRODUCER = $2`;

    const params = [idCulture, idProducer];

    const result = await this.databaseService.query<
      { id_producer: string; id_property: string } | undefined
    >(sql, params);

    return result[0];
  }
}
