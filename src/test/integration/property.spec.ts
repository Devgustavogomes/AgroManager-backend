import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { INestApplication } from '@nestjs/common';
import { TestOrchestrator } from '../test-orchestrator';
import { PropertyController } from 'src/modules/property/controller';
import { ProducerController } from 'src/modules/producer/controller';
import { ProducerOutput } from 'src/modules/producer/dto';
import { AuthenticatedRequest } from 'src/shared/types/authenticatedRequest';
import { PropertyOutputDto } from 'src/modules/property/dto';

describe('Integration | Property Tests', () => {
  let app: INestApplication;
  let orchestrator: TestOrchestrator;
  let propertyController: PropertyController;
  let producerController: ProducerController;
  let producer1: ProducerOutput;
  let property: PropertyOutputDto;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    orchestrator = new TestOrchestrator(app);
    propertyController = moduleRef.get<PropertyController>(PropertyController);
    producerController = moduleRef.get<ProducerController>(ProducerController);

    const p1Input = {
      username: 'string',
      email: `13203567854-${Date.now()}@gmail.com`,
      password: "^%B'aQqRxsgq>-U1^",
    };

    producer1 = await producerController.create(p1Input);

    const token1 = await orchestrator.login(p1Input);
    orchestrator.getProducers().push({
      idProducer: producer1.idProducer,
      token: token1,
      data: producer1,
    });

    const p2Input = {
      username: 'string',
      email: `13203567855-${Date.now()}@gmail.com`,
      password: "^%B'aQqRxsgq>-U1^",
    };
    const producer2 = await producerController.create(p2Input);
    const token2 = await orchestrator.login(p2Input);
    orchestrator.getProducers().push({
      idProducer: producer2.idProducer,
      token: token2,
      data: producer2,
    });
  });

  afterAll(async () => {
    await orchestrator.destroy();
    await app.close();
  });

  describe('Property Good Path', () => {
    test('Create Property Successfull', async () => {
      const input = {
        name: 'string',
        city: 'string',
        state: 'strin',
        arableArea: 5000,
        vegetationArea: 3000,
      };

      const auth = {
        producer: {
          id: producer1.idProducer,
        },
      } as AuthenticatedRequest;

      property = await propertyController.create(auth, input);

      const token = orchestrator
        .getProducers()
        .find((p) => p.idProducer === producer1.idProducer)!.token;

      orchestrator.getProperties().push({
        idProperty: property.idProperty,
        data: property,
        token,
      });

      expect(property).toStrictEqual({
        name: input.name,
        city: input.city,
        state: input.state,
        arableArea: input.arableArea,
        vegetationArea: input.vegetationArea,
        totalArea: expect.any(Number),
        idProperty: expect.any(String),
        idProducer: producer1.idProducer,
        createdAt: expect.any(String),
        updatedAt: null,
      });
    });
  });
});
