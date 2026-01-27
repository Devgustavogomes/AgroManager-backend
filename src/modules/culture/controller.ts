import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CultureService } from './service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { RolesGuards } from 'src/shared/guards/roles.guard';
import { OwnerGuard } from 'src/shared/guards/owner.guard';
import { OwnerService } from 'src/shared/decorators/owner.decorator';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import {
  CreateCultureInput,
  CultureOutput,
  IdCultureDto,
  UpdateCultureInput,
} from './dto';
import { PropertyService } from '../property/service';

@Controller(':id_property/cultures')
@UseGuards(AuthGuard, RolesGuards, OwnerGuard)
export class CultureController {
  constructor(private readonly cultureService: CultureService) {}

  @ApiBearerAuth()
  @ApiOkResponse({ type: CultureOutput })
  @Get(':id')
  @OwnerService(CultureService)
  async findById(@Param() params: IdCultureDto) {
    return await this.cultureService.findById(params.id!);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: CultureOutput })
  @Post()
  @OwnerService(PropertyService, 'id_property')
  async create(@Param() params: IdCultureDto, @Body() dto: CreateCultureInput) {
    return await this.cultureService.create(params.id_property, dto);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: CultureOutput })
  @Patch(':id')
  @OwnerService(PropertyService)
  async update(@Param() params: IdCultureDto, @Body() dto: UpdateCultureInput) {
    return await this.cultureService.update(params.id!, dto);
  }

  @ApiBearerAuth()
  @Delete()
  @OwnerService(PropertyService)
  async delete(@Param() params: IdCultureDto) {
    return await this.cultureService.delete(params.id!);
  }
}
