import { Injectable, NotFoundException } from '@nestjs/common';
import { CultureContract } from './contract';
import { CreateCultureInput, CultureOutput, UpdateCultureInput } from './dto';

@Injectable()
export class CultureService {
  constructor(private readonly cultureRepository: CultureContract) {}

  async findById(id: string): Promise<CultureOutput> {
    const culture = await this.cultureRepository.findById(id);

    if (!culture) {
      throw new NotFoundException('Culture not found');
    }

    return culture;
  }

  async create(
    idProperty: string,
    dto: CreateCultureInput,
  ): Promise<CultureOutput> {
    return await this.cultureRepository.create(idProperty, dto);
  }

  async update(id: string, dto: UpdateCultureInput): Promise<CultureOutput> {
    return await this.cultureRepository.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    await this.cultureRepository.delete(id);
  }

  async isOwner(
    idProducer: string,
    idCulture: string,
  ): Promise<{ id_producer: string; id_property: string } | undefined> {
    return await this.cultureRepository.isOwner(idProducer, idCulture);
  }
}
