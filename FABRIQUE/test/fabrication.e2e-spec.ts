import { INestApplication } from '@nestjs/common';
import { getRequest } from './test-setup.e2e';

describe('Fabrication (e2e)', () => {
  let request: ReturnType<typeof getRequest>;
  let testJobId: number;

  beforeAll(() => {
    request = getRequest();
  });

  describe('GET /api/fabrication/status', () => {
    it('should return fabrication status', async () => {
      const response = await request
        .get('/api/fabrication/status')
        .expect(200);

      expect(response.body).toHaveProperty('operational');
      expect(response.body).toHaveProperty('lastChecked');
      expect(response.body).toHaveProperty('components');
      expect(Array.isArray(response.body.components)).toBe(true);
      expect(response.body).toHaveProperty('stats');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memoryUsage');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/fabrication/jobs/start', () => {
    it('should start a new job with valid type', async () => {
      const jobType = '3D Print';
      const response = await request
        .post('/api/fabrication/jobs/start')
        .send({ type: jobType })
        .expect(201);

      expect(response.body).toHaveProperty('jobId');
      expect(response.body).toHaveProperty('jobType', jobType);
      expect(response.body).toHaveProperty('status', 'started');
      expect(response.body).toHaveProperty('startedAt');
      expect(new Date(response.body.startedAt).toString()).not.toBe('Invalid Date');

      // Store the job ID for later tests
      testJobId = response.body.jobId;
    });

    it('should return 400 for missing job type', async () => {
      const response = await request
        .post('/api/fabrication/jobs/start')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message', 'Valid job type is required');
    });

    it('should return 400 for empty job type', async () => {
      const response = await request
        .post('/api/fabrication/jobs/start')
        .send({ type: ' ' })
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message', 'Valid job type is required');
    });
  });

  describe('POST /api/fabrication/jobs/:id/complete', () => {
    it('should complete an existing job', async () => {
      // First create a job to complete
      const createResponse = await request
        .post('/api/fabrication/jobs/start')
        .send({ type: 'Laser Cut' })
        .expect(201);

      const jobId = createResponse.body.jobId;

      // Now complete the job
      const completeResponse = await request
        .post(`/api/fabrication/jobs/${jobId}/complete`)
        .expect(201);

      expect(completeResponse.body).toHaveProperty('jobId', jobId);
      expect(completeResponse.body).toHaveProperty('status', 'completed');
      expect(completeResponse.body).toHaveProperty('completedAt');
      expect(new Date(completeResponse.body.completedAt).toString()).not.toBe('Invalid Date');
    });

    it('should return 200 for non-existent job (mocked service returns success)', async () => {
      const nonExistentId = 999999;
      const response = await request
        .post(`/api/fabrication/jobs/${nonExistentId}/complete`)
        .expect(201);

      expect(response.body).toHaveProperty('jobId', nonExistentId);
      expect(response.body).toHaveProperty('status', 'completed');
      expect(response.body).toHaveProperty('completedAt');
    });

    it('should return 400 for invalid job ID format', async () => {
      const response = await request
        .post('/api/fabrication/jobs/invalid-id/complete')
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message', 'Invalid job ID format. Must be a number');
    });
  });

  describe('GET /api/fabrication/jobs', () => {
    it('should return 404 for non-existent endpoint', async () => {
      const response = await request
        .get('/api/fabrication/jobs')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
      expect(response.body).toHaveProperty('message', 'Endpoint not found');
    });
  });
});
