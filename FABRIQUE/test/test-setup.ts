import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AppLogger } from '../src/common/logger.service';
import supertest from 'supertest';

declare global {
  // eslint-disable-next-line no-var
  var app: INestApplication;
  // eslint-disable-next-line no-var
  var request: supertest.SuperTest<supertest.Test>;
}

let app: INestApplication;
let moduleFixture: TestingModule;

beforeAll(async () => {
  moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
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
    .compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  // Store app in global scope for tests
  global.app = app;
  global.request = supertest.agent(app.getHttpServer());
});

afterAll(async () => {
  await app.close();
});
