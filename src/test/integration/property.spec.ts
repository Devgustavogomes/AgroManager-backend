import { ProducerController } from '../../modules/producer/controller';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/modules/auth/module';
import configuration from 'src/config/configuration';
import { envSchema } from 'src/config/dto/env.dto';
import { DatabaseModule } from 'src/infra/database/module';
import { ProducerModule } from 'src/modules/producer/module';
import { PropertyController } from 'src/modules/property/controller';
import { PropertyModule } from 'src/modules/property/module';
import { RedisModule } from 'src/infra/redis/module';
import { AuthenticatedRequest } from 'src/shared/types/authenticatedRequest';
import { ProducerOutput } from 'src/modules/producer/dto';

let propertyController: PropertyController;
let producerController: ProducerController;
let producer1: ProducerOutput;
let producer2: ProducerOutput;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
        load: [configuration],
        validate: (env) => envSchema.parse(env),
      }),
      AuthModule,
      DatabaseModule,
      RedisModule,
      ProducerModule,
      PropertyModule,
    ],
  }).compile();

  propertyController = moduleRef.get<PropertyController>(PropertyController);

  producerController = moduleRef.get<ProducerController>(ProducerController);

  producer1 = await producerController.create({
    username: 'string',
    email: '13203567854',
    password: "^%B'aQqRxsgq>-U1^",
  });

  producer2 = await producerController.create({
    username: 'string',
    email: '13203567855',
    password: "^%B'aQqRxsgq>-U1^",
  });
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

    const result = await propertyController.create(auth, input);

    expect(result).toStrictEqual({
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

afterAll(async () => {
  await producerController.remove(producer1.idProducer);
  await producerController.remove(producer2.idProducer);
});
