import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FabricationModule } from './fabrication/fabrication.module';
import { AppLogger } from './common/logger.service';
import { SettingsModule } from './settings/settings.module';
import { CiModule } from './ci/ci.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api/*'],
    }),
    SettingsModule,
    CiModule,
    FabricationModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppLogger],
  exports: [AppLogger],
})
export class AppModule {}
