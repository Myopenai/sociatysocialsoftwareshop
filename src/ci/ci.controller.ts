import { Controller, Get, Post } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { MirrorService } from './mirror.service';
import { SettingsService } from '../settings/settings.service';

@Controller('fabrication-control')
export class CiController {
  constructor(
    private readonly pipeline: PipelineService,
    private readonly mirror: MirrorService,
    private readonly settings: SettingsService,
  ) {}

  @Get('status')
  status() {
    return {
      config: this.settings.get(),
      pipeline: this.pipeline.getStatus(),
      mirror: this.mirror.status(),
    };
  }

  @Post('run')
  async run() {
    return this.pipeline.runContinuousCheck({ reason: 'manual' });
  }

  @Post('reload-settings')
  reload() {
    return { config: this.settings.reload() };
  }
}
