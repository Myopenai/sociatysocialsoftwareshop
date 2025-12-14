import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotFoundException } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "FABRIQUE API is running!"', () => {
      expect(appController.getHello()).toBe('FABRIQUE API is running!');
    });
  });

  describe('getApiInfo', () => {
    it('should return API information', () => {
      const result = appController.getApiInfo();
      expect(result).toHaveProperty('name', 'Fabrication API');
      expect(result).toHaveProperty('version');
      expect(result.endpoints).toHaveProperty('health');
      expect(result.endpoints).toHaveProperty('status');
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('notFound', () => {
    it('should throw NotFoundException', () => {
      expect(() => appController.notFound()).toThrow(NotFoundException);
    });
  });
});
