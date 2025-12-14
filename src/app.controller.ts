import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { PipelineService } from './ci/pipeline.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly pipeline: PipelineService,
  ) {}

  @Get()
  getHello(): string {
    return 'FABRIQUE API is running!';
  }

  // Human-friendly info endpoint (avoids /api/api duplication with global prefix)
  @Get('info')
  getApiInfo() {
    return {
      name: 'Fabrication API',
      version: this.appService.getVersion(),
      endpoints: {
        health: 'GET /api/health',
        info: 'GET /api/info',
        fabricationStatus: 'GET /api/fabrication/status',
        fabricationJobs: 'GET /api/fabrication/jobs',
        startJob: 'POST /api/fabrication/jobs/start',
        completeJob: 'POST /api/fabrication/jobs/:id/complete',
        fabricationControlStatus: 'GET /api/fabrication-control/status',
        fabricationControlRun: 'POST /api/fabrication-control/run',
        reloadSettings: 'POST /api/fabrication-control/reload-settings',
      },
    };
  }

  // System self-test endpoint: used by monitoring and self-healing logic
  @Get('health')
  health() {
    const status = this.pipeline.getStatus();
    // If pipeline last run failed, we still return 200 but indicate degraded mode.
    return {
      ok: true,
      mode: status.lastResult?.ok === false ? 'degraded' : 'normal',
      pipeline: status,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('*')
  notFound(@Res() res: Response) {
    res.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Endpoint not found',
      error: 'Not Found',
    });
  }
}
