import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import {
  TestOrchestrator,
  CreatedProducer,
  SetupPropertyResult,
} from '../test-orchestrator';

describe('E2E | Producer Tests', () => {
  let app: INestApplication;
  let orchestrator: TestOrchestrator;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    orchestrator = new TestOrchestrator(app);
  });

  afterAll(async () => {
    await orchestrator.destroy();
    await app.close();
  });

  describe('Producer Good Path', () => {
    let producerResult: SetupPropertyResult;

    beforeAll(async () => {
      producerResult = await orchestrator.setupProperty({
        username: 'GoodPathUser',
        email: `goodpath-${Date.now()}@gmail.com`,
        password: 'GoodPassword123!',
      });
    });

    test('Find by id producer', async () => {
      await request(app.getHttpServer())
        .get(`/producers/${producerResult.producer.idProducer}`)
        .set('Authorization', `Bearer ${producerResult.producer.token}`)
        .expect(HttpStatus.OK);
    });

    test('Update producer', async () => {
      const payload = {
        username: 'UpdatedGoodPathUser',
        email: `updated-goodpath-${Date.now()}@gmail.com`,
      };

      await request(app.getHttpServer())
        .patch(`/producers/${producerResult.producer.idProducer}`)
        .set('Authorization', `Bearer ${producerResult.producer.token}`)
        .send(payload)
        .expect(HttpStatus.OK);
    });

    test('Delete producer', async () => {
      await request(app.getHttpServer())
        .delete(`/producers/${producerResult.producer.idProducer}`)
        .set('Authorization', `Bearer ${producerResult.producer.token}`)
        .expect(HttpStatus.NO_CONTENT);
    });
  });

  describe('Producer Intruder Bad Path', () => {
    let producer1: CreatedProducer;
    let producer2: CreatedProducer;

    beforeAll(async () => {
      const p1Result = await orchestrator.setupProperty({
        username: 'IntruderUser1',
        email: `intruder1-${Date.now()}@gmail.com`,
        password: 'IntruderPassword1!',
      });
      producer1 = p1Result.producer;

      const p2Result = await orchestrator.setupProperty({
        username: 'IntruderUser2',
        email: `intruder2-${Date.now()}@gmail.com`,
        password: 'IntruderPassword2!',
      });
      producer2 = p2Result.producer;
    });

    test('Intruder try to update a producer', async () => {
      const payload = {
        username: 'IntruderAttempt',
      };

      await request(app.getHttpServer())
        .patch(`/producers/${producer1.idProducer}`)
        .set('Authorization', `Bearer ${producer2.token}`)
        .send(payload)
        .expect(HttpStatus.FORBIDDEN);
    });

    test('Intruder try to get another producer', async () => {
      await request(app.getHttpServer())
        .get(`/producers/${producer1.idProducer}`)
        .set('Authorization', `Bearer ${producer2.token}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    test('Intruder try to delete a producer', async () => {
      await request(app.getHttpServer())
        .delete(`/producers/${producer1.idProducer}`)
        .set('Authorization', `Bearer ${producer2.token}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});
