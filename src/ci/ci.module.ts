import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { CiController } from './ci.controller';
import { WatchdogService } from './watchdog.service';
import { PipelineService } from './pipeline.service';
import { MirrorService } from './mirror.service';

@Module({
  imports: [SettingsModule],
  controllers: [CiController],
  providers: [WatchdogService, PipelineService, MirrorService],
  exports: [PipelineService, MirrorService],
})
export class CiModule {}
