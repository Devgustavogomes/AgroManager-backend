import { RedisModule } from 'src/infra/redis/module';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/modules/auth/module';
import configuration from 'src/config/configuration';
import { envSchema } from 'src/config/dto/env.dto';
import { DatabaseModule } from 'src/infra/database/module';
import { ProducerModule } from 'src/modules/producer/module';
import { RedisService } from 'src/infra/redis/service';
import { ProducerController } from 'src/modules/producer/controller';
import { ProducerOutput } from 'src/modules/producer/dto';
import { NotFoundException } from '@nestjs/common';

let producerController: ProducerController;
let redisService: RedisService;
let producer: ProducerOutput;

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
    ],
  }).compile();

  producerController = moduleRef.get<ProducerController>(ProducerController);

  redisService = moduleRef.get<RedisService>(RedisService);
});

test('Should be defined', () => {
  expect(producerController).toBeDefined();
});

describe('Producer Good Path', () => {
  test('Create a new producer', async () => {
    const input = {
      username: 'GustavoTeste',
      email: 'testtt@gmail.com',
      password: 'DevTest311*',
    };
    producer = await producerController.create(input);

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
      idProducer: expect.any(String),
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
      email: '09329@gmail.com',
    };
    const result = await producerController.update(producer.idProducer, input);

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

afterAll(async () => {
  if (redisService) await redisService.onModuleDestroy();
});
