import { Module } from '@nestjs/common';
import { CultureController } from './controller';
import { CultureService } from './service';
import { CultureContract } from './contract';
import { CultureRepository } from './repository';

@Module({
  controllers: [CultureController],
  providers: [
    CultureService,
    { provide: CultureContract, useClass: CultureRepository },
  ],
})
export class CultureModule {}
