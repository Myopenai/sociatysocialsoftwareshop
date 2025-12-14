import { Controller, Get, HttpStatus, NotFoundException, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly startTime: Date;

  constructor(private readonly appService: AppService) {
    this.startTime = new Date();
  }

  @Get()
  getHello() {
    return {
      status: 'success',
      message: 'Fabrication API is running!',
      documentation: '/api',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
  }

  @Get('api')
  getApiInfo() {
    return {
      status: 'success',
      data: {
        name: 'Fabrication API',
        version: '1.0.0',
        uptime: this.getUptime(),
        endpoints: {
          health: {
            method: 'GET',
            path: '/health',
            description: 'Check API health status'
          },
          apiInfo: {
            method: 'GET',
            path: '/api',
            description: 'Get API documentation and available endpoints'
          },
          fabrication: {
            status: {
              method: 'GET',
              path: '/api/fabrication/status',
              description: 'Get fabrication system status'
            },
            startJob: {
              method: 'POST',
              path: '/api/fabrication/jobs/start',
              description: 'Start a new fabrication job'
            },
            completeJob: {
              method: 'POST',
              path: '/api/fabrication/jobs/:id/complete',
              description: 'Mark a job as completed'
            },
            listJobs: {
              method: 'GET',
              path: '/api/fabrication/jobs',
              description: 'List all fabrication jobs'
            }
          }
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'success',
      data: {
        status: 'ok',
        uptime: this.getUptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version
      }
    };
  }

  @Get('*')
  notFound(@Req() req: Request, @Res() res: Response) {
    res.status(HttpStatus.NOT_FOUND).json({
      status: 'error',
      error: {
        code: 'ENDPOINT_NOT_FOUND',
        message: `Cannot ${req.method} ${req.url}`,
        path: req.url,
        timestamp: new Date().toISOString()
      }
    });
  }

  private getUptime(): string {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
}
