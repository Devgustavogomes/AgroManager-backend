import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PropertyOutputDto } from './dto';
import { CreatePropertyDto, UpdatePropertyDto } from './dto';
import { DatabaseService } from 'src/infra/database/service';
import { PoolClient } from 'pg';
import { MAX_PROPERTIES } from 'src/config/constants';
import { PropertyContract } from './contract';
import { Area } from 'src/shared/value-object/Area';

@Injectable()
export class PropertyService {
  constructor(
    private readonly propertyRepository: PropertyContract,
    private readonly db: DatabaseService,
  ) {}

  async findById(id: string): Promise<PropertyOutputDto> {
    const property = await this.propertyRepository.findById(id);

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async create(id: string, dto: CreatePropertyDto): Promise<PropertyOutputDto> {
    const { arableArea, totalArea, vegetationArea } = this.normalizeAreas(
      dto.arableArea,
      dto.vegetationArea,
    );

    const parsedDto = {
      ...dto,
      arableArea,
      vegetationArea,
    };
    return this.db.transaction(async (client: PoolClient) => {
      const properties = await this.propertyRepository.count(id, client);

      if (properties > MAX_PROPERTIES) {
        throw new BadRequestException(
          `You have too many properties. The maximum allowed is ${MAX_PROPERTIES}`,
        );
      }
      return await this.propertyRepository.create(
        id,
        parsedDto,
        totalArea,
        client,
      );
    });
  }

  async update(id: string, dto: UpdatePropertyDto) {
    if (
      (dto.arableArea && !dto.vegetationArea) ||
      (!dto.arableArea && dto.vegetationArea)
    ) {
      throw new UnprocessableEntityException(
        'arable area and vegetation area must be provided together',
      );
    }

    const { totalArea, arableArea, vegetationArea } =
      dto.arableArea && dto.vegetationArea
        ? this.normalizeAreas(dto.arableArea, dto.vegetationArea)
        : {};

    const parsedDto = {
      ...dto,
      arableArea,
      vegetationArea,
    };

    return await this.propertyRepository.update(id, parsedDto, totalArea);
  }

  async delete(id: string) {
    await this.propertyRepository.delete(id);
  }

  async isOwner(idProducer: string, idService: string): Promise<boolean> {
    const result = await this.propertyRepository.isOwner(idProducer, idService);

    if (!result) {
      throw new ForbiddenException(`You don't own this resource`);
    }

    const isOwner = result.id_property === idService;

    return isOwner;
  }

  normalizeAreas(
    arable: number,
    vegetation: number,
  ): { arableArea: number; vegetationArea: number; totalArea: number } {
    const arableArea = Area.fromFloat(arable);

    const vegetationArea = Area.fromFloat(vegetation);

    const totalArea = arableArea.add(vegetationArea);

    return {
      arableArea: arableArea.getIntegerValue(),
      vegetationArea: vegetationArea.getIntegerValue(),
      totalArea: totalArea.getIntegerValue(),
    };
  }
}
