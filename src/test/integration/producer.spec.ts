import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { INestApplication } from '@nestjs/common';
import { TestOrchestrator } from '../test-orchestrator';
import { ProducerController } from 'src/modules/producer/controller';
import { ProducerOutput } from 'src/modules/producer/dto';
import { NotFoundException } from '@nestjs/common';

describe('Integration | Producer Tests', () => {
  let app: INestApplication;
  let orchestrator: TestOrchestrator;
  let producerController: ProducerController;
  let producer: ProducerOutput;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    orchestrator = new TestOrchestrator(app);
    producerController = moduleRef.get<ProducerController>(ProducerController);
  });

  afterAll(async () => {
    await orchestrator.destroy();
    await app.close();
  });

  test('Should be defined', () => {
    expect(producerController).toBeDefined();
  });

  describe('Producer Good Path', () => {
    test('Create a new producer', async () => {
      const input = {
        username: 'GustavoTeste',
        email: `testtt-${Date.now()}@gmail.com`,
        password: 'DevTest311*',
      };
      producer = await producerController.create(input);

      const token = await orchestrator.login(input);
      orchestrator.getProducers().push({
        idProducer: producer.idProducer,
        token,
        data: producer,
      });

      expect(producer).toStrictEqual({
        idProducer: expect.any(String),
        username: input.username,
        email: input.email,
        role: 'USER',
        createdAt: expect.any(String),
        updatedAt: null,
      });
    });

    test('Find one producer', async () => {
      const result = await producerController.findById(producer.idProducer);

      expect(result).toStrictEqual({
        idProducer: producer.idProducer,
        username: expect.any(String),
        email: expect.any(String),
        role: 'USER',
        createdAt: expect.any(String),
        updatedAt: null,
      });
    });

    test('Update producer', async () => {
      const input = {
        username: 'GusTestC',
        email: `09329-${Date.now()}@gmail.com`,
      };
      const result = await producerController.update(
        producer.idProducer,
        input,
      );

      expect(result.username).toBe(input.username);
      expect(result.email).toBe(input.email);
    });
    test('Delete producer', async () => {
      await producerController.remove(producer.idProducer);

      await expect(
        producerController.findById(producer.idProducer),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
