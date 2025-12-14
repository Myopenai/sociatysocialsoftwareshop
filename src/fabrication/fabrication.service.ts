import { Injectable } from '@nestjs/common';
import { AppLogger } from '../common/logger.service';

@Injectable()
export class FabricationService {
  private status = {
    operational: true,
    lastChecked: new Date().toISOString(),
    components: ['CNC', '3D Printer', 'Laser Cutter'],
    stats: {
      totalJobs: 0,
      completedJobs: 0,
      activeJobs: 0
    }
  };

  constructor(private readonly logger: AppLogger) {}

  getStatus() {
    const status = {
      ...this.status,
      uptime: process.uptime ? process.uptime() : 0,
      memoryUsage: process.memoryUsage ? process.memoryUsage() : {}
    };
    this.logger.log('Fabrication status checked', 'FabricationService');
    return status;
  }

  startJob(jobType: string) {
    this.status.stats.totalJobs++;
    this.status.stats.activeJobs++;
    const jobId = Date.now();
    this.logger.log(`Job started: ${jobId} (Type: ${jobType})`, 'FabricationService');
    return { jobId, jobType, status: 'started' };
  }

  completeJob(jobId: number) {
    this.status.stats.completedJobs++;
    this.status.stats.activeJobs = Math.max(0, this.status.stats.activeJobs - 1);
    this.logger.log(`Job completed: ${jobId}`, 'FabricationService');
    return { jobId, status: 'completed' };
  }
}
