import { Module } from '@nestjs/common';
import { FabricationService } from './fabrication.service';
import { FabricationController } from './fabrication.controller';

@Module({
  controllers: [FabricationController],
  providers: [FabricationService],
  exports: [FabricationService]
})
export class FabricationModule {}
