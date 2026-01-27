import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/infra/database/service';
import { UpdateProducerDTO, CreateProducerInput, ProducerOutput } from './dto';
import { producerMapper } from './mapper';
import { ProducerContract, ProducerPersistence } from './contract';

@Injectable()
export class ProducerRepository implements ProducerContract {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(id: string): Promise<ProducerOutput | undefined> {
    const sql = `SELECT
                  *
                FROM producers
                WHERE id_producer = $1;`;
    const params = [id];

    const producer = await this.databaseService.query<ProducerPersistence>(
      sql,
      params,
    );
    return producerMapper(producer)[0];
  }

  async create({
    username,
    password,
    email,
  }: CreateProducerInput): Promise<ProducerOutput> {
    const sql = `INSERT INTO producers 
                (username, 
                email, 
                password_hash)
                VALUES
                ($1,
                $2,
                $3)
                RETURNING *;`;

    const params = [username, email, password];

    const producer = await this.databaseService.query<ProducerPersistence>(
      sql,
      params,
    );

    return producerMapper(producer)[0];
  }

  async update(id: string, data: UpdateProducerDTO): Promise<ProducerOutput> {
    const sql = `UPDATE producers
                SET 
                username = COALESCE($1, username),
                email = COALESCE($2, email)
                WHERE id_producer = $3
                RETURNING *;
                `;

    const params = [data.username, data.email, id];
    const producer = await this.databaseService.query<ProducerPersistence>(
      sql,
      params,
    );

    return producerMapper(producer)[0];
  }

  async remove(id: string): Promise<void> {
    const sql = `DELETE FROM producers
                WHERE id_producer = $1`;
    const params = [id];

    await this.databaseService.query(sql, params);
  }

  async isOwner(
    idProducer: string,
    _idService: string,
  ): Promise<{ id_producer: string } | undefined> {
    const sql = `SELECT id_producer FROM producers
                  WHERE id_producer = $1`;

    const params = [idProducer];

    const result = await this.databaseService.query<{ id_producer: string }>(
      sql,
      params,
    );

    return result[0];
  }
}
