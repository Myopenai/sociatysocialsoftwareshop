import { Module } from '@nestjs/common';
import { FabricationService } from './fabrication.service';
import { FabricationController } from './fabrication.controller';
import { AppLogger } from '../common/logger.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [FabricationController],
  providers: [
    FabricationService,
    {
      provide: AppLogger,
      useValue: {
        log: (message: string) => console.log(`[Fabrication] ${message}`),
        error: (message: string, trace?: string) => console.error(`[Fabrication] ${message}`, trace || ''),
        warn: (message: string) => console.warn(`[Fabrication] ${message}`),
        debug: (message: string) => console.debug(`[Fabrication] ${message}`),
        verbose: (message: string) => console.log(`[Fabrication] ${message}`),
        setContext: (context: string) => {}
      }
    }
  ],
  exports: [FabricationService]
})
export class FabricationModule {}
