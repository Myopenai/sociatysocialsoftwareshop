import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FabricationService } from './fabrication.service';

@Controller('api/fabrication')
export class FabricationController {
  constructor(private readonly fabricationService: FabricationService) {}

  @Get('status')
  getStatus() {
    return this.fabricationService.getStatus();
  }

  @Post('jobs/start')
  startJob(@Body() body: { type: string }) {
    if (!body || !body.type) {
      throw new Error('Job type is required');
    }
    return this.fabricationService.startJob(body.type);
  }

  @Post('jobs/:id/complete')
  completeJob(@Param('id') id: string) {
    return this.fabricationService.completeJob(Number(id));
  }
}
