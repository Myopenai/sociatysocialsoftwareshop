import { Module } from '@nestjs/common';
import { FabricationService } from './fabrication.service';
import { FabricationController } from './fabrication.controller';
import { AppLogger } from '../common/logger.service';

@Module({
  controllers: [FabricationController],
  providers: [FabricationService, AppLogger],
  exports: [FabricationService]
})
export class FabricationModule {}
