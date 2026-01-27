import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CropContract } from './contract';
import { CreateCropInput, CropOutput, UpdateCropInput } from './dto';
import { DatabaseService } from 'src/infra/database/service';
import { PoolClient } from 'pg';
import { Area } from 'src/shared/value-object/Area';
import { CropStatus } from './types';

@Injectable()
export class CropService {
  constructor(
    private readonly cropRepository: CropContract,
    private readonly databaseService: DatabaseService,
  ) {}

  async findById(id: string): Promise<CropOutput> {
    const crop = await this.cropRepository.findById(id);

    if (!crop) {
      throw new NotFoundException(`Crop not found`);
    }

    return crop;
  }

  async findByCulture(idCulture: string): Promise<CropOutput[]> {
    return await this.cropRepository.findByCulture(idCulture);
  }

  async create(idCulture: string, dto: CreateCropInput): Promise<CropOutput> {
    return this.databaseService.transaction(async (cliente: PoolClient) => {
      const parsedDto = {
        ...dto,
        allocatedArea: Area.fromFloat(dto.allocatedArea).getIntegerValue(),
      };

      const property = await this.cropRepository.getArableAreaAndLockProperty(
        idCulture,
        cliente,
      );

      const areaCulture = await this.cropRepository.getAreaCulture(
        idCulture,
        cliente,
      );

      const sumCropAreas = await this.cropRepository.getSumCropAreas(
        idCulture,
        cliente,
      );

      this.validateAvailableArea(
        property.arableArea,
        sumCropAreas,
        parsedDto.allocatedArea,
      );

      const crop = await this.cropRepository.create(
        idCulture,
        parsedDto,
        cliente,
      );

      const newCultureArea =
        Area.fromFloat(crop.allocatedArea).getIntegerValue() + areaCulture;

      await this.cropRepository.updateAreaCulture(idCulture, newCultureArea);

      return crop;
    });
  }

  async update(id: string, dto: UpdateCropInput): Promise<CropOutput> {
    const crop = await this.findById(id);

    return this.databaseService.transaction(async (client: PoolClient) => {
      const parsedDto = dto.allocatedArea
        ? {
            ...dto,
            allocatedArea: Area.fromFloat(dto.allocatedArea).getIntegerValue(),
          }
        : { ...dto };

      const property = await this.cropRepository.getArableAreaAndLockProperty(
        crop.idCulture,
        client,
      );

      const areaCulture = await this.cropRepository.getAreaCulture(
        crop.idCulture,
        client,
      );

      const sumCropAreas = await this.cropRepository.getSumCropAreas(
        crop.idCulture,
        client,
      );

      if (parsedDto.allocatedArea) {
        this.validateAvailableArea(
          property.arableArea,
          sumCropAreas - Area.fromFloat(crop.allocatedArea).getIntegerValue(),
          parsedDto.allocatedArea,
        );
      }

      const updatedCrop = await this.cropRepository.update(id, parsedDto);

      let newCultureArea =
        areaCulture -
        Area.fromFloat(crop.allocatedArea).getIntegerValue() +
        Area.fromFloat(updatedCrop.allocatedArea).getIntegerValue();

      if (updatedCrop.status === CropStatus.HARVESTED) {
        newCultureArea -= Area.fromFloat(
          updatedCrop.allocatedArea,
        ).getIntegerValue();
      }

      await this.cropRepository.updateAreaCulture(
        crop.idCulture,
        newCultureArea,
      );

      return updatedCrop;
    });
  }

  async deleteById(id: string) {
    const crop = await this.findById(id);

    return this.databaseService.transaction(async (client: PoolClient) => {
      const areaCulture = await this.cropRepository.getAreaAndLockCultures(
        crop.idCulture,
        client,
      );

      const newCultureArea =
        areaCulture - Area.fromFloat(crop.allocatedArea).getIntegerValue();

      await this.cropRepository.updateAreaCulture(
        crop.idCulture,
        newCultureArea,
      );

      await this.cropRepository.deleteById(id);
    });
  }

  async deleteByCulture(idCulture: string) {
    await this.cropRepository.deleteByCulture(idCulture);
  }

  private validateAvailableArea(
    arableArea: number,
    usedArea: number,
    newArea: number,
  ) {
    if (arableArea < usedArea + newArea) {
      throw new UnprocessableEntityException(
        'The allocated area for this crop exceeds the remaining arable area of the property.',
      );
    }
  }
}
