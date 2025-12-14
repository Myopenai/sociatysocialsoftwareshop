import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './common/logger.service';
import { AllExceptionsFilter } from './common/exception.filter';
import { ValidationPipe } from '@nestjs/common';
import * as net from 'net';

async function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => {
      // Try the next port if this one is in use
      findAvailablePort(startPort + 1).then(resolve).catch(reject);
    });
    server.listen(startPort, () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });
  });
}

async function bootstrap() {
  try {
    const port = await findAvailablePort(3000);
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    const logger = app.get(AppLogger);
    
    // Set global prefix for all routes
    app.setGlobalPrefix('api');
    
    // Enable CORS for development
    app.enableCors();
    
    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: false,
      transform: true,
      forbidNonWhitelisted: false,
    }));
    
    // Global exception filter
    app.useGlobalFilters(new AllExceptionsFilter(logger));
    
    await app.listen(port);
    logger.log(`FABRIQUE is running on: http://localhost:${port}`);
    logger.log(`API Documentation available at: http://localhost:${port}/api`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
