import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { OwnerService } from 'src/shared/decorators/owner.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { OwnerGuard } from 'src/shared/guards/owner.guard';
import { RolesGuards } from 'src/shared/guards/roles.guard';
import { CultureService } from '../culture/service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CreateCropInput, CropOutput, IdCropDto, UpdateCropInput } from './dto';
import { CropService } from './service';

@Controller(':id_culture/crop')
@UseGuards(AuthGuard, RolesGuards, OwnerGuard)
export class CropController {
  constructor(private readonly cropService: CropService) {}

  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CropOutput })
  @Post('')
  @OwnerService(CultureService, 'id_culture')
  async create(@Param() params: IdCropDto, @Body() dto: CreateCropInput) {
    return this.cropService.create(params.id_culture, dto);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: CropOutput })
  @Get(':id')
  @OwnerService(CropService)
  async findById(@Param() params: IdCropDto) {
    return this.cropService.findById(params.id!);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: CropOutput, isArray: true })
  @Get('')
  @OwnerService(CultureService, 'id_culture')
  async findByCulture(@Param('id_culture') idCulture: string) {
    return this.cropService.findByCulture(idCulture);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: CropOutput })
  @Patch(':id')
  @OwnerService(CropService)
  async update(@Param() params: IdCropDto, @Body() dto: UpdateCropInput) {
    return this.cropService.update(params.id!, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @Delete(':id')
  @OwnerService(CropService)
  async deleteById(@Param() params: IdCropDto) {
    return this.cropService.deleteById(params.id!);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @Delete('')
  @OwnerService(CultureService, 'id_culture')
  async deleteByCulture(@Param() params: IdCropDto) {
    return this.cropService.deleteByCulture(params.id_culture);
  }
}
