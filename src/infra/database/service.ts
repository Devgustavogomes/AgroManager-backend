/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  Injectable,
  Inject,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Pool } from 'pg';
import type { PoolClient } from 'pg';
@Injectable()
export class DatabaseService implements OnModuleDestroy, OnModuleInit {
  constructor(@Inject('DATABASE_CLIENT') private readonly pool: Pool) {}

  async onModuleInit() {
    try {
      const client = await this.pool.connect();
      client.release();
      console.log('Connected to database');
    } catch (err) {
      console.error('Database connection failed', err);
      throw err;
    }
  }
  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T = any>(
    sql: string,
    params?: any[],
    client?: PoolClient,
  ): Promise<T[]> {
    const exec = client || this.pool;
    const result = await exec.query(sql, params);
    return result.rows;
  }

  async getClient(): Promise<PoolClient> {
    const client = await this.pool.connect();
    return client;
  }

  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const result = await fn(client);

      await client.query('COMMIT');

      return result;
    } catch (error) {
      await client.query('ROLLBACK');

      throw error;
    } finally {
      client.release();
    }
  }
}
