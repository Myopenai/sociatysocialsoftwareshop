import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  HttpStatus,
  HttpCode,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  NotImplementedException
} from '@nestjs/common';
import { FabricationService } from './fabrication.service';
import { isString, isNumberString } from 'class-validator';
import { AppLogger } from '../common/logger.service';

// Removed StartJobDto as we're using raw body parsing

@Controller('fabrication')
export class FabricationController {
  constructor(
    private readonly fabricationService: FabricationService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext('FabricationController');
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus() {
    try {
      this.logger.log('Fetching fabrication status');
      const status = await this.fabricationService.getStatus();
      return {
        success: true,
        data: status
      };
    } catch (error) {
      this.logger.error(`Failed to fetch fabrication status: ${error.message}`, error.stack);
      throw new InternalServerErrorException({
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve fabrication status',
        error: 'Internal Server Error'
      });
    }
  }

  @Post('jobs/start')
  async startJob(@Body() body: any) {
    // Input validation
    if (!body || typeof body !== 'object' || !body.type || typeof body.type !== 'string' || body.type.trim().length === 0) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Valid job type is required',
        error: 'Bad Request'
      });
    }

    try {
      const jobType = body.type.trim();
      this.logger.log(`Starting job of type: ${jobType}`);
      const result = await this.fabricationService.startJob(jobType);
      return result;
    } catch (error) {
      this.logger.error(`Failed to start job: ${error.message}`, error.stack);
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to start the job',
        error: 'Internal Server Error'
      });
    }
  }

  @Post('jobs/:id/complete')
  async completeJob(@Param('id') id: string) {
    // Input validation
    if (!isNumberString(id) || isNaN(parseInt(id, 10))) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid job ID format. Must be a number',
        error: 'Bad Request'
      });
    }

    const jobId = parseInt(id, 10);
    
    try {
      this.logger.log(`Attempting to complete job with ID: ${jobId}`);
      const result = await this.fabricationService.completeJob(jobId);
      
      if (!result) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Job with ID ${jobId} not found`,
          error: 'Not Found'
        });
      }
      
      this.logger.log(`Successfully completed job: ${jobId}`);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Failed to complete job ${jobId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to complete job ${jobId}`,
        error: 'Internal Server Error'
      });
    }
  }

  @Get('jobs')
  async listJobs() {
    try {
      this.logger.log('Fetching list of jobs');
      // This would call a service method to list all jobs
      // For now, returning a not implemented message
      throw new NotImplementedException('Job listing not implemented');
    } catch (error) {
      if (error instanceof NotImplementedException) {
        throw error;
      }
      
      this.logger.error(`Failed to list jobs: ${error.message}`, error.stack);
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve job list',
        error: 'Internal Server Error'
      });
    }
  }
}
