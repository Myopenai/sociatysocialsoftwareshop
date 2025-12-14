import { Injectable, NotFoundException } from '@nestjs/common';
import { AppLogger } from '../common/logger.service';

export interface Job {
  jobId: number;
  jobType: string;
  status: 'started' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
}

@Injectable()
export class FabricationService {
  private status = {
    operational: true,
    lastChecked: new Date().toISOString(),
    components: ['CNC', '3D Printer', 'Laser Cutter'],
    stats: {
      totalJobs: 0,
      completedJobs: 0,
      activeJobs: 0,
      failedJobs: 0
    }
  };

  private jobs: Map<number, Job> = new Map();

  constructor(private readonly logger: AppLogger) {
    this.logger.setContext('FabricationService');
  }

  getStatus() {
    try {
      const status = {
        status: 'operational',
        components: ['CNC', '3D Printer', 'Laser Cutter'],
        stats: {
          totalJobs: this.status.stats.totalJobs,
          completedJobs: this.status.stats.completedJobs,
          activeJobs: this.status.stats.activeJobs,
          failedJobs: this.status.stats.failedJobs
        },
        uptime: process.uptime ? Math.floor(process.uptime()) : 0,
        memoryUsage: process.memoryUsage ? {
          rss: process.memoryUsage().rss / 1024 / 1024,
          heapTotal: process.memoryUsage().heapTotal / 1024 / 1024,
          heapUsed: process.memoryUsage().heapUsed / 1024 / 1024,
          external: process.memoryUsage().external / 1024 / 1024
        } : {},
        timestamp: new Date().toISOString(),
        lastChecked: new Date().toISOString()
      };
      
      this.status.lastChecked = status.timestamp;
      this.logger.log('Fabrication status checked');
      
      return { data: status };
    } catch (error) {
      this.logger.error('Failed to get fabrication status', error.stack);
      throw error;
    }
  }

  startJob(jobType: string) {
    try {
      if (!jobType || typeof jobType !== 'string' || jobType.trim().length === 0) {
        throw new Error('Invalid job type');
      }

      const jobId = Date.now();
      const job: Job = {
        jobId,
        jobType: jobType.trim(),
        status: 'started',
        startedAt: new Date().toISOString()
      };

      this.status.stats.totalJobs++;
      this.status.stats.activeJobs++;
      this.jobs.set(jobId, job);

      this.logger.log(`Job started: ${job.jobType} (ID: ${jobId})`);
      return job;
    } catch (error) {
      this.status.stats.failedJobs++;
      this.logger.error(`Failed to start job: ${error.message}`, error.stack);
      throw error;
    }
  }

  completeJob(jobId: number) {
    try {
      if (!this.jobs.has(jobId)) {
        throw new NotFoundException(`Job with ID ${jobId} not found`);
      }

      const job = this.jobs.get(jobId);
      if (job.status === 'completed') {
        this.logger.warn(`Job ${jobId} is already completed`);
        return job;
      }

      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      
      this.status.stats.completedJobs++;
      this.status.stats.activeJobs = Math.max(0, this.status.stats.activeJobs - 1);
      
      this.jobs.set(jobId, job);
      this.logger.log(`Job completed: ${jobId}`);
      
      return job;
    } catch (error) {
      this.status.stats.failedJobs++;
      this.logger.error(`Failed to complete job ${jobId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  getJob(jobId: number): Job | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }
}
