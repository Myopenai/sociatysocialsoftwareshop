# Stop any running Node.js processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Create project directory if it doesn't exist
$projectDir = "D:\busineshuboffline CHATGTP\Fabrique\FABRIQUE"
New-Item -ItemType Directory -Path $projectDir -Force | Out-Null
Set-Location -Path $projectDir

# Setup Script for Fabrique API (No User Handling)
Write-Host " Starting Fabrique API Setup (No User Handling)..." -ForegroundColor Cyan
    "src",
    "src/common",
    "src/fabrication",
    "test",
    "public"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

# Create package.json
@"
{
  "name": "fabrique",
  "version": "1.0.0",
  "description": "Fabrication API",
  "main": "dist/main.js",
  "scripts": {
    "prebuild": "rimraf dist",
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@nestjs/common": "^9.0.0",
    "@nestjs/core": "^9.0.0",
    "@nestjs/platform-express": "^9.0.0",
    "@nestjs/serve-static": "^3.0.0",
    "class-validator": "^0.14.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^9.0.0",
    "@nestjs/schematics": "^9.0.0",
    "@nestjs/testing": "^9.0.0",
    "@types/express": "^4.17.13",
    "@types/jest": "28.1.4",
    "@types/node": "16.11.12",
    "@types/supertest": "^2.0.12",
    "jest": "28.1.2",
    "prettier": "^2.7.1",
    "source-map-support": "^0.5.20",
    "supertest": "^6.1.3",
    "ts-jest": "28.0.5",
    "ts-loader": "^9.3.1",
    "ts-node": "10.8.1",
    "tsconfig-paths": "4.1.0",
    "typescript": "^4.7.4"
  }
}
"@ | Out-File "package.json" -Encoding UTF8

# Create logger service
@"
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLogger {
  private readonly logger = new Logger('Fabrication');

  log(message: string, context?: string) {
    this.logger.log(message, context);
  }

  error(message: string, trace: string, context?: string) {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, context);
  }
}
"@ | Out-File "src/common/logger.service.ts" -Encoding UTF8

# Create exception filter
@"
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from './logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    this.logger.error(
      `Error: ${message}`,
      exception instanceof Error ? exception.stack : '',
      'ExceptionFilter',
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
"@ | Out-File "src/common/exception.filter.ts" -Encoding UTF8

# Create app module
@"
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FabricationModule } from './fabrication/fabrication.module';
import { AppLogger } from './common/logger.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api/*'],
    }),
    FabricationModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppLogger],
  exports: [AppLogger],
})
export class AppModule {}
"@ | Out-File "src/app.module.ts" -Encoding UTF8

# Create app controller
@"
import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return 'FABRIQUE API is running!';
  }

  @Get('api')
  getApiInfo() {
    return {
      name: 'Fabrication API',
      version: '1.0.0',
      endpoints: {
        status: '/api/fabrication/status',
        startJob: 'POST /api/fabrication/jobs/start',
        completeJob: 'POST /api/fabrication/jobs/:id/complete'
      }
    };
  }

  @Get('*')
  notFound(@Res() res: Response) {
    res.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Endpoint not found',
      error: 'Not Found'
    });
  }
}
"@ | Out-File "src/app.controller.ts" -Encoding UTF8

# Create app service
@"
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'FABRIQUE API is running!';
  }
}
"@ | Out-File "src/app.service.ts" -Encoding UTF8

# Create fabrication module
@"
import { Module } from '@nestjs/common';
import { FabricationService } from './fabrication.service';
import { FabricationController } from './fabrication.controller';

@Module({
  controllers: [FabricationController],
  providers: [FabricationService],
  exports: [FabricationService]
})
export class FabricationModule {}
"@ | Out-File "src/fabrication/fabrication.module.ts" -Encoding UTF8

# Create fabrication service
@"
import { Injectable } from '@nestjs/common';
import { AppLogger } from '../common/logger.service';

@Injectable()
export class FabricationService {
  private status = {
    operational: true,
    lastChecked: new Date().toISOString(),
    components: ['CNC', '3D Printer', 'Laser Cutter'],
    stats: {
      totalJobs: 0,
      completedJobs: 0,
      activeJobs: 0
    }
  };

  constructor(private readonly logger: AppLogger) {}

  getStatus() {
    const status = {
      ...this.status,
      uptime: process.uptime ? process.uptime() : 0,
      memoryUsage: process.memoryUsage ? process.memoryUsage() : {}
    };
    this.logger.log('Fabrication status checked', 'FabricationService');
    return status;
  }

  startJob(jobType: string) {
    this.status.stats.totalJobs++;
    this.status.stats.activeJobs++;
    const jobId = Date.now();
    this.logger.log(\`Job started: \${jobId} (Type: \${jobType})\`, 'FabricationService');
    return { jobId, jobType, status: 'started' };
  }

  completeJob(jobId: number) {
    this.status.stats.completedJobs++;
    this.status.stats.activeJobs = Math.max(0, this.status.stats.activeJobs - 1);
    this.logger.log(\`Job completed: \${jobId}\`, 'FabricationService');
    return { jobId, status: 'completed' };
  }
}
"@ | Out-File "src/fabrication/fabrication.service.ts" -Encoding UTF8

# Create fabrication controller
@"
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FabricationService } from './fabrication.service';

@Controller('api/fabrication')
export class FabricationController {
  constructor(private readonly fabricationService: FabricationService) {}

  @Get('status')
  getStatus() {
    return this.fabricationService.getStatus();
  }

  @Post('jobs/start')
  startJob(@Body() body: { type: string }) {
    if (!body || !body.type) {
      throw new Error('Job type is required');
    }
    return this.fabricationService.startJob(body.type);
  }

  @Post('jobs/:id/complete')
  completeJob(@Param('id') id: string) {
    return this.fabricationService.completeJob(Number(id));
  }
}
"@ | Out-File "src/fabrication/fabrication.controller.ts" -Encoding UTF8

# Create main.ts
@"
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './common/logger.service';
import { AllExceptionsFilter } from './common/exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  const logger = app.get(AppLogger);
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('api');
  
  await app.listen(3000);
  logger.log('FABRIQUE is running on: http://localhost:3000');
}
bootstrap();
"@ | Out-File "src/main.ts" -Encoding UTF8

# Create a simple HTML dashboard
$dashboardHtml = @"
<!DOCTYPE html>
<html>
<head>
    <title>Fabrication Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .online { background-color: #d4edda; }
        .offline { background-color: #f8d7da; }
        .jobs { margin-top: 20px; }
        .job { padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>Fabrication Dashboard</h1>
    <div id="status" class="status">Loading status...</div>
    <div>
        <button onclick="startJob()">Start New Job</button>
        <input type="text" id="jobType" placeholder="Job type" value="3D Print">
    </div>
    <div id="jobs" class="jobs"></div>

    <script>
        async function updateStatus() {
            try {
                const response = await fetch('/api/fabrication/status');
                const data = await response.json();
                document.getElementById('status').className = 'status ' + (data.operational ? 'online' : 'offline');
                document.getElementById('status').innerHTML = '<strong>Status:</strong> ' + (data.operational ? 'Online' : 'Offline') +
                    '<br><strong>Uptime:</strong> ' + Math.floor(data.uptime || 0) + 's' +
                    '<br><strong>Memory:</strong> ' + Math.round((data.memoryUsage.heapUsed / 1024 / 1024) * 100) / 100 + 'MB used';
            } catch (error) {
                document.getElementById('status').className = 'status offline';
                document.getElementById('status').innerHTML = 'Error fetching status';
                console.error('Error:', error);
            }
        }

        async function startJob() {
            const jobType = document.getElementById('jobType').value || '3D Print';
            try {
                const response = await fetch('/api/fabrication/jobs/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: jobType })
                });
                const result = await response.json();
                alert('Job started: ' + result.jobId);
                updateJobs();
            } catch (error) {
                console.error('Error starting job:', error);
                alert('Failed to start job');
            }
        }

        async function completeJob(jobId) {
            try {
                await fetch('/api/fabrication/jobs/' + jobId + '/complete', { method: 'POST' });
                updateJobs();
            } catch (error) {
                console.error('Error completing job:', error);
            }
        }

        async function updateJobs() {
            // In a real app, you would fetch jobs from an API endpoint
            // For now, we'll just show a message
            document.getElementById('jobs').innerHTML = '<p>Job history will appear here</p>';
        }

        // Update status every 5 seconds
        updateStatus();
        setInterval(updateStatus, 5000);
    </script>
</body>
</html>
"@

# Save the dashboard HTML
$dashboardPath = Join-Path $projectDir "public\index.html"
[System.IO.File]::WriteAllText($dashboardPath, $dashboardHtml, [System.Text.Encoding]::UTF8)

# Create tsconfig.json
@"
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "es2017",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "esModuleInterop": true
  }
}
"@ | Out-File "tsconfig.json" -Encoding UTF8

# Create jest-e2e.json
@"
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
"@ | Out-File "test/jest-e2e.json" -Encoding UTF8

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

# Build and start the application
Write-Host "`nStarting the application..." -ForegroundColor Cyan
npm run build
Start-Process "http://localhost:3000"
npm run start:dev