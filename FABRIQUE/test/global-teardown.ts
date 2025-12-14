import { INestApplication } from '@nestjs/common';

declare const global: typeof globalThis & {
  __APP__: INestApplication;
};

export default async (): Promise<void> => {
  if (global.__APP__) {
    await global.__APP__.close();
  }
  // Add any additional cleanup here
  process.env.NODE_ENV = 'test';
};
