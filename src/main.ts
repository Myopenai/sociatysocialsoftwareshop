import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './common/logger.service';
import { AllExceptionsFilter } from './common/exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { SettingsService } from './settings/settings.service';
import * as fs from 'fs';
import * as path from 'path';

function ensureDirs(dirs: string[]) {
  for (const d of dirs) {
    const p = path.resolve(process.cwd(), d);
    fs.mkdirSync(p, { recursive: true });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const logger = app.get(AppLogger);
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('api');

  // Self-healing runtime directories (settings, workspace, mirror, logs, ...)
  const settings = app.get(SettingsService);
  ensureDirs(settings.get().runtime.requiredDirs);

  await app.listen(3000);
  logger.log('FABRIQUE is running on: http://localhost:3000');
}
bootstrap();
