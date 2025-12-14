import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { AppLogger } from '../src/common/logger.service';
import { getRequest } from './test-setup.e2e';

describe('AppController (e2e)', () => {
  let request: ReturnType<typeof getRequest>;

  beforeAll(() => {
    request = getRequest();
  });

  describe('GET /api', () => {
    it('should return API information', async () => {
      const response = await request.get('/api').expect(200);
      // The API returns a simple string response
      expect(response.text).toContain('FABRIQUE API is running!');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request.get('/api/health').expect(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Non-existent routes', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request.get('/api/non-existent-route').expect(404);
      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty('message', 'Endpoint not found');
    });
  });
});
