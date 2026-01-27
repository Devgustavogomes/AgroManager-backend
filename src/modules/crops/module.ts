import { Module } from '@nestjs/common';
import { CropController } from './controller';
import { CropService } from './service';
import { CropContract } from './contract';
import { CropRepository } from './repository';

@Module({
  controllers: [CropController],
  providers: [CropService, { provide: CropContract, useClass: CropRepository }],
})
export class CropModule {}
