import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AppLogger } from '../src/common/logger.service';
import { FabricationModule } from '../src/fabrication/fabrication.module';
import { FabricationService } from '../src/fabrication/fabrication.service';
import supertest from 'supertest';

let app: INestApplication;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule, FabricationModule],
  })
    .overrideProvider(AppLogger)
    .useValue({
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      setContext: jest.fn(),
    })
    .overrideProvider(FabricationService)
    .useValue({
      getStatus: jest.fn().mockResolvedValue({
        operational: true,
        lastChecked: new Date().toISOString(),
        components: ['CNC', '3D Printer', 'Laser Cutter'],
        stats: {
          totalJobs: 0,
          completedJobs: 0,
          activeJobs: 0,
          failedJobs: 0
        },
        uptime: 0,
        memoryUsage: {},
        timestamp: new Date().toISOString()
      }),
      startJob: jest.fn().mockImplementation((type) => ({
        jobId: 1,
        jobType: type,
        status: 'started',
        startedAt: new Date().toISOString()
      })),
      completeJob: jest.fn().mockImplementation((id) => ({
        jobId: id,
        status: 'completed',
        completedAt: new Date().toISOString()
      }))
    })
    .compile();

  app = moduleFixture.createNestApplication();
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  
  await app.init();

  // Store app in global scope for tests
  global['app'] = app;
  global['request'] = supertest.agent(app.getHttpServer());
});

afterAll(async () => {
  if (app) {
    await app.close();
  }
});

// Helper function to get the test app
export const getApp = (): INestApplication => {
  if (!global['app']) {
    throw new Error('Test application not initialized');
  }
  return global['app'];
};

// Helper function to get the test request
export const getRequest = () => {
  if (!global['request']) {
    throw new Error('Test request not initialized');
  }
  return global['request'];
};
