/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CreateProducerInput, ProducerOutput } from 'src/modules/producer/dto';
import { CreatePropertyDto, PropertyOutputDto } from 'src/modules/property/dto';
import { CreateCultureInput, CultureOutput } from 'src/modules/culture/dto';
import { CreateCropInput, CropOutput } from 'src/modules/crops/dto';

export interface CreatedProducer {
  idProducer: string;
  token: string;
  data: ProducerOutput;
}

export interface CreatedProperty {
  idProperty: string;
  data: PropertyOutputDto;
}

export interface CreatedCulture {
  idCulture: string;
  data: CultureOutput;
}

export interface CreatedCrop {
  idCrop: string;
  data: CropOutput;
}

export interface SetupPropertyResult {
  producer: CreatedProducer;
}

export interface SetupCultureResult {
  producer: CreatedProducer;
  property: CreatedProperty;
}

export interface SetupCropResult {
  producer: CreatedProducer;
  property: CreatedProperty;
  culture: CreatedCulture;
}

export class TestOrchestrator {
  private producers: CreatedProducer[] = [];
  private properties: (CreatedProperty & { token: string })[] = [];
  private cultures: (CreatedCulture & {
    idProperty: string;
    token: string;
  })[] = [];
  private crops: (CreatedCrop & { idCulture: string; token: string })[] = [];

  constructor(private readonly app: INestApplication) {}

  async createProducer(payload: CreateProducerInput): Promise<ProducerOutput> {
    const response = await request(this.app.getHttpServer())
      .post('/producers')
      .send(payload)
      .expect(HttpStatus.CREATED);
    return response.body as ProducerOutput;
  }

  async login(
    payload: Pick<CreateProducerInput, 'email' | 'password'>,
  ): Promise<string> {
    const response = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send(payload)
      .expect(HttpStatus.CREATED);
    return response.body.accessToken as string;
  }

  async createProperty(
    payload: CreatePropertyDto,
    token: string,
  ): Promise<CreatedProperty> {
    const response = await request(this.app.getHttpServer())
      .post('/property')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(HttpStatus.CREATED);

    const property = response.body as PropertyOutputDto;
    const createdProperty = { idProperty: property.idProperty, data: property };
    this.properties.push({ ...createdProperty, token });
    return createdProperty;
  }

  async createCulture(
    payload: CreateCultureInput,
    idProperty: string,
    token: string,
  ): Promise<CreatedCulture> {
    const response = await request(this.app.getHttpServer())
      .post(`/${idProperty}/cultures`)
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(HttpStatus.CREATED);

    const culture = response.body as CultureOutput;
    const createdCulture = { idCulture: culture.idCulture, data: culture };
    this.cultures.push({ ...createdCulture, idProperty, token });
    return createdCulture;
  }

  async createCrop(
    payload: CreateCropInput,
    idCulture: string,
    token: string,
  ): Promise<CreatedCrop> {
    const response = await request(this.app.getHttpServer())
      .post(`/${idCulture}/crop`)
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(HttpStatus.CREATED);

    const crop = response.body as CropOutput;
    const createdCrop = { idCrop: crop.idCrop, data: crop };
    this.crops.push({ ...createdCrop, idCulture, token });
    return createdCrop;
  }

  async setupProperty(
    producerPayload: CreateProducerInput,
  ): Promise<SetupPropertyResult> {
    const producerData = await this.createProducer(producerPayload);
    const token = await this.login(producerPayload);
    const producer = {
      idProducer: producerData.idProducer,
      token,
      data: producerData,
    };
    this.producers.push(producer);
    return { producer };
  }

  async setupCulture(
    producerPayload: CreateProducerInput,
    propertyPayload: CreatePropertyDto,
  ): Promise<SetupCultureResult> {
    const { producer } = await this.setupProperty(producerPayload);
    const property = await this.createProperty(propertyPayload, producer.token);
    return { producer, property };
  }

  async setupCrop(
    producerPayload: CreateProducerInput,
    propertyPayload: CreatePropertyDto,
    culturePayload: CreateCultureInput,
  ): Promise<SetupCropResult> {
    const { producer, property } = await this.setupCulture(
      producerPayload,
      propertyPayload,
    );
    const culture = await this.createCulture(
      culturePayload,
      property.idProperty,
      producer.token,
    );
    return { producer, property, culture };
  }

  getProducers(): CreatedProducer[] {
    return this.producers;
  }

  async destroy(): Promise<void> {
    for (const crop of this.crops.reverse()) {
      await request(this.app.getHttpServer())
        .delete(`/${crop.idCulture}/crop/${crop.idCrop}`)
        .set('Authorization', `Bearer ${crop.token}`);
    }
    this.crops = [];

    for (const culture of this.cultures.reverse()) {
      await request(this.app.getHttpServer())
        .delete(`/${culture.idProperty}/cultures/${culture.idCulture}`)
        .set('Authorization', `Bearer ${culture.token}`);
    }
    this.cultures = [];

    for (const property of this.properties.reverse()) {
      await request(this.app.getHttpServer())
        .delete(`/property/${property.idProperty}`)
        .set('Authorization', `Bearer ${property.token}`);
    }
    this.properties = [];

    for (const producer of this.producers.reverse()) {
      await request(this.app.getHttpServer())
        .delete(`/producers/${producer.idProducer}`)
        .set('Authorization', `Bearer ${producer.token}`);
    }
    this.producers = [];
  }
}
