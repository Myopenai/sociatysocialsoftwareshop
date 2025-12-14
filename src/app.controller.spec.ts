import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PipelineService } from './ci/pipeline.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PipelineService,
          useValue: { getStatus: () => ({ running: false, lastResult: null }) },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "FABRIQUE API is running!"', () => {
      expect(appController.getHello()).toBe('FABRIQUE API is running!');
    });
  });
});
