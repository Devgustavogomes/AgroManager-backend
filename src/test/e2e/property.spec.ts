/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MAX_PROPERTIES } from 'src/config/constants';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { CreatePropertyDto } from 'src/modules/property/dto';
import {
  TestOrchestrator,
  SetupPropertyResult,
  CreatedProperty,
} from '../test-orchestrator';

describe('E2E | Property Tests', () => {
  let app: INestApplication;
  let orchestrator: TestOrchestrator;
  let setupResult: SetupPropertyResult;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    orchestrator = new TestOrchestrator(app);

    setupResult = await orchestrator.setupProperty({
      username: 'string',
      email: `property-test-${Date.now()}@gmail.com`,
      password: 'TestPassword123!',
    });
  });

  afterAll(async () => {
    await orchestrator.destroy();
    await app.close();
  });

  describe('Good Path', () => {
    let idProperty: string;

    it('should create a property successfully', async () => {
      const payload: CreatePropertyDto = {
        name: 'property1',
        city: 'Canindé',
        state: 'CE',
        arableArea: 500,
        vegetationArea: 1000,
      };

      const result = await request(app.getHttpServer())
        .post('/property')
        .send(payload)
        .set('Authorization', `Bearer ${setupResult.producer.token}`)
        .expect(HttpStatus.CREATED);

      idProperty = result.body.idProperty;
      expect(idProperty).toBeDefined();
    });

    it('should get a property successfully', async () => {
      await request(app.getHttpServer())
        .get(`/property/${idProperty}`)
        .set('Authorization', `Bearer ${setupResult.producer.token}`)
        .expect(HttpStatus.OK);
    });

    it('should update a property successfully', async () => {
      const payload: Partial<CreatePropertyDto> = {
        name: 'property-updated',
      };
      await request(app.getHttpServer())
        .patch(`/property/${idProperty}`)
        .set('Authorization', `Bearer ${setupResult.producer.token}`)
        .send(payload)
        .expect(HttpStatus.OK);
    });

    it('should delete a property successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/property/${idProperty}`)
        .set('Authorization', `Bearer ${setupResult.producer.token}`)
        .expect(HttpStatus.NO_CONTENT);
    });
  });

  describe('Bad Path', () => {
    it('should not allow creating more than MAX_PROPERTIES properties', async () => {
      const payload: CreatePropertyDto = {
        name: 'property-limit-test',
        city: 'Canindé',
        state: 'CE',
        arableArea: 100,
        vegetationArea: 100,
      };

      const promises: Promise<CreatedProperty>[] = [];
      for (let i = 0; i <= MAX_PROPERTIES; i++) {
        promises.push(
          orchestrator.createProperty(payload, setupResult.producer.token),
        );
      }
      await Promise.all(promises);

      await request(app.getHttpServer())
        .post('/property')
        .send(payload)
        .set('Authorization', `Bearer ${setupResult.producer.token}`)
        .expect(HttpStatus.BAD_REQUEST);
    }, 30000);
  });
});
